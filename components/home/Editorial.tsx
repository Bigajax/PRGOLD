"use client";

import { useState } from "react";
import Link from "next/link";
import * as Icones from "lucide-react";
import { textos } from "@/config/textos";
import { midia, site } from "@/config/site";
import { VideoAmbiente } from "./VideoAmbiente";
import { ModalMontePeca } from "./ModalMontePeca";
import { useSettings } from "@/components/providers/SiteProvider";
import { mensagemAtendimento, waLink } from "@/lib/whatsapp";
import { Section, SectionInner } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button, ButtonExterno, ButtonLink } from "@/components/ui/Button";
import type { Benefit } from "@/types";

/* ── 6. Monte sua peça ──────────────────────────────────────────────────── */

/**
 * O diferencial estratégico da PR Gold — a marca tem confecção própria, e é
 * isso que a separa de uma revenda.
 *
 * As quatro etapas NÃO são numeradas com 01/02/03: numeração é para sequência
 * obrigatória, e aqui o valor está no que cada etapa decide. O que separa uma
 * da outra é o mesmo fio dourado da vitrine.
 */
export function SecaoMontePeca() {
  const { montePeca } = textos;
  const [modalAberto, setModalAberto] = useState(false);

  return (
    <Section tone="light" superficie="alternada" luz={0.55}>
      <SectionInner>
        <div className="grid gap-12 lg:grid-cols-[0.88fr_1.12fr] lg:gap-16">
          {/* Coluna do argumento. Sem foto: a única imagem disponível era de
              referência, e não uma peça do catálogo — numa vitrine, joia
              exposta é joia que a pessoa assume poder comprar. */}
          <div>
            <SectionHeading
              etiqueta={montePeca.etiqueta}
              titulo={montePeca.titulo}
              destaque="somente sua"
              tone="light"
            />

            {/* O fio com o ponto é o feixe da marca visto de perfil — o mesmo
                device que separa as seções, aqui em escala de parágrafo. */}
            <span className="mt-7 flex items-center gap-2" aria-hidden>
              <span className="h-px w-16 bg-gradient-to-r from-ouro-escuro/60 to-transparent" />
              <span className="size-1 rounded-full bg-ouro-escuro/60" />
            </span>

            <p className="mt-6 max-w-md text-base leading-relaxed text-cinza-2">
              {montePeca.descricao}
            </p>

            <div className="mt-8">
              <Button
                variante="primario"
                tone="light"
                tamanho="lg"
                onClick={() => setModalAberto(true)}
              >
                {montePeca.ctaLabel}
              </Button>
            </div>

            {/* O caminho longo continua existindo para quem quiser detalhar a
                peça com calma ou voltar depois pelo menu. */}
            <p className="mt-5 text-sm text-cinza-2">
              Prefere detalhar com calma?{" "}
              <Link
                href="/monte-sua-peca"
                className="underline decoration-ouro-escuro/40 underline-offset-4 hover:text-ouro-escuro"
              >
                {montePeca.ctaSecundario}
              </Link>
            </p>
          </div>

          {/* Estas quatro etapas SÃO uma sequência — o que a pessoa escolhe
              primeiro condiciona o que ela escolhe depois. Aqui a numeração
              carrega informação, e não é enfeite. */}
          <ol className="vitrine grid-cols-1 sm:grid-cols-2">
            {montePeca.etapas.map((etapa, i) => (
              <li key={etapa.titulo} className="cartao cartao--estatico p-6 md:p-7">
                <span className="flex size-9 items-center justify-center rounded-full border border-ouro-escuro/30 font-sans text-[11px] font-medium tracking-[0.08em] text-ouro-escuro">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <Icone
                  nome={etapa.icone}
                  className="mt-6 size-7 text-ouro-escuro"
                  strokeWidth={1.25}
                />
                <h3 className="mt-5 font-display-sm text-lg">{etapa.titulo}</h3>
                <p className="mt-2 text-sm leading-relaxed text-cinza-2">
                  {etapa.texto}
                </p>
              </li>
            ))}
          </ol>
        </div>

        {/* Faixa de garantias: responde à pergunta que trava o clique — "o que
            acontece comigo depois que eu mandar isso?". Só afirmações que o
            formulário cumpre ou que a loja já declara. */}
        <ul className="mt-10 grid grid-cols-1 gap-px overflow-hidden rounded-[var(--radius-lg)] bg-onix/8 sm:grid-cols-2 lg:grid-cols-4">
          {montePeca.garantias.map((g) => (
            <li key={g.titulo} className="flex items-center gap-4 bg-marfim-2 px-5 py-5">
              <Icone nome={g.icone} className="size-6 shrink-0 text-ouro-escuro" />
              <div className="min-w-0">
                <p className="font-sans text-sm font-medium">{g.titulo}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-cinza-2">{g.texto}</p>
              </div>
            </li>
          ))}
        </ul>
      </SectionInner>

      {modalAberto && <ModalMontePeca aoFechar={() => setModalAberto(false)} />}
    </Section>
  );
}

/* ── 9. Experiência PR Gold ─────────────────────────────────────────────── */

const ICONES_PERMITIDOS = [
  "MessageCircle",
  "Gem",
  "Hammer",
  "Sparkles",
  "ShieldCheck",
  "Truck",
  "Heart",
  "Award",
  "PenLine",
  "Diamond",
  "Handshake",
] as const;

function Icone({
  nome,
  className,
  strokeWidth = 1.5,
}: {
  nome: string;
  className?: string;
  strokeWidth?: number;
}) {
  // Nome de ícone vem do banco (editável no painel). Lista fechada + fallback:
  // um nome digitado errado não pode quebrar a home.
  const seguro = (ICONES_PERMITIDOS as readonly string[]).includes(nome)
    ? nome
    : "Sparkles";
  const Componente = (
    Icones as unknown as Record<
      string,
      React.ComponentType<{ className?: string; strokeWidth?: number }>
    >
  )[seguro];
  return Componente ? <Componente className={className} strokeWidth={strokeWidth} /> : null;
}

export function SecaoExperiencia({ beneficios }: { beneficios: Benefit[] }) {
  if (beneficios.length === 0) return null;

  return (
    <Section tone="light" luz={0.25}>
      <SectionInner>
        <SectionHeading
          etiqueta={textos.experiencia.etiqueta}
          titulo={textos.experiencia.titulo}
          subtitulo={textos.experiencia.subtitulo}
          tone="light"
        />

        <ul className="vitrine mt-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {beneficios.map((b) => (
            <li key={b.id} className="cartao cartao--estatico p-6">
              <Icone nome={b.icon} className="size-6 text-ouro-escuro" />
              <h3 className="mt-4 font-display-sm text-lg">{b.title}</h3>
              {b.description && (
                <p className="mt-2 text-sm leading-relaxed text-cinza-2">{b.description}</p>
              )}
            </li>
          ))}
        </ul>
      </SectionInner>
    </Section>
  );
}

/* ── 10. Sobre a marca ──────────────────────────────────────────────────── */

export function SecaoSobre() {
  const settings = useSettings();

  return (
    <Section tone="dark" luz={0.8}>
      <SectionInner>
        <div className="grid items-center gap-10 lg:grid-cols-[auto_1fr] lg:gap-16">
          {/* O ateliê em movimento — é o que sustenta "confecção própria"
              melhor do que qualquer frase.
              Contido e arredondado, em vez de sangrar até a borda: no formato
              cheio o vídeo dominava a seção e o texto virava legenda. */}
          <div className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-[var(--radius-xl)] bg-onix-2 shadow-[0_24px_60px_rgba(0,0,0,0.45)] lg:mx-0 lg:aspect-[3/4] lg:w-[22rem]">
            <VideoAmbiente src={midia.atelie.src} poster={midia.atelie.poster} />
          </div>

          <div>
            <SectionHeading
              etiqueta={textos.sobre.etiqueta}
              titulo={settings.aboutTitle}
              destaque="joias"
              tone="dark"
            />
            <p className="mt-6 max-w-lg text-base leading-relaxed text-cinza">
              {settings.aboutText}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/sobre" variante="secundario" tone="dark">
                {textos.sobre.ctaPrimario}
              </ButtonLink>
              <ButtonExterno
                href={waLink(mensagemAtendimento(settings), settings)}
                variante="whatsapp"
              >
                {textos.sobre.ctaSecundario}
              </ButtonExterno>
            </div>
          </div>
        </div>
      </SectionInner>
    </Section>
  );
}

/* ── 12. CTA final ──────────────────────────────────────────────────────── */

export function SecaoCtaFinal() {
  const settings = useSettings();

  // O `.feixe-vertical` que ficava aqui SAIU. A luz de ambiente agora atravessa
  // a página inteira e passa por trás desta seção também — dois feixes no mesmo
  // lugar viravam mancha, não brilho.
  return (
    <Section tone="dark" luz={0.7} className="relative overflow-hidden">
      <div className="relative shell py-16 text-center md:py-24">
        <h2 className="mx-auto max-w-2xl font-display text-[clamp(1.75rem,4vw,3rem)] leading-[1.08]">
          Encontre a joia que representa o seu{" "}
          <span className="text-ouro">momento</span>.
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-cinza">
          {textos.ctaFinal.descricao}
        </p>
        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <ButtonExterno
            href={waLink(mensagemAtendimento(settings), settings)}
            variante="whatsapp"
            tamanho="lg"
          >
            {textos.ctaFinal.ctaPrimario}
          </ButtonExterno>
          <ButtonLink href="/catalogo" variante="secundario" tone="dark" tamanho="lg">
            {textos.ctaFinal.ctaSecundario}
          </ButtonLink>
        </div>
        <p className="mt-8 text-xs text-cinza/60">
          {site.name} · Joalheria com confecção própria desde {site.foundedYear}
        </p>
      </div>
    </Section>
  );
}
