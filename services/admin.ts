import "server-only";

import { supabaseServer } from "@/lib/supabase/server";
import { DEMO_MODE } from "./supabase";
import {
  mapBanner,
  mapCategory,
  mapCollection,
  mapCustomRequest,
  mapProduct,
  PRODUCT_SELECT,
} from "./mappers";
import type {
  Banner,
  Category,
  Collection,
  CustomRequest,
  Product,
  SiteSettings,
} from "@/types";
import { produtosDemo } from "@/data/demo/produtos";
import { categoriasDemo } from "@/data/demo/categorias";
import { colecoesDemo } from "@/data/demo/colecoes";
import { bannersDemo } from "@/data/demo/banners";
import { getSettingsSeguro } from "./conteudo";

/**
 * Leituras do PAINEL.
 *
 * Sempre com a sessão do administrador e SEM cache: o lojista precisa ver o
 * estado real, incluindo peças ocultas e arquivadas — que a política de RLS
 * esconde do público.
 *
 * Toda função devolve dados de demonstração quando não há banco, para que o
 * painel possa ser revisado antes de existir projeto Supabase.
 */

export async function listarProdutosAdmin(): Promise<Product[]> {
  if (DEMO_MODE) return produtosDemo;

  const db = await supabaseServer();
  const { data, error } = await db
    .from("products")
    .select(PRODUCT_SELECT)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map(mapProduct);
}

export async function listarCategoriasAdmin(): Promise<Category[]> {
  if (DEMO_MODE) return categoriasDemo;

  const db = await supabaseServer();
  const { data, error } = await db
    .from("categories")
    .select("*")
    .order("position", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []).map(mapCategory);
}

export async function listarColecoesAdmin(): Promise<Collection[]> {
  if (DEMO_MODE) return colecoesDemo;

  const db = await supabaseServer();
  const { data, error } = await db
    .from("collections")
    .select("*")
    .order("position", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []).map(mapCollection);
}

export async function listarBannersAdmin(): Promise<Banner[]> {
  if (DEMO_MODE) return bannersDemo;

  const db = await supabaseServer();
  const { data, error } = await db
    .from("banners")
    .select("*")
    .order("position", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []).map(mapBanner);
}

export async function listarPedidosAdmin(): Promise<CustomRequest[]> {
  if (DEMO_MODE) return [];

  const db = await supabaseServer();
  const { data, error } = await db
    .from("custom_requests")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) throw new Error(error.message);
  return (data ?? []).map(mapCustomRequest);
}

export async function lerSettingsAdmin(): Promise<SiteSettings> {
  return getSettingsSeguro();
}

/**
 * Detecta migration pendente pela mensagem do PostgREST.
 *
 * Sem isso, uma tabela ausente aparece como erro técnico incompreensível. Com
 * isso, o painel se autodiagnostica e diz exatamente o que fazer.
 */
export function migrationPendente(erro: unknown): boolean {
  const m = erro instanceof Error ? erro.message : String(erro);
  return /does not exist|schema cache|relation .* does not exist/i.test(m);
}
