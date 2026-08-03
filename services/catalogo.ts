import "server-only";

import { unstable_cache } from "next/cache";
import type { Category, Collection, Product } from "@/types";
import { produtosDemo } from "@/data/demo/produtos";
import { categoriasDemo } from "@/data/demo/categorias";
import { colecoesDemo } from "@/data/demo/colecoes";
import { mapCategory, mapCollection, mapProduct, PRODUCT_SELECT } from "./mappers";
import { anonClient, DEMO_MODE, TAG_CATALOGO } from "./supabase";

/**
 * Leitura do catálogo.
 *
 * O catálogo de uma vitrine é pequeno (dezenas de peças), então ele é lido
 * inteiro uma vez por revalidação e distribuído por contexto. Busca, filtros,
 * facetas e relacionados rodam em memória no cliente — sem servidor de busca e
 * sem uma requisição por interação.
 */

async function buscaCatalogo(): Promise<Product[]> {
  if (DEMO_MODE) return produtosDemo;

  const db = anonClient();
  if (!db) return produtosDemo;

  const { data, error } = await db
    .from("products")
    .select(PRODUCT_SELECT)
    .order("position", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map(mapProduct);
}

async function buscaCategorias(): Promise<Category[]> {
  if (DEMO_MODE) return categoriasDemo;

  const db = anonClient();
  if (!db) return categoriasDemo;

  const { data, error } = await db
    .from("categories")
    .select("*")
    .order("position", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []).map(mapCategory);
}

async function buscaColecoes(): Promise<Collection[]> {
  if (DEMO_MODE) return colecoesDemo;

  const db = anonClient();
  if (!db) return colecoesDemo;

  const { data, error } = await db
    .from("collections")
    .select("*")
    .order("position", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []).map(mapCollection);
}

/**
 * `revalidate` é rede de segurança, não a estratégia: a invalidação real
 * acontece por tag, em toda escrita do painel.
 */
const OPCOES = { tags: [TAG_CATALOGO], revalidate: 300 };

export const getCatalogo = unstable_cache(buscaCatalogo, ["catalogo"], OPCOES);
export const getCategorias = unstable_cache(buscaCategorias, ["categorias"], OPCOES);
export const getColecoes = unstable_cache(buscaColecoes, ["colecoes"], OPCOES);

/**
 * Versões resilientes: usadas nas páginas públicas.
 *
 * A vitrine nunca responde 500 porque o banco caiu. Ela degrada — as seções de
 * produto somem, as institucionais continuam, e o erro vira atendimento.
 */
export async function getCatalogoSeguro(): Promise<Product[]> {
  try {
    return await getCatalogo();
  } catch {
    return [];
  }
}

export async function getCategoriasSeguro(): Promise<Category[]> {
  try {
    return await getCategorias();
  } catch {
    return [];
  }
}

export async function getColecoesSeguro(): Promise<Collection[]> {
  try {
    return await getColecoes();
  } catch {
    return [];
  }
}

export async function getProduto(slug: string): Promise<Product | null> {
  const catalogo = await getCatalogoSeguro();
  return catalogo.find((p) => p.slug === slug) ?? null;
}

export async function getCategoria(slug: string): Promise<Category | null> {
  const categorias = await getCategoriasSeguro();
  return categorias.find((c) => c.slug === slug) ?? null;
}

export async function getColecao(slug: string): Promise<Collection | null> {
  const colecoes = await getColecoesSeguro();
  return colecoes.find((c) => c.slug === slug) ?? null;
}

/**
 * Catálogo do PAINEL: sem cache e com a sessão do administrador, para que ele
 * veja peças ocultas e arquivadas — que a política de RLS esconde do público.
 */
export async function getCatalogoAdmin(
  db: { from: (t: string) => any } // eslint-disable-line @typescript-eslint/no-explicit-any
): Promise<Product[]> {
  if (DEMO_MODE) return produtosDemo;

  const { data, error } = await db
    .from("products")
    .select(PRODUCT_SELECT)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map(mapProduct);
}
