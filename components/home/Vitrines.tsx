import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { textos } from "@/config/textos";
import type { Category, Collection, InstagramPost, Moment, Product } from "@/types";
import { Section, SectionInner } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ButtonLink } from "@/components/ui/Button";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import { PlaceholderJoia } from "@/components/catalog/ProductImage";
import { Reveal } from "@/components/ui/Reveal";

/**
 * Seções de vitrine da home.
 *
 * Toda seção dinâmica é embrulhada em `length > 0` e devolve `null` quando não
 * tem conteúdo. Uma seção "Coleções" vazia ou um carrossel com um item só
 * gritam loja parada — a seção some, e não se desculpa.
 */

/* ── 4. Categorias ──────────────────────────────────────────────────────── */

export function SecaoCategorias({ categorias }: { categorias: Category[] }) {
  if (categorias.length === 0) return null;

  // O ritmo largo-estreito-estreito só fecha quando a contagem é múltipla de
  // três. Com cinco ou sete categorias a última fileira ficaria manca, então o
  // ritmo é abandonado e todos os cartões voltam a ter a mesma largura.
  const ritmoLargo = categorias.length % 3 === 0;

  return (
    <Section tone="light" luz={0.3}>
      <SectionInner>
        <SectionHeading
          etiqueta={textos.categorias.etiqueta}
          titulo={textos.categorias.titulo}
          tone="light"
          acao={
            <Link
              href="/catalogo"
              className="group inline-flex items-center gap-2 font-sans text-sm font-medium text-ouro-escuro underline-offset-4 hover:underline"
            >
              {textos.categorias.verTudo}
              <ArrowRight
                className="size-4 transition-transform group-hover:translate-x-0.5"
                aria-hidden
              />
            </Link>
          }
        />

        {/* Duas colunas no mobile, quatro no desktop — e o primeiro cartão de
            cada fileira ocupa duas delas. A assimetria não é enfeite: é o que
            dá uma entrada por fileira e impede que seis retratos iguais leiam
            como grade de estoque. */}
        <ul className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-5">
          {categorias.map((c, i) => {
            const largo = ritmoLargo && i % 3 === 0;
            return (
              <li key={c.slug} className={largo ? "lg:col-span-2" : undefined}>
                <Link href={`/catalogo/${c.slug}`} className="cartao group block">
                  {/* Retrato no mobile, paisagem de altura fixa no desktop: é a
                      altura fixa que faz o cartão largo e os estreitos fecharem
                      a fileira na mesma linha de base. */}
                  <span className="relative block aspect-[3/4] overflow-hidden rounded-[var(--radius-lg)] bg-onix lg:aspect-auto lg:h-64">
                    {c.image ? (
                      <Image
                        src={c.image}
                        alt=""
                        fill
                        sizes={
                          largo
                            ? "(max-width: 1024px) 45vw, 46vw"
                            : "(max-width: 1024px) 45vw, 23vw"
                        }
                        className="img-zoom object-cover opacity-90"
                      />
                    ) : (
                      <PlaceholderJoia />
                    )}
                    <span className="feixe-varre" aria-hidden />
                    <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-gradient-to-t from-onix via-onix/70 to-transparent p-4 pt-12">
                      <span className="font-display-sm text-base text-marfim lg:text-lg">
                        {c.name}
                      </span>
                      {/* Só um sinal de "entra por aqui". O cartão inteiro é o
                          alvo — este círculo não é um segundo botão. */}
                      <span
                        className="grid size-9 shrink-0 place-items-center rounded-full bg-ouro text-onix transition-transform group-hover:-translate-y-0.5"
                        aria-hidden
                      >
                        <ArrowUpRight className="size-4" strokeWidth={2} />
                      </span>
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </SectionInner>
    </Section>
  );
}

/* ── 5. Seleção PR Gold ─────────────────────────────────────────────────── */

export function SecaoDestaques({ produtos }: { produtos: Product[] }) {
  if (produtos.length === 0) return null;

  return (
    <Section tone="light" luz={0.3}>
      <SectionInner className="pt-0">
        <SectionHeading
          etiqueta={textos.destaques.etiqueta}
          titulo={textos.destaques.titulo}
          subtitulo={textos.destaques.subtitulo}
          tone="light"
          acao={
            <ButtonLink href="/catalogo" variante="secundario" tone="light">
              {textos.destaques.ctaLabel}
            </ButtonLink>
          }
        />
        <div className="mt-10">
          <ProductGrid produtos={produtos} tone="light" />
        </div>
      </SectionInner>
    </Section>
  );
}

/* ── 7. Coleções ────────────────────────────────────────────────────────── */

export function SecaoColecoes({ colecoes }: { colecoes: Collection[] }) {
  if (colecoes.length === 0) return null;

  return (
    <Section tone="dark" luz={1}>
      <SectionInner>
        <SectionHeading
          etiqueta={textos.colecoes.etiqueta}
          titulo={textos.colecoes.titulo}
          subtitulo={textos.colecoes.subtitulo}
          tone="dark"
          acao={
            <ButtonLink href="/colecoes" variante="secundario" tone="dark">
              Ver todas
            </ButtonLink>
          }
        />

        <div className="vitrine mt-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {colecoes.map((c) => (
            <Link key={c.slug} href={`/colecoes/${c.slug}`} className="cartao group block">
              <span className="relative m-1.5 block aspect-[4/5] overflow-hidden rounded-[0.875rem] bg-grafite">
                {c.image ? (
                  <Image
                    src={c.image}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="img-zoom object-cover"
                  />
                ) : (
                  <PlaceholderJoia />
                )}
                <span className="feixe-varre" aria-hidden />
              </span>
              <span className="block p-4 pt-2.5">
                <span className="block font-display-sm text-lg text-marfim">{c.name}</span>
                {c.description && (
                  <span className="mt-1 block text-sm leading-relaxed text-cinza">
                    {c.description}
                  </span>
                )}
              </span>
            </Link>
          ))}
        </div>
      </SectionInner>
    </Section>
  );
}

/* ── 8. Momentos ────────────────────────────────────────────────────────── */

export function SecaoMomentos({ momentos }: { momentos: Moment[] }) {
  if (momentos.length === 0) return null;

  return (
    <Section tone="light" luz={0.25}>
      <SectionInner>
        <SectionHeading
          etiqueta={textos.momentos.etiqueta}
          titulo={textos.momentos.titulo}
          subtitulo={textos.momentos.subtitulo}
          tone="light"
        />

        <ul className="mt-10 flex flex-wrap gap-3">
          {momentos.map((m) => (
            <li key={m.slug}>
              <Link
                href={`/catalogo?${m.filterQuery}`}
                className="tap inline-flex min-h-12 items-center rounded-full border border-onix/12 bg-onix/[0.04] px-6 text-sm font-medium hover:border-onix/20 hover:bg-onix/[0.07] hover:text-ouro-escuro"
              >
                {m.name}
              </Link>
            </li>
          ))}
        </ul>
      </SectionInner>
    </Section>
  );
}

/* ── 11. Instagram ──────────────────────────────────────────────────────── */

export function SecaoInstagram({
  posts,
  instagramUrl,
}: {
  posts: InstagramPost[];
  instagramUrl: string;
}) {
  if (posts.length === 0) return null;

  return (
    <Section tone="light" luz={0.25}>
      <SectionInner className="pt-0">
        <SectionHeading
          etiqueta={textos.instagram.etiqueta}
          titulo={textos.instagram.titulo}
          subtitulo={textos.instagram.subtitulo}
          tone="light"
          acao={
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="tap inline-flex min-h-11 items-center border border-onix/25 px-5 font-sans text-[11px] tracking-[0.14em] uppercase hover:border-ouro-escuro hover:text-ouro-escuro"
            >
              {textos.instagram.ctaLabel}
            </a>
          }
        />

        <Reveal>
          <div className="vitrine mt-10 grid-cols-2 md:grid-cols-4 lg:grid-cols-8">
            {posts.map((post) => (
              <a
                key={post.id}
                href={post.postUrl ?? instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="tap group relative block aspect-square overflow-hidden rounded-[var(--radius-md)] bg-onix"
              >
                <Image
                  src={post.image}
                  alt={post.alt ?? "Publicação da PR Gold"}
                  fill
                  sizes="(max-width: 768px) 50vw, 12vw"
                  className="img-zoom object-cover"
                />
                <span className="feixe-varre" aria-hidden />
              </a>
            ))}
          </div>
        </Reveal>
      </SectionInner>
    </Section>
  );
}
