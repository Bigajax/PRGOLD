"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Lista de strings persistida no navegador (favoritos, buscas recentes).
 *
 * Usa `useSyncExternalStore` em vez de `useState` + `useEffect` porque o
 * localStorage É uma fonte externa: ele muda por fora do React (outra aba,
 * outro componente) e precisa ser lido no momento certo do render.
 *
 * A alternativa comum — `setState` dentro de um efeito no mount — dispara um
 * render em cascata a cada montagem e é justamente o que a regra
 * `react-hooks/set-state-in-effect` do React 19 aponta.
 *
 * O `getServerSnapshot` devolve uma lista vazia estável: no servidor não
 * existe localStorage, e é isso que evita divergência de hidratação.
 */

const VAZIO: string[] = [];
const EVENTO = "prgold:storage";

/** Cache por chave: `getSnapshot` precisa devolver a MESMA referência enquanto
 *  o valor bruto não mudar, senão o React entra em loop de render. */
const cache = new Map<string, { bruto: string | null; valor: string[] }>();

function ler(chave: string): string[] {
  if (typeof window === "undefined") return VAZIO;

  let bruto: string | null = null;
  try {
    bruto = window.localStorage.getItem(chave);
  } catch {
    // Armazenamento bloqueado (navegação privada, cookies desativados):
    // a lista não persiste e o site continua funcionando.
    return VAZIO;
  }

  const anterior = cache.get(chave);
  if (anterior && anterior.bruto === bruto) return anterior.valor;

  let valor: string[] = VAZIO;
  try {
    const lista = bruto ? JSON.parse(bruto) : [];
    valor = Array.isArray(lista) ? lista.filter((x) => typeof x === "string") : VAZIO;
  } catch {
    valor = VAZIO;
  }

  cache.set(chave, { bruto, valor });
  return valor;
}

function assinar(callback: () => void) {
  // `storage` avisa as OUTRAS abas; o CustomEvent avisa esta mesma aba.
  window.addEventListener("storage", callback);
  window.addEventListener(EVENTO, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(EVENTO, callback);
  };
}

function gravar(chave: string, lista: string[]) {
  try {
    window.localStorage.setItem(chave, JSON.stringify(lista));
  } catch {
    /* silencioso de propósito — ver acima */
  }
  window.dispatchEvent(new CustomEvent(EVENTO));
}

export function useArmazenamentoLocal(chave: string) {
  const lista = useSyncExternalStore(
    assinar,
    () => ler(chave),
    () => VAZIO
  );

  /**
   * `pronto` distingue "ainda não li o navegador" de "li e está vazio".
   * Sem isso, o coração do favorito pisca desmarcado no primeiro quadro para
   * quem já tinha salvo a peça.
   */
  const pronto = useSyncExternalStore(
    assinar,
    () => true,
    () => false
  );

  /**
   * Aceita a lista pronta ou uma função que recebe o valor ATUAL do
   * armazenamento.
   *
   * A forma com função existe por um motivo concreto: duas escritas no mesmo
   * tique (tocar em dois corações seguidos) partiriam ambas do mesmo snapshot
   * de render, e a segunda apagaria a primeira. Lendo do storage na hora da
   * escrita, cada uma enxerga o resultado da anterior.
   */
  const definir = useCallback(
    (proxima: string[] | ((atual: string[]) => string[])) => {
      const valor =
        typeof proxima === "function" ? proxima(ler(chave)) : proxima;
      gravar(chave, valor);
    },
    [chave]
  );

  return { lista, pronto, definir };
}
