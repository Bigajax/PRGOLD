import type { ReactNode } from "react";
import type { Tone } from "@/types";

/**
 * Cabeçalho de seção.
 *
 * `destaque` é a ÚNICA palavra do título que recebe o dourado. A restrição é
 * proposital: dourado em todo o texto vira ruído e mata a hierarquia que ele
 * deveria criar.
 */
export function SectionHeading({
  etiqueta,
  titulo,
  destaque,
  subtitulo,
  tone,
  nivel = 2,
  acao,
  centralizado = false,
}: {
  etiqueta?: string;
  titulo: string;
  destaque?: string;
  subtitulo?: string;
  tone: Tone;
  nivel?: 1 | 2;
  acao?: ReactNode;
  centralizado?: boolean;
}) {
  const Titulo = nivel === 1 ? "h1" : "h2";
  const corEtiqueta = tone === "dark" ? "text-ouro" : "text-ouro-escuro";
  const corSubtitulo = tone === "dark" ? "text-cinza" : "text-cinza-2";
  const corDestaque = tone === "dark" ? "text-ouro" : "text-ouro-escuro";

  // Divide o título para destacar exatamente uma palavra, preservando o texto.
  const partes =
    destaque && titulo.includes(destaque)
      ? [
          titulo.slice(0, titulo.indexOf(destaque)),
          destaque,
          titulo.slice(titulo.indexOf(destaque) + destaque.length),
        ]
      : null;

  return (
    <div
      className={`flex flex-col gap-4 md:flex-row md:items-end md:justify-between ${
        centralizado ? "md:flex-col md:items-center" : ""
      }`}
    >
      <div className={`max-w-2xl ${centralizado ? "text-center" : ""}`}>
        {etiqueta && <p className={`eyebrow mb-4 ${corEtiqueta}`}>{etiqueta}</p>}

        <Titulo className="font-display text-[clamp(1.75rem,4vw,3rem)] leading-[1.08]">
          {partes ? (
            <>
              {partes[0]}
              <span className={corDestaque}>{partes[1]}</span>
              {partes[2]}
            </>
          ) : (
            titulo
          )}
        </Titulo>

        {subtitulo && (
          <p className={`mt-4 text-base leading-relaxed ${corSubtitulo}`}>{subtitulo}</p>
        )}
      </div>

      {acao && <div className="shrink-0">{acao}</div>}
    </div>
  );
}
