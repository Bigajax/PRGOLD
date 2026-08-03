"use client";

import { useEffect } from "react";
import { textos } from "@/config/textos";
import { mensagemErro, waLink } from "@/lib/whatsapp";

/**
 * Fronteira de erro da vitrine.
 *
 * Duas saídas, sempre: recarregar e falar com a loja. A falha técnica vira
 * atendimento — o banco pode cair, mas a PR Gold continua vendendo.
 *
 * Este componente NÃO usa o contexto do site: se o layout foi quem falhou, o
 * provider pode não existir. O número vem direto do config versionado.
 */
export default function Erro({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log no servidor de quem hospeda; nada de detalhe técnico na tela.
    console.error("[vitrine] falha ao renderizar", error.digest ?? error.message);
  }, [error]);

  return (
    <div className="relative flex min-h-[70vh] flex-col items-center justify-center overflow-hidden bg-onix px-6 text-center text-marfim">
      <span className="feixe-vertical" aria-hidden />
      <div className="relative">
        <p className="eyebrow text-ouro">PR Gold</p>
        <h1 className="mt-6 max-w-xl font-display text-[clamp(1.75rem,4vw,3rem)] leading-[1.08]">
          {textos.erro.titulo}
        </h1>
        <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-cinza">
          {textos.erro.texto}
        </p>

        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={reset}
            className="tap inline-flex min-h-12 items-center justify-center border border-ouro bg-ouro px-7 font-sans text-xs tracking-[0.14em] text-onix uppercase hover:bg-ouro-claro"
          >
            {textos.erro.ctaRecarregar}
          </button>
          <a
            // Sem argumento de settings, `waLink` cai no número do config
            // versionado — que é o que existe quando o layout falhou.
            href={waLink(mensagemErro())}
            target="_blank"
            rel="noopener noreferrer"
            className="tap inline-flex min-h-12 items-center justify-center border border-whats bg-whats px-7 font-sans text-xs tracking-[0.14em] text-onix uppercase"
          >
            {textos.erro.ctaWhatsApp}
          </a>
        </div>
      </div>
    </div>
  );
}
