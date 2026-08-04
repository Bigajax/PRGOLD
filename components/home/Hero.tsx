"use client";

import Image from "next/image";
import { textos } from "@/config/textos";
import { midia, site } from "@/config/site";
import { ButtonLink } from "@/components/ui/Button";
import { VideoAmbiente } from "./VideoAmbiente";
import { Icone } from "./Editorial";
import type { Banner, Benefit } from "@/types";

/**
 * Hero claro.
 *
 * A fotografia da PR Gold é escura e de contraste alto. Sobre um fundo também
 * escuro, ela se dissolve; sobre o marfim, cada vídeo vira um objeto recortado
 * — e é o próprio contraste da marca que faz o trabalho, sem precisar de véu
 * nem de moldura decorativa.
 *
 * Os dois laços ficam em molduras verticais 9:16 (a proporção em que foram
 * filmados, sem corte), com raio e sombra. No desktop o segundo desce um
 * pouco: dois retângulos idênticos e alinhados leem como banner; o desnível
 * leve dá ritmo e faz a composição parecer montada, não empilhada.
 */
export function Hero({
  banner,
  beneficios = [],
}: {
  banner: Banner;
  /** A antiga seção "Experiência PR Gold", agora como linha de confiança
   *  discreta sob os CTAs — só o título de cada benefício, sem descrição. */
  beneficios?: Benefit[];
}) {
  const { hero } = textos;

  const titulo = hero.titulo;
  const destaque = hero.destaque;
  const partes = titulo.includes(destaque)
    ? [
        titulo.slice(0, titulo.indexOf(destaque)),
        destaque,
        titulo.slice(titulo.indexOf(destaque) + destaque.length),
      ]
    : null;

  return (
    // `data-luz` na força máxima: é aqui que a luz de ambiente se apresenta.
    // Não usa o componente `Section`, então declara o par à mão.
    <section
      className="tone-light relative overflow-hidden bg-marfim text-onix"
      aria-labelledby="hero-titulo"
      data-luz={1}
      data-tom="light"
    >
      {/* O `py` do desktop é enxuto de propósito: cada pixel que ele não gasta
          vira altura de vídeo, porque os dois disputam a mesma janela — e o que
          sobrar depois deles é a fatia da faixa de elos na primeira dobra. */}
      <div className="shell grid items-center gap-10 py-14 md:py-20 lg:grid-cols-[1fr_auto] lg:gap-16 lg:py-10">
        {/* Texto */}
        <div className="max-w-2xl">
          {/* O ano vem do config, não da string: é o mesmo número do rodapé. */}
          <p className="eyebrow text-ouro-escuro">
            Desde {site.foundedYear} · {hero.etiquetaSufixo}
          </p>

          {/* O título é uma frase mais longa que a anterior, então o teto do
              corpo desceu de 5rem para 3rem: a 5rem ela quebrava em quatro
              linhas e o hero voltava a empurrar a faixa para fora da dobra. */}
          <h1
            id="hero-titulo"
            className="mt-5 font-display text-[clamp(1.875rem,3.4vw,3rem)]"
          >
            {partes ? (
              <>
                {partes[0]}
                <span className="text-ouro-escuro">{partes[1]}</span>
                {partes[2]}
              </>
            ) : (
              titulo
            )}
          </h1>

          <p className="mt-4 max-w-lg text-base leading-relaxed text-cinza-2">
            {hero.descricao}
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/catalogo" variante="primario" tone="light" tamanho="lg">
              {hero.ctaPrimario}
            </ButtonLink>
            <ButtonLink
              href="/monte-sua-peca"
              variante="secundario"
              tone="light"
              tamanho="lg"
            >
              {hero.ctaSecundario}
            </ButtonLink>
          </div>

          {/* Linha de confiança: os benefícios que ocupavam uma seção inteira
              no meio da home, reduzidos ao essencial — ícone e título.
              No mobile são duas colunas alinhadas: no varal livre, larguras
              diferentes deixavam as fileiras desencontradas. */}
          {beneficios.length > 0 && (
            <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-2.5 sm:flex sm:flex-wrap sm:gap-x-6">
              {beneficios.map((b) => (
                <li key={b.id} className="flex items-start gap-2">
                  <Icone nome={b.icon} className="mt-0.5 size-4 shrink-0 text-ouro-escuro" />
                  <span className="font-sans text-xs leading-snug font-medium text-cinza-2">
                    {b.title}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Vídeos.
            No desktop quem manda é a ALTURA, não a largura: o vídeo mede o que
            sobra da janela depois do cabeçalho, do respiro e de uma fatia da
            faixa de elos — as 21rem descontadas. A largura vem sozinha pela
            proporção 9/16, e por isso o `w`/`max-w` são anulados no `lg`.

            Em tela alta o teto de 30rem segura o vídeo no tamanho de sempre;
            em tela baixa ele cede, e é o hero que encolhe em vez de empurrar a
            faixa para fora da primeira dobra. */}
        {midia.hero.length > 0 ? (
          <div className="flex justify-center gap-5 sm:gap-6 lg:justify-end">
            {midia.hero.map((video, i) => (
              <div key={video.src} className={`relative ${i === 1 ? "lg:translate-y-10" : ""}`}>
                {/* O halo: a luz âmbar da fotografia da marca, atrás do
                    estojo. É o que tira a moldura do "retângulo seco" sem
                    recorrer a sombra — que sobre o marfim empoçava num borrão
                    cinza (o motivo de nunca ter havido sombra aqui). */}
                <span
                  aria-hidden
                  className="absolute -inset-10 bg-radial from-luz/25 via-luz/10 to-transparent"
                />
                {/* Moldura dupla de estojo: fio externo afastado (passe-
                    partout) + fio rente ao vídeo. Separação por fio é a regra
                    da paleta — aqui ela vira ornamento. */}
                <span
                  aria-hidden
                  className="absolute -inset-2 rounded-[calc(var(--radius-xl)+0.5rem)] border border-ouro-escuro/25"
                />
                <div className="relative aspect-[9/16] w-[44vw] max-w-[17rem] overflow-hidden rounded-[var(--radius-xl)] bg-onix ring-1 ring-ouro/45 sm:w-[16rem] lg:h-[clamp(18rem,calc(100svh-18rem),30rem)] lg:w-auto lg:max-w-none">
                  <VideoAmbiente src={video.src} poster={video.poster} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[var(--radius-xl)] bg-onix shadow-[var(--shadow-cartao-alto)] lg:w-[36rem]">
            <Image
              src={banner.imageDesktop}
              // O alt descreve ESTE banner, e sai do próprio banner. Antes vinha
              // da etiqueta do hero, que descrevia a seção e não a imagem.
              alt={banner.title}
              fill
              priority
              quality={90}
              sizes="(max-width: 1024px) 100vw, 36rem"
              className="object-cover"
            />
          </div>
        )}
      </div>
    </section>
  );
}
