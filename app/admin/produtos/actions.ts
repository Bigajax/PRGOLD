"use server";

import { updateTag } from "next/cache";
import { z } from "zod";
import {
  BUCKET_IMAGENS,
  MAX_FOTOS,
  MAX_UPLOAD_BYTES,
  MIME_PERMITIDOS,
} from "@/config/catalogo";
import { requireUser } from "@/lib/supabase/server";
import { slugify } from "@/lib/slug";
import { DEMO_MODE, TAG_CATALOGO } from "@/services/supabase";
import type { ActionResult } from "@/types";

/**
 * Server Actions de produto.
 *
 * Padrão de TODAS elas, sem exceção:
 *   1. requireUser()  — sessão é revalidada aqui, não só na tela
 *   2. Zod            — nada entra no banco sem passar por um schema
 *   3. escrita        — a RLS é a segunda camada, não a única
 *   4. updateTag()    — a vitrine reflete a mudança na hora
 *   5. { ok, error }  — a UI nunca recebe exceção crua
 *
 * `updateTag` (e não `revalidateTag`) porque o lojista precisa ver o que
 * acabou de salvar: read-your-own-writes. `revalidateTag` serviria conteúdo
 * velho enquanto revalida em segundo plano, e ele acharia que não salvou.
 */

const AVISO_DEMO =
  "Banco de dados não configurado: nada foi salvo. Veja supabase/README.md.";

const numeroOpcional = z
  .union([z.number(), z.nan(), z.null()])
  .optional()
  .transform((v) => (typeof v === "number" && Number.isFinite(v) ? v : null));

const textoOpcional = (max: number) =>
  z
    .union([z.string(), z.null()])
    .optional()
    .transform((v) => {
      const t = typeof v === "string" ? v.trim() : "";
      return t.length ? t.slice(0, max) : null;
    });

const imagemSchema = z.object({
  url: z.url("Endereço de imagem inválido."),
  alt: textoOpcional(160),
});

export const produtoSchema = z
  .object({
    id: z.uuid().optional(),
    name: z.string().trim().min(3, "O nome precisa de pelo menos 3 caracteres."),
    code: z.string().trim().min(2, "Informe um código.").max(40),
    shortDescription: textoOpcional(240),
    fullDescription: textoOpcional(2000),
    categoryId: z.union([z.uuid(), z.literal("")]).optional(),
    collectionId: z.union([z.uuid(), z.literal("")]).optional(),
    gender: z.enum(["feminino", "masculino", "unissex"]).optional().or(z.literal("")),
    material: textoOpcional(80),
    goldType: z.enum(["amarelo", "branco", "rose"]).optional().or(z.literal("")),
    karat: numeroOpcional,
    weightG: numeroOpcional,
    dimensions: textoOpcional(120),
    stones: textoOpcional(120),
    price: numeroOpcional,
    promoPrice: numeroOpcional,
    priceOnRequest: z.boolean(),
    stockQuantity: numeroOpcional,
    lowStockThreshold: numeroOpcional,
    readyToShip: z.boolean(),
    madeToOrder: z.boolean(),
    featured: z.boolean(),
    newArrival: z.boolean(),
    exclusive: z.boolean(),
    active: z.boolean(),
    position: numeroOpcional,
    seoTitle: textoOpcional(70),
    seoDescription: textoOpcional(180),
    images: z.array(imagemSchema).max(MAX_FOTOS, `No máximo ${MAX_FOTOS} fotos por peça.`),
  })
  .superRefine((d, ctx) => {
    // Oferta invertida é erro de cadastro, não decisão comercial.
    if (d.promoPrice !== null && d.price !== null && d.promoPrice >= d.price) {
      ctx.addIssue({
        code: "custom",
        path: ["promoPrice"],
        message: "O preço promocional precisa ser MENOR que o preço cheio.",
      });
    }
    if (d.promoPrice !== null && d.price === null) {
      ctx.addIssue({
        code: "custom",
        path: ["price"],
        message: "Para ter preço promocional, informe também o preço cheio.",
      });
    }
    if (!d.priceOnRequest && d.price === null) {
      ctx.addIssue({
        code: "custom",
        path: ["price"],
        message: "Informe o preço ou marque “valor sob consulta”.",
      });
    }
  });

export type ProdutoEntrada = z.input<typeof produtoSchema>;

function traduz(mensagem: string): string {
  if (/duplicate key|already exists|unique/i.test(mensagem)) {
    return "Já existe uma peça com este código ou endereço. Escolha outro código.";
  }
  if (/violates check constraint/i.test(mensagem)) {
    return "Algum valor está fora do permitido. Confira preço, peso e estoque.";
  }
  if (/row-level security|permission denied/i.test(mensagem)) {
    return "Sua conta não tem permissão de administrador. Confira a tabela admin_profiles.";
  }
  if (/jwt|session|token/i.test(mensagem)) {
    return "Sessão expirada. Entre novamente no painel.";
  }
  return "Não foi possível salvar. Tente novamente em instantes.";
}

/** Gera um slug único a partir do nome, sufixando quando já existe. */
async function slugUnico(
  db: Awaited<ReturnType<typeof requireUser>>["db"],
  nome: string,
  idAtual?: string
): Promise<string> {
  const base = slugify(nome) || "peca";
  for (let i = 0; i < 50; i++) {
    const candidato = i === 0 ? base : `${base}-${i + 1}`;
    const { data } = await db
      .from("products")
      .select("id")
      .eq("slug", candidato)
      .maybeSingle();
    if (!data || data.id === idAtual) return candidato;
  }
  return `${base}-${Date.now()}`;
}

export async function salvarProduto(entrada: unknown): Promise<ActionResult> {
  try {
    if (DEMO_MODE) return { ok: false, error: AVISO_DEMO };

    const { db } = await requireUser();
    const d = produtoSchema.parse(entrada);

    const slug = await slugUnico(db, d.name, d.id);

    const payload = {
      slug,
      code: d.code,
      name: d.name,
      short_description: d.shortDescription,
      full_description: d.fullDescription,
      category_id: d.categoryId || null,
      collection_id: d.collectionId || null,
      gender: d.gender || null,
      material: d.material,
      gold_type: d.goldType || null,
      karat: d.karat,
      weight_g: d.weightG,
      dimensions: d.dimensions,
      stones: d.stones,
      price: d.price,
      promo_price: d.promoPrice,
      price_on_request: d.priceOnRequest,
      stock_quantity: d.stockQuantity,
      low_stock_threshold: d.lowStockThreshold,
      ready_to_ship: d.readyToShip,
      made_to_order: d.madeToOrder,
      featured: d.featured,
      new_arrival: d.newArrival,
      exclusive: d.exclusive,
      active: d.active,
      position: d.position ?? 0,
      seo_title: d.seoTitle,
      seo_description: d.seoDescription,
    };

    let produtoId = d.id;

    if (produtoId) {
      const { error } = await db.from("products").update(payload).eq("id", produtoId);
      if (error) throw new Error(error.message);
    } else {
      const { data, error } = await db
        .from("products")
        .insert(payload)
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      produtoId = data.id as string;
    }

    // Fotos: substitui a lista inteira. O delete SEMPRE filtra por product_id —
    // apagar por id de imagem sozinho permitiria remover foto de outra peça
    // com um payload forjado.
    await db.from("product_images").delete().eq("product_id", produtoId);

    if (d.images.length > 0) {
      const { error } = await db.from("product_images").insert(
        d.images.map((img, i) => ({
          product_id: produtoId,
          url: img.url,
          alt: img.alt,
          position: i,
        }))
      );
      if (error) throw new Error(error.message);
    }

    updateTag(TAG_CATALOGO);
    return { ok: true };
  } catch (erro) {
    if (erro instanceof z.ZodError) {
      return { ok: false, error: erro.issues[0]?.message ?? "Confira os campos." };
    }
    return { ok: false, error: traduz(erro instanceof Error ? erro.message : "") };
  }
}

export async function alternarAtivo(id: string, ativo: boolean): Promise<ActionResult> {
  try {
    if (DEMO_MODE) return { ok: false, error: AVISO_DEMO };
    const { db } = await requireUser();
    z.uuid().parse(id);

    const { error } = await db.from("products").update({ active: ativo }).eq("id", id);
    if (error) throw new Error(error.message);

    updateTag(TAG_CATALOGO);
    return { ok: true };
  } catch (erro) {
    return { ok: false, error: traduz(erro instanceof Error ? erro.message : "") };
  }
}

/**
 * Arquivar em vez de excluir.
 *
 * Arquivar também força `active = false`: uma peça que sai de linha não pode
 * continuar visível por esquecimento. Restaurar devolve OCULTA, nunca direto
 * ao ar — o viés é sempre o mais seguro.
 */
export async function arquivarProduto(id: string): Promise<ActionResult> {
  try {
    if (DEMO_MODE) return { ok: false, error: AVISO_DEMO };
    const { db } = await requireUser();
    z.uuid().parse(id);

    const { error } = await db
      .from("products")
      .update({ archived_at: new Date().toISOString(), active: false })
      .eq("id", id);
    if (error) throw new Error(error.message);

    updateTag(TAG_CATALOGO);
    return { ok: true };
  } catch (erro) {
    return { ok: false, error: traduz(erro instanceof Error ? erro.message : "") };
  }
}

export async function restaurarProduto(id: string): Promise<ActionResult> {
  try {
    if (DEMO_MODE) return { ok: false, error: AVISO_DEMO };
    const { db } = await requireUser();
    z.uuid().parse(id);

    const { error } = await db
      .from("products")
      .update({ archived_at: null, active: false })
      .eq("id", id);
    if (error) throw new Error(error.message);

    updateTag(TAG_CATALOGO);
    return {
      ok: true,
      warnings: ["A peça voltou como oculta. Publique quando estiver pronta."],
    };
  } catch (erro) {
    return { ok: false, error: traduz(erro instanceof Error ? erro.message : "") };
  }
}

export async function excluirProduto(id: string): Promise<ActionResult> {
  try {
    if (DEMO_MODE) return { ok: false, error: AVISO_DEMO };
    const { db } = await requireUser();
    z.uuid().parse(id);

    const { error } = await db.from("products").delete().eq("id", id);
    if (error) throw new Error(error.message);

    updateTag(TAG_CATALOGO);
    return { ok: true };
  } catch (erro) {
    return { ok: false, error: traduz(erro instanceof Error ? erro.message : "") };
  }
}

/**
 * Duplicar: a cópia nasce OCULTA, com estoque zerado e sem os selos de
 * destaque. Copiar fotos e texto economiza trabalho; copiar "em destaque" e
 * estoque publicaria uma peça que não existe.
 */
export async function duplicarProduto(id: string): Promise<ActionResult> {
  try {
    if (DEMO_MODE) return { ok: false, error: AVISO_DEMO };
    const { db } = await requireUser();
    z.uuid().parse(id);

    const { data: original, error: erroLeitura } = await db
      .from("products")
      .select("*, product_images(url, alt, position)")
      .eq("id", id)
      .single();
    if (erroLeitura) throw new Error(erroLeitura.message);

    const nome = `${original.name} (cópia)`;
    const slug = await slugUnico(db, nome);
    const sufixo = Date.now().toString(36).slice(-4).toUpperCase();

    const { product_images, id: _ignora, created_at, updated_at, ...resto } = original;
    void _ignora;
    void created_at;
    void updated_at;

    const { data: novo, error } = await db
      .from("products")
      .insert({
        ...resto,
        name: nome,
        slug,
        code: `${original.code}-${sufixo}`,
        active: false,
        featured: false,
        new_arrival: false,
        exclusive: false,
        stock_quantity: null,
        archived_at: null,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);

    const imagens = (product_images ?? []) as { url: string; alt: string | null; position: number }[];
    if (imagens.length > 0) {
      await db.from("product_images").insert(
        imagens.map((img) => ({
          product_id: novo.id,
          url: img.url,
          alt: img.alt,
          position: img.position,
        }))
      );
    }

    updateTag(TAG_CATALOGO);
    return {
      ok: true,
      warnings: ["A cópia foi criada oculta, sem estoque e sem selos de destaque."],
    };
  } catch (erro) {
    return { ok: false, error: traduz(erro instanceof Error ? erro.message : "") };
  }
}

/**
 * Upload de foto.
 *
 * Roda com a SESSÃO DO ADMINISTRADOR (política de Storage da migration 0004),
 * não com a service role — é o que permite manter a chave secreta fora do
 * servidor de produção.
 *
 * Tamanho e tipo são validados aqui, no servidor. O `accept` do input é
 * conveniência para quem escolhe o arquivo, não segurança.
 */
export async function enviarFoto(
  formData: FormData
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  try {
    if (DEMO_MODE) {
      return {
        ok: false,
        error: "Sem banco configurado. Cole o endereço de uma imagem no campo ao lado.",
      };
    }

    const { db } = await requireUser();
    const arquivo = formData.get("arquivo");
    const slug = String(formData.get("slug") ?? "peca");

    if (!(arquivo instanceof File) || arquivo.size === 0) {
      return { ok: false, error: "Nenhuma imagem selecionada." };
    }
    if (arquivo.size > MAX_UPLOAD_BYTES) {
      return { ok: false, error: "A imagem precisa ter no máximo 8 MB." };
    }
    if (!(MIME_PERMITIDOS as readonly string[]).includes(arquivo.type)) {
      return { ok: false, error: "Envie JPG, PNG, WebP ou AVIF. SVG não é aceito." };
    }

    // Nome gerado no servidor: nome original de usuário é vetor de travessia
    // de caminho e de colisão.
    const extensao = arquivo.type.split("/")[1]?.replace("jpeg", "jpg") ?? "jpg";
    const nome = `produtos/${Date.now()}-${slugify(slug) || "peca"}.${extensao}`;

    const { error } = await db.storage.from(BUCKET_IMAGENS).upload(nome, arquivo, {
      cacheControl: "31536000",
      contentType: arquivo.type,
    });
    if (error) throw new Error(error.message);

    const { data } = db.storage.from(BUCKET_IMAGENS).getPublicUrl(nome);
    return { ok: true, url: data.publicUrl };
  } catch (erro) {
    const m = erro instanceof Error ? erro.message : "";
    if (/bucket|not found/i.test(m)) {
      return {
        ok: false,
        error: "Armazenamento não configurado. Rode a migration 0004 ou cole o endereço da imagem.",
      };
    }
    return { ok: false, error: "Não foi possível enviar a imagem. Você pode colar o endereço dela." };
  }
}
