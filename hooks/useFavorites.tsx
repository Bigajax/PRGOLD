"use client";

import { useCallback } from "react";
import { useArmazenamentoLocal } from "./useArmazenamentoLocal";

const CHAVE = "prgold:favoritos";

/**
 * Favoritos do visitante, sem login.
 *
 * A persistência e a sincronia (entre abas e dentro da mesma aba) ficam em
 * `useArmazenamentoLocal`. Aqui mora só a regra: alternar, remover e limpar.
 *
 * Toda escrita parte do valor ATUAL do armazenamento, e não da lista do render
 * — dois toques em sequência rápida partiriam do mesmo snapshot e o segundo
 * apagaria o primeiro.
 */
export function useFavorites() {
  const { lista: slugs, pronto, definir } = useArmazenamentoLocal(CHAVE);

  const alternar = useCallback(
    (slug: string) => {
      let virouFavorito = false;
      definir((atual) => {
        virouFavorito = !atual.includes(slug);
        return virouFavorito ? [...atual, slug] : atual.filter((s) => s !== slug);
      });
      return virouFavorito;
    },
    [definir]
  );

  const remover = useCallback(
    (slug: string) => definir((atual) => atual.filter((s) => s !== slug)),
    [definir]
  );

  const limpar = useCallback(() => definir([]), [definir]);

  const ehFavorito = useCallback((slug: string) => slugs.includes(slug), [slugs]);

  return { slugs, pronto, alternar, remover, limpar, ehFavorito, total: slugs.length };
}
