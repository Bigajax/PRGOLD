"use client";

import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_SETUP_HINT, supabaseAnonKey, supabaseUrl } from "./env";

/**
 * Cliente de navegador — existe para EXATAMENTE três coisas do painel:
 * login, logout e troca de senha.
 *
 * Nenhum componente da vitrine pública usa cliente Supabase. O catálogo é
 * carregado no servidor e distribuído por contexto; busca, filtros e
 * favoritos rodam em memória no cliente.
 *
 * @param remember Controla a duração do cookie de sessão. Marcado, a sessão
 * sobrevive a fechar o navegador (um ano); desmarcado, morre junto com ele.
 */
export function supabaseBrowser(remember = true) {
  const url = supabaseUrl();
  const key = supabaseAnonKey();
  if (!url || !key) throw new Error(SUPABASE_SETUP_HINT);

  return createBrowserClient(url, key, {
    cookieOptions: {
      maxAge: remember ? 60 * 60 * 24 * 365 : undefined,
    },
  });
}
