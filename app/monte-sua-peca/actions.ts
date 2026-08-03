"use server";

import { z } from "zod";
import {
  BUCKET_IMAGENS,
  MAX_UPLOAD_BYTES,
  MIME_PERMITIDOS,
} from "@/config/catalogo";
import { normalizaWhatsApp } from "@/lib/format";
import { pedidoSchema } from "@/lib/validation/pedido-personalizado";
import { anonClient, DEMO_MODE } from "@/services/supabase";
import type { ActionResult } from "@/types";

/**
 * Grava a solicitação de peça personalizada.
 *
 * Fluxo deliberado: o pedido é gravado ANTES de abrir o WhatsApp, e a
 * abertura do WhatsApp não depende do sucesso da gravação. Se o banco estiver
 * fora, a pessoa ainda consegue conversar — a conversa é o objetivo, o
 * registro é o apoio.
 */
export async function salvarPedidoPersonalizado(
  entrada: unknown
): Promise<ActionResult & { id?: string }> {
  try {
    const dados = pedidoSchema.parse(entrada);

    // Sem banco configurado (modo demonstração), a solicitação não é perdida:
    // ela segue inteira para o WhatsApp, que é para onde ela iria de qualquer
    // forma. O aviso fica no retorno para o painel poder mostrá-lo.
    if (DEMO_MODE) {
      return {
        ok: true,
        warnings: [
          "Banco não configurado: a solicitação não foi registrada no painel, mas segue completa para o WhatsApp.",
        ],
      };
    }

    const db = anonClient();
    if (!db) {
      return {
        ok: true,
        warnings: ["A solicitação não pôde ser registrada, mas segue para o WhatsApp."],
      };
    }

    const { data, error } = await db
      .from("custom_requests")
      .insert({
        piece_type: dados.pieceType,
        style: dados.style ?? null,
        gold_type: dados.goldType ?? null,
        stones: dados.stones ?? null,
        engraving: dados.engraving ?? null,
        finish: dados.finish ?? null,
        size: dados.size ?? null,
        notes: dados.notes ?? null,
        reference_image: dados.referenceImage ?? null,
        name: dados.name,
        whatsapp: normalizaWhatsApp(dados.whatsapp),
        city: dados.city ?? null,
        email: dados.email ?? null,
        message: dados.message ?? null,
        // O status NUNCA vem do cliente: a política de RLS só aceita 'nova'.
        status: "nova",
        origin: dados.origin ?? "site",
      })
      .select("id")
      .single();

    if (error) throw new Error(error.message);

    return { ok: true, id: data?.id };
  } catch (erro) {
    if (erro instanceof z.ZodError) {
      return { ok: false, error: erro.issues[0]?.message ?? "Confira os dados do formulário." };
    }
    // Erro técnico nunca chega cru na tela: ele revelaria a estrutura do banco
    // e não diria nada de útil para quem está do outro lado.
    return {
      ok: false,
      error: "Não foi possível registrar sua solicitação agora. Você ainda pode enviá-la pelo WhatsApp.",
    };
  }
}

/**
 * Sobe a imagem de referência (etapa 4, opcional).
 *
 * Validação de tamanho e tipo acontece AQUI, no servidor — o `accept` do input
 * é conveniência, não segurança. O nome do arquivo é gerado: nome original de
 * usuário é vetor de travessia de caminho e de colisão.
 *
 * Depende da política da migration 0005. Sem ela, o retorno é uma falha suave:
 * o formulário segue sem anexo e a foto é pedida na conversa.
 */
export async function enviarImagemReferencia(
  formData: FormData
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  try {
    const arquivo = formData.get("arquivo");
    if (!(arquivo instanceof File) || arquivo.size === 0) {
      return { ok: false, error: "Nenhuma imagem selecionada." };
    }

    if (arquivo.size > MAX_UPLOAD_BYTES) {
      return { ok: false, error: "A imagem precisa ter no máximo 8 MB." };
    }

    if (!(MIME_PERMITIDOS as readonly string[]).includes(arquivo.type)) {
      return { ok: false, error: "Envie uma imagem JPG, PNG, WebP ou AVIF." };
    }

    if (DEMO_MODE) {
      return {
        ok: false,
        error: "O envio de imagem estará disponível quando o site estiver publicado. Você pode enviar a foto na conversa do WhatsApp.",
      };
    }

    const db = anonClient();
    if (!db) return { ok: false, error: "Envio indisponível no momento." };

    const extensao = arquivo.type.split("/")[1]?.replace("jpeg", "jpg") ?? "jpg";
    const nome = `referencias/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extensao}`;

    const { error } = await db.storage
      .from(BUCKET_IMAGENS)
      .upload(nome, arquivo, { cacheControl: "31536000", contentType: arquivo.type });

    if (error) throw new Error(error.message);

    const { data } = db.storage.from(BUCKET_IMAGENS).getPublicUrl(nome);
    return { ok: true, url: data.publicUrl };
  } catch {
    return {
      ok: false,
      error: "Não foi possível enviar a imagem. Você pode mandá-la na conversa do WhatsApp.",
    };
  }
}
