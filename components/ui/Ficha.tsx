import type { Tone } from "@/types";

/**
 * A FICHA TÉCNICA — device estrutural do site.
 *
 * Aparece em três densidades com os mesmos dados: compacta no card, completa
 * na página de produto e em blocos na mensagem de WhatsApp.
 *
 * Um campo sem dado não chega até aqui (ver `fichaTecnica()` em lib/format).
 * A ficha encolhe sozinha, e é assim que a regra de "não inventar" vira
 * comportamento visível: a peça mostra o que a PR Gold informou, e só.
 */

export function FichaCompacta({
  texto,
  tone,
  className = "",
}: {
  texto: string | null;
  tone: Tone;
  className?: string;
}) {
  if (!texto) return null;
  return (
    <p
      className={`font-sans text-[11px] tracking-[0.1em] uppercase ${
        tone === "dark" ? "text-cinza/70" : "text-cinza-2"
      } ${className}`}
    >
      {texto}
    </p>
  );
}

export function FichaCompleta({
  linhas,
  tone,
}: {
  linhas: { label: string; value: string }[];
  tone: Tone;
}) {
  if (linhas.length === 0) return null;

  const fio = tone === "dark" ? "border-ouro/20" : "border-onix/12";
  const rotulo = tone === "dark" ? "text-cinza/70" : "text-cinza-2";

  return (
    <dl className={`border-t ${fio}`}>
      {linhas.map((linha) => (
        <div
          key={linha.label}
          className={`flex items-baseline justify-between gap-6 border-b ${fio} py-3`}
        >
          <dt
            className={`font-sans text-[11px] tracking-[0.14em] uppercase ${rotulo}`}
          >
            {linha.label}
          </dt>
          <dd className="text-right text-sm">{linha.value}</dd>
        </div>
      ))}
    </dl>
  );
}
