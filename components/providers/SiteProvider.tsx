"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { Category, Collection, Product, SiteSettings } from "@/types";

/**
 * O catálogo inteiro é carregado UMA vez no servidor (layout raiz) e
 * distribuído por contexto. Nenhum componente da vitrine busca dados: busca,
 * filtros, facetas, relacionados e favoritos operam sobre esta lista em
 * memória.
 *
 * Só é viável porque o catálogo de uma vitrine é pequeno — e é exatamente por
 * isso que a navegação fica instantânea.
 */

type SiteContexto = {
  catalogo: Product[];
  categorias: Category[];
  colecoes: Collection[];
  settings: SiteSettings;
  /** Índice slug -> peça, para consulta O(1) (favoritos, relacionados). */
  porSlug: Map<string, Product>;
  demoMode: boolean;
};

const Contexto = createContext<SiteContexto | null>(null);

export function SiteProvider({
  catalogo,
  categorias,
  colecoes,
  settings,
  demoMode,
  children,
}: {
  catalogo: Product[];
  categorias: Category[];
  colecoes: Collection[];
  settings: SiteSettings;
  demoMode: boolean;
  children: ReactNode;
}) {
  const valor = useMemo<SiteContexto>(
    () => ({
      catalogo,
      categorias,
      colecoes,
      settings,
      porSlug: new Map(catalogo.map((p) => [p.slug, p])),
      demoMode,
    }),
    [catalogo, categorias, colecoes, settings, demoMode]
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

function useSite(): SiteContexto {
  const ctx = useContext(Contexto);
  if (!ctx) throw new Error("useSite precisa estar dentro de <SiteProvider>.");
  return ctx;
}

export const useCatalogo = () => useSite().catalogo;
export const useCategorias = () => useSite().categorias;
export const useColecoes = () => useSite().colecoes;
export const useSettings = () => useSite().settings;
export const useProdutoPorSlug = () => useSite().porSlug;
export const useDemoMode = () => useSite().demoMode;
