import type { ReactNode } from "react";
import type { Tone } from "@/types";

/**
 * Alternância de fundo da vitrine.
 *
 * A regra não é decorativa: o joalheiro MOSTRA a peça sob spot num ambiente
 * escuro e PREENCHE o certificado num balcão iluminado. Seções de exibição são
 * escuras; seções de trabalho (catálogo, filtros, formulários) são claras.
 *
 * A classe `tone-light` no elemento é o que faz os componentes internos
 * (divisores, fios da grade, foco) trocarem para o dourado escuro, que é o
 * único que passa em contraste sobre o marfim.
 */
export function Section({
  tone,
  children,
  className = "",
  id,
  as: Tag = "section",
  superficie = "base",
  luz,
}: {
  tone: Tone;
  children: ReactNode;
  className?: string;
  id?: string;
  as?: "section" | "div" | "footer" | "header";
  /**
   * Variação de fundo dentro do mesmo tom, para duas seções vizinhas não
   * virarem um bloco só.
   *
   * É uma prop, e não uma classe passada por `className`: duas utilitárias de
   * fundo no mesmo elemento se resolvem pela ordem no CSS gerado, não pela
   * ordem da string — e isso já quebrou um layout neste projeto.
   */
  superficie?: "base" | "alternada";
  /**
   * Força da luz de ambiente enquanto ESTA seção estiver no meio da tela, de 0
   * a 1. Sem valor, a seção não participa e a luz mantém o que já tinha.
   *
   * O tom vai junto porque a luz é limitada por contraste: sobre fundo claro
   * existe texto escuro para proteger, e o teto cai (ver `.luz-ambiente`).
   */
  luz?: number;
}) {
  const fundo =
    tone === "dark"
      ? superficie === "alternada"
        ? "bg-onix-2 text-marfim"
        : "bg-onix text-marfim"
      : superficie === "alternada"
        ? "tone-light bg-marfim-2 text-onix"
        : "tone-light bg-marfim text-onix";

  return (
    <Tag
      id={id}
      className={`${fundo} ${className}`}
      data-luz={luz !== undefined ? luz : undefined}
      data-tom={luz !== undefined ? tone : undefined}
    >
      {children}
    </Tag>
  );
}

/** Espaçamento vertical padrão das seções da home. */
export function SectionInner({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`shell py-16 md:py-24 ${className}`}>{children}</div>;
}
