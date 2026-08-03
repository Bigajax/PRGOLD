"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { textos } from "@/config/textos";
import { MontarPecaForm } from "@/app/monte-sua-peca/MontarPecaForm";

/**
 * "Monte sua peça" em modal.
 *
 * É o MESMO formulário de `/monte-sua-peca`, com as cinco etapas — não uma
 * versão reduzida. Duas telas com regras diferentes para o mesmo pedido viram
 * duas manutenções e duas oportunidades de divergir.
 *
 * O que este componente faz é só a camada: fundo, painel, foco preso, Escape,
 * e travar a rolagem de trás. A página continua existindo para quem chega por
 * link direto ou pelo menu.
 */
export function ModalMontePeca({ aoFechar }: { aoFechar: () => void }) {
  const painelRef = useRef<HTMLDivElement>(null);
  const fecharRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const scrollY = window.scrollY;
    const body = document.body;
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";

    fecharRef.current?.focus();

    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        aoFechar();
        return;
      }
      // Armadilha de foco: sem ela o Tab escapa para a página atrás do modal.
      if (e.key === "Tab" && painelRef.current) {
        const focaveis = painelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), textarea, select, [tabindex]:not([tabindex="-1"])'
        );
        if (!focaveis.length) return;
        const primeiro = focaveis[0];
        const ultimo = focaveis[focaveis.length - 1];
        if (e.shiftKey && document.activeElement === primeiro) {
          e.preventDefault();
          ultimo.focus();
        } else if (!e.shiftKey && document.activeElement === ultimo) {
          e.preventDefault();
          primeiro.focus();
        }
      }
    };

    document.addEventListener("keydown", aoTeclar);
    return () => {
      document.removeEventListener("keydown", aoTeclar);
      body.style.position = "";
      body.style.top = "";
      body.style.width = "";
      window.scrollTo(0, scrollY);
    };
  }, [aoFechar]);

  return (
    <div className="fixed inset-0 z-[75] flex items-end justify-center bg-onix/60 backdrop-blur-sm sm:items-center sm:p-6">
      <button
        type="button"
        aria-label="Fechar"
        onClick={aoFechar}
        className="absolute inset-0 cursor-default"
      />

      <div
        ref={painelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-peca-titulo"
        className="tone-light relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-[var(--radius-xl)] bg-marfim shadow-[var(--shadow-cartao-alto)] sm:max-h-[88vh] sm:rounded-[var(--radius-xl)]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-onix/8 px-6 py-5 sm:px-8">
          <div>
            <p className="eyebrow text-ouro-escuro">{textos.monteSuaPeca.etiqueta}</p>
            <h2 id="modal-peca-titulo" className="mt-3 font-display text-3xl">
              Conte como seria a joia <span className="text-ouro-escuro">ideal</span>.
            </h2>
          </div>
          <button
            ref={fecharRef}
            type="button"
            onClick={aoFechar}
            aria-label="Fechar"
            className="tap -mt-1 -mr-2 grid size-11 shrink-0 place-items-center rounded-full text-cinza-2 hover:bg-onix/[0.06] hover:text-onix"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-8">
          <MontarPecaForm compacto />
        </div>
      </div>
    </div>
  );
}
