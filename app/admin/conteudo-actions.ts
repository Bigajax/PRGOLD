"use server";

import { updateTag } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/supabase/server";
import { slugify } from "@/lib/slug";
import { DEMO_MODE, TAG_CATALOGO, TAG_CONFIG, TAG_CONTEUDO } from "@/services/supabase";
import { CUSTOM_REQUEST_STATUSES, type ActionResult } from "@/types";

/**
 * Actions das telas de conteúdo: categorias, coleções, banners, solicitações e
 * configurações.
 *
 * Mesmo padrão das actions de produto: sessão -> Zod -> escrita -> updateTag ->
 * `{ ok, error }`.
 */

const AVISO_DEMO =
  "Banco de dados não configurado: nada foi salvo. Veja supabase/README.md.";

function traduz(m: string): string {
  if (/duplicate key|unique/i.test(m))
    return "Já existe um registro com esse endereço (slug). Escolha outro nome.";
  if (/row-level security|permission denied/i.test(m))
    return "Sua conta não tem permissão de administrador. Confira a tabela admin_profiles.";
  if (/jwt|session|token/i.test(m)) return "Sessão expirada. Entre novamente no painel.";
  if (/violates check constraint/i.test(m))
    return "Algum valor está fora do permitido. Confira as datas e a ordem.";
  return "Não foi possível salvar. Tente novamente em instantes.";
}

const opcional = (max: number) =>
  z
    .union([z.string(), z.null()])
    .optional()
    .transform((v) => {
      const t = typeof v === "string" ? v.trim() : "";
      return t.length ? t.slice(0, max) : null;
    });

/* ── Categorias e coleções ──────────────────────────────────────────────── */

const taxonomiaSchema = z.object({
  id: z.uuid().optional(),
  name: z.string().trim().min(2, "O nome precisa de pelo menos 2 caracteres.").max(80),
  description: opcional(240),
  image: opcional(500),
  bannerDesktop: opcional(500),
  bannerMobile: opcional(500),
  position: z.number().int().min(0).default(0),
  active: z.boolean(),
});

export async function salvarTaxonomia(
  tabela: "categories" | "collections",
  entrada: unknown
): Promise<ActionResult> {
  try {
    if (DEMO_MODE) return { ok: false, error: AVISO_DEMO };
    const { db } = await requireUser();
    const d = taxonomiaSchema.parse(entrada);

    const base: Record<string, unknown> = {
      name: d.name,
      description: d.description,
      image: d.image,
      position: d.position,
      active: d.active,
    };

    if (tabela === "collections") {
      base.banner_desktop = d.bannerDesktop;
      base.banner_mobile = d.bannerMobile;
    }

    if (d.id) {
      // O slug NÃO é reescrito ao renomear: a URL pode estar num anúncio ou na
      // bio do Instagram. Trocar slug é decisão consciente, não efeito
      // colateral de corrigir um acento no nome.
      const { error } = await db.from(tabela).update(base).eq("id", d.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await db
        .from(tabela)
        .insert({ ...base, slug: slugify(d.name) || `item-${Date.now()}` });
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

export async function excluirTaxonomia(
  tabela: "categories" | "collections",
  id: string
): Promise<ActionResult> {
  try {
    if (DEMO_MODE) return { ok: false, error: AVISO_DEMO };
    const { db } = await requireUser();
    z.uuid().parse(id);

    const coluna = tabela === "categories" ? "category_id" : "collection_id";
    const { count } = await db
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq(coluna, id);

    // Excluir uma categoria com peças dentro deixaria as peças órfãs sem que
    // ninguém percebesse. Melhor bloquear e explicar.
    if (count && count > 0) {
      return {
        ok: false,
        error: `Existem ${count} peça(s) usando este item. Mova-as antes de excluir, ou apenas desative.`,
      };
    }

    const { error } = await db.from(tabela).delete().eq("id", id);
    if (error) throw new Error(error.message);

    updateTag(TAG_CATALOGO);
    return { ok: true };
  } catch (erro) {
    return { ok: false, error: traduz(erro instanceof Error ? erro.message : "") };
  }
}

/* ── Banners ────────────────────────────────────────────────────────────── */

const bannerSchema = z
  .object({
    id: z.uuid().optional(),
    title: opcional(120),
    subtitle: opcional(240),
    imageDesktop: z.url("Informe o endereço da arte de desktop."),
    imageMobile: opcional(500),
    ctaLabel: opcional(40),
    link: opcional(300),
    align: z.enum(["left", "center", "right"]),
    overlay: z.number().int().min(0).max(100),
    position: z.number().int().min(0),
    active: z.boolean(),
    startsAt: opcional(40),
    endsAt: opcional(40),
  })
  .superRefine((d, ctx) => {
    if (d.startsAt && d.endsAt && new Date(d.endsAt) <= new Date(d.startsAt)) {
      ctx.addIssue({
        code: "custom",
        path: ["endsAt"],
        message: "A data final precisa ser depois da inicial.",
      });
    }
    // Publicar sem a arte de mobile entregaria uma foto panorâmica cortada num
    // celular — o erro mais comum desta tela.
    if (d.active && !d.imageMobile) {
      ctx.addIssue({
        code: "custom",
        path: ["imageMobile"],
        message: "Para publicar, envie também a arte de celular.",
      });
    }
  });

export async function salvarBanner(entrada: unknown): Promise<ActionResult> {
  try {
    if (DEMO_MODE) return { ok: false, error: AVISO_DEMO };
    const { db } = await requireUser();
    const d = bannerSchema.parse(entrada);

    const payload = {
      title: d.title ?? "",
      subtitle: d.subtitle,
      image_desktop: d.imageDesktop,
      image_mobile: d.imageMobile,
      cta_label: d.ctaLabel,
      link: d.link,
      align: d.align,
      overlay: d.overlay,
      position: d.position,
      active: d.active,
      starts_at: d.startsAt,
      ends_at: d.endsAt,
    };

    const { error } = d.id
      ? await db.from("banners").update(payload).eq("id", d.id)
      : await db.from("banners").insert(payload);
    if (error) throw new Error(error.message);

    updateTag(TAG_CONTEUDO);
    return { ok: true };
  } catch (erro) {
    if (erro instanceof z.ZodError) {
      return { ok: false, error: erro.issues[0]?.message ?? "Confira os campos." };
    }
    return { ok: false, error: traduz(erro instanceof Error ? erro.message : "") };
  }
}

export async function excluirBanner(id: string): Promise<ActionResult> {
  try {
    if (DEMO_MODE) return { ok: false, error: AVISO_DEMO };
    const { db } = await requireUser();
    z.uuid().parse(id);

    const { error } = await db.from("banners").delete().eq("id", id);
    if (error) throw new Error(error.message);

    updateTag(TAG_CONTEUDO);
    return { ok: true };
  } catch (erro) {
    return { ok: false, error: traduz(erro instanceof Error ? erro.message : "") };
  }
}

/* ── Solicitações personalizadas ────────────────────────────────────────── */

export async function mudarStatusPedido(
  id: string,
  status: string
): Promise<ActionResult> {
  try {
    if (DEMO_MODE) return { ok: false, error: AVISO_DEMO };
    const { db } = await requireUser();

    z.uuid().parse(id);
    z.enum(CUSTOM_REQUEST_STATUSES).parse(status);

    const { error } = await db.from("custom_requests").update({ status }).eq("id", id);
    if (error) throw new Error(error.message);

    return { ok: true };
  } catch (erro) {
    return { ok: false, error: traduz(erro instanceof Error ? erro.message : "") };
  }
}

/* ── Configurações da loja ──────────────────────────────────────────────── */

const CHAVES_EDITAVEIS = [
  "whatsapp",
  "whatsapp_default_message",
  "instagram_handle",
  "instagram_url",
  "email",
  "address",
  "city",
  "business_hours",
  "top_bar_text",
  "top_bar_cta_label",
  "about_title",
  "about_text",
  "footer_tagline",
  "legal_name",
  "legal_document",
  "seo_title",
  "seo_description",
] as const;

export async function salvarConfiguracoes(entrada: unknown): Promise<ActionResult> {
  try {
    if (DEMO_MODE) return { ok: false, error: AVISO_DEMO };
    const { db, user } = await requireUser();

    const schema = z.record(z.string(), z.string().max(800));
    const dados = schema.parse(entrada);

    const linhas = CHAVES_EDITAVEIS.filter((k) => k in dados).map((k) => {
      let valor = (dados[k] ?? "").trim();

      // O WhatsApp é o campo mais crítico do site: um dígito errado desvia
      // todos os clientes em silêncio. Normalizamos aqui e validamos o
      // comprimento antes de gravar.
      if (k === "whatsapp" && valor) {
        const digitos = valor.replace(/\D/g, "");
        valor = digitos.length === 10 || digitos.length === 11 ? `55${digitos}` : digitos;
        if (valor.length < 12 || valor.length > 13) {
          throw new z.ZodError([
            {
              code: "custom",
              path: ["whatsapp"],
              message: "WhatsApp inválido. Informe DDD + número (ex.: 44 99878-8108).",
            },
          ]);
        }
      }

      if (k === "instagram_handle") valor = valor.replace(/^@/, "");

      return {
        key: k,
        value: valor,
        updated_by: user.email ?? null,
      };
    });

    if (linhas.length === 0) return { ok: true };

    const { error } = await db.from("site_settings").upsert(linhas, { onConflict: "key" });
    if (error) throw new Error(error.message);

    updateTag(TAG_CONFIG);
    updateTag(TAG_CONTEUDO);
    return { ok: true };
  } catch (erro) {
    if (erro instanceof z.ZodError) {
      return { ok: false, error: erro.issues[0]?.message ?? "Confira os campos." };
    }
    return { ok: false, error: traduz(erro instanceof Error ? erro.message : "") };
  }
}
