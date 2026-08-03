"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { supabaseServer, requireUser } from "@/lib/supabase/server";
import { DEMO_MODE } from "@/services/supabase";
import type { ActionResult } from "@/types";

/**
 * Ações de sessão do painel.
 *
 * Toda action começa validando a sessão. A tela esconder um botão não impede
 * ninguém de invocar a action direto — a UI nunca é a única proteção.
 */

export async function sair() {
  if (!DEMO_MODE) {
    const db = await supabaseServer();
    await db.auth.signOut();
  }
  redirect("/admin/login");
}

const senhaSchema = z
  .object({
    senha: z
      .string()
      .min(10, "Use pelo menos 10 caracteres.")
      .max(200, "Senha muito longa."),
    confirmacao: z.string(),
  })
  .refine((d) => d.senha === d.confirmacao, {
    message: "As duas senhas precisam ser iguais.",
    path: ["confirmacao"],
  })
  .refine((d) => !/^(1234|senha|prgold|password)/i.test(d.senha), {
    message: "Escolha uma senha menos óbvia.",
    path: ["senha"],
  });

export async function trocarSenha(entrada: unknown): Promise<ActionResult> {
  try {
    if (DEMO_MODE) {
      return { ok: false, error: "Configure o banco de dados para trocar a senha." };
    }

    const { db } = await requireUser();
    const dados = senhaSchema.parse(entrada);

    const { error } = await db.auth.updateUser({ password: dados.senha });
    if (error) throw new Error(error.message);

    return {
      ok: true,
      warnings: ["Senha alterada. As outras sessões continuam válidas até expirarem."],
    };
  } catch (erro) {
    if (erro instanceof z.ZodError) {
      return { ok: false, error: erro.issues[0]?.message ?? "Confira os campos." };
    }
    return {
      ok: false,
      error:
        erro instanceof Error && erro.message.includes("Sessão")
          ? erro.message
          : "Não foi possível trocar a senha agora.",
    };
  }
}
