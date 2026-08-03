import type { ReactNode } from "react";
import type { Tone } from "@/types";

/**
 * Estados vazios, de carregamento e de erro.
 *
 * Duas regras que valem para todos:
 * - vazio ORIENTA ("limpe os filtros"); erro OFERECE PLANO B (recarregar +
 *   WhatsApp). Nunca a mesma tela.
 * - todo beco sem saída tem uma próxima ação. Uma falha técnica vira
 *   atendimento, não uma porta fechada.
 */

export function EmptyState({
  icone,
  titulo,
  texto,
  acao,
  tone,
}: {
  icone?: ReactNode;
  titulo: string;
  texto?: string;
  acao?: ReactNode;
  tone: Tone;
}) {
  const fio = tone === "dark" ? "border-ouro/25" : "border-onix/15";
  const secundario = tone === "dark" ? "text-cinza" : "text-cinza-2";

  return (
    <div
      className={`flex flex-col items-center gap-4 rounded-[var(--radius-lg)] border border-dashed ${fio} px-6 py-16 text-center`}
    >
      {icone && (
        <div className={tone === "dark" ? "text-ouro" : "text-ouro-escuro"}>{icone}</div>
      )}
      <h3 className="font-display-sm text-xl">{titulo}</h3>
      {texto && <p className={`max-w-md text-sm leading-relaxed ${secundario}`}>{texto}</p>}
      {acao && <div className="mt-2 flex flex-wrap justify-center gap-3">{acao}</div>}
    </div>
  );
}

/**
 * Esqueleto do card. Repete EXATAMENTE a geometria do card real — mesmas
 * colunas, mesma proporção de imagem, mesma altura de texto. Esqueleto com
 * geometria diferente produz um salto de layout na troca.
 */
export function ProductSkeleton({ quantidade = 8 }: { quantidade?: number }) {
  return (
    <div className="vitrine grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" aria-busy="true">
      {Array.from({ length: quantidade }).map((_, i) => (
        // Mesmo raio, mesma margem interna e mesmas alturas do cartão real: um
        // esqueleto com outra geometria produz um salto na troca.
        <div key={i} className="cartao cartao--estatico flex flex-col">
          <div className="m-1.5 aspect-[3/4] animate-pulse rounded-[0.875rem] bg-onix/8" />
          <div className="flex flex-col gap-2 p-4 pt-2.5">
            <div className="h-3 w-2/3 animate-pulse rounded-full bg-onix/8" />
            <div className="h-4 w-4/5 animate-pulse rounded-full bg-onix/8" />
            <div className="mt-1 h-3 w-1/2 animate-pulse rounded-full bg-onix/8" />
          </div>
        </div>
      ))}
      <span className="sr-only">Carregando peças</span>
    </div>
  );
}
