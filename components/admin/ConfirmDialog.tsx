"use client";

import { useEffect, useRef } from "react";

/**
 * Confirmação de ação destrutiva.
 *
 * Nunca `window.confirm`: ele não aceita estilo, não traduz os botões, não
 * mostra estado de carregamento e, no celular, aparece colado no topo da tela
 * — longe do polegar e fácil de confirmar por engano.
 *
 * A descrição sempre diz o EFEITO concreto ("a peça e as fotos serão
 * apagadas"), não a operação técnica.
 */
export function ConfirmDialog({
  titulo,
  descricao,
  rotuloConfirmar = "Confirmar",
  perigo = false,
  ocupado = false,
  aoConfirmar,
  aoFechar,
}: {
  titulo: string;
  descricao?: string;
  rotuloConfirmar?: string;
  perigo?: boolean;
  ocupado?: boolean;
  aoConfirmar: () => void;
  aoFechar: () => void;
}) {
  const confirmarRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !ocupado) aoFechar();
    };
    document.addEventListener("keydown", aoTeclar);
    // O foco vai para o botão de CANCELAR quando a ação é destrutiva: o
    // padrão seguro é sair, não confirmar.
    if (!perigo) confirmarRef.current?.focus();
    return () => document.removeEventListener("keydown", aoTeclar);
  }, [aoFechar, ocupado, perigo]);

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-onix/70 p-4 md:items-center">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirmar-titulo"
        className="tone-light w-full max-w-md border border-onix/20 bg-marfim p-6"
      >
        <h2 id="confirmar-titulo" className="font-display text-xl">
          {titulo}
        </h2>
        {descricao && (
          <p className="mt-3 text-sm leading-relaxed text-cinza-2">{descricao}</p>
        )}

        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={aoFechar}
            disabled={ocupado}
            autoFocus={perigo}
            className="tap min-h-12 border border-onix/20 px-5 text-sm disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            ref={confirmarRef}
            type="button"
            onClick={aoConfirmar}
            disabled={ocupado}
            className={`tap min-h-12 border px-6 font-sans text-[11px] tracking-[0.14em] uppercase disabled:opacity-50 ${
              perigo
                ? "border-alerta bg-alerta text-marfim"
                : "border-onix bg-onix text-marfim"
            }`}
          >
            {ocupado ? "Aguarde..." : rotuloConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
}
