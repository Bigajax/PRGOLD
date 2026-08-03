import "server-only";

import { createClient } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabaseAnonKey, supabaseUrl } from "@/lib/supabase/env";

/**
 * Cliente de LEITURA da vitrine: server-side, anônimo, SEM cookies.
 *
 * A ausência de cookies não é detalhe: `unstable_cache` não permite acessar
 * `cookies()` dentro da função cacheada, então um cliente de sessão aqui
 * quebraria o cache do catálogo inteiro. O painel usa outro cliente
 * (`lib/supabase/server.ts`), esse sim com a sessão do administrador.
 */
export function anonClient() {
  const url = supabaseUrl();
  const key = supabaseAnonKey();
  if (!url || !key) return null;

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Modo demonstração: sem banco configurado, a vitrine é servida por
 * `data/demo/`. É o que permite revisar o site inteiro antes de existir
 * projeto Supabase — e é sinalizado no painel para não ir a produção assim.
 */
export const DEMO_MODE = !isSupabaseConfigured();

/** Tags de cache. Toda escrita do painel invalida a tag correspondente. */
export const TAG_CATALOGO = "catalogo";
export const TAG_CONTEUDO = "conteudo";
export const TAG_CONFIG = "configuracoes";

/**
 * `numeric` do Postgres chega como STRING pela PostgREST. Converter na
 * fronteira é obrigatório — e `Number(null)` é `0`, o que transformaria
 * "sem preço" em "R$ 0,00" silenciosamente.
 */
export function num(valor: unknown): number | null {
  if (valor === null || valor === undefined || valor === "") return null;
  const n = Number(valor);
  return Number.isFinite(n) ? n : null;
}

export function texto(valor: unknown): string | null {
  if (typeof valor !== "string") return null;
  const t = valor.trim();
  return t.length ? t : null;
}
