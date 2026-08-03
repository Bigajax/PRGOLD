"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import {
  ITENS_POR_PAGINA,
  ORDENACOES,
  ORDENACAO_PADRAO,
  type Ordenacao,
} from "@/config/catalogo";
import {
  aplicaFiltros,
  contaFiltrosAtivos,
  facetas as calculaFacetas,
  filtrosDaUrl,
  ordena,
  temFiltroAtivo,
  urlDosFiltros,
  type Filtros,
} from "@/lib/catalogo";
import { useCatalogo, useCategorias, useColecoes } from "@/components/providers/SiteProvider";
import { AVAILABILITY_LABEL } from "@/types";
import { ProductGrid } from "./ProductGrid";
import { EmptyState } from "@/components/ui/Estados";
import { Button, ButtonLink } from "@/components/ui/Button";

/**
 * Catálogo.
 *
 * Todo o estado vive na URL: o resultado é compartilhável no WhatsApp e o
 * botão voltar do navegador funciona. Isso importa mais do que parece — no
 * Android, o gesto de voltar é a forma padrão de desfazer um filtro.
 *
 * As facetas são calculadas sobre o catálogo INTEIRO, antes dos filtros. Sem
 * isso, escolher "feminino" faria as categorias sumirem da lista e a pessoa
 * ficaria sem caminho de volta.
 */
export function CatalogView({
  categoriaFixa,
  colecaoFixa,
  titulo,
  subtitulo,
}: {
  categoriaFixa?: string;
  colecaoFixa?: string;
  titulo: string;
  subtitulo?: string;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const catalogo = useCatalogo();
  const categorias = useCategorias();
  const colecoes = useColecoes();

  const [drawerAberto, setDrawerAberto] = useState(false);

  const ativos = useMemo(
    () => catalogo.filter((p) => p.active && !p.archivedAt),
    [catalogo]
  );

  const filtros: Filtros = useMemo(() => {
    const daUrl = filtrosDaUrl(params);
    // Numa página de categoria ou coleção, o recorte é do contexto e não pode
    // ser removido pelos filtros — é o que a URL da página já promete.
    return {
      ...daUrl,
      ...(categoriaFixa ? { categoria: categoriaFixa } : {}),
      ...(colecaoFixa ? { colecao: colecaoFixa } : {}),
    };
  }, [params, categoriaFixa, colecaoFixa]);

  const ordem = (params.get("ordem") as Ordenacao) || ORDENACAO_PADRAO;
  const pagina = Math.max(1, Number(params.get("pagina") ?? 1) || 1);

  const facetas = useMemo(() => calculaFacetas(ativos), [ativos]);

  const resultado = useMemo(
    () => ordena(aplicaFiltros(ativos, filtros), ordem),
    [ativos, filtros, ordem]
  );

  const totalPaginas = Math.max(1, Math.ceil(resultado.length / ITENS_POR_PAGINA));
  const paginaAtual = Math.min(pagina, totalPaginas);
  const visiveis = resultado.slice(
    (paginaAtual - 1) * ITENS_POR_PAGINA,
    paginaAtual * ITENS_POR_PAGINA
  );

  /** Muda um filtro e volta para a página 1 — senão a pessoa cai numa página vazia. */
  function atualiza(mudanca: Partial<Filtros>, novaOrdem?: Ordenacao) {
    const base: Filtros = { ...filtrosDaUrl(params), ...mudanca };
    if (categoriaFixa) delete base.categoria;
    if (colecaoFixa) delete base.colecao;
    router.push(urlDosFiltros(base, novaOrdem ?? ordem), { scroll: false });
  }

  function vaParaPagina(n: number) {
    const base: Filtros = filtrosDaUrl(params);
    if (categoriaFixa) delete base.categoria;
    if (colecaoFixa) delete base.colecao;
    router.push(urlDosFiltros(base, ordem, n), { scroll: false });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const filtrosVisiveis = { ...filtrosDaUrl(params) };
  if (categoriaFixa) delete filtrosVisiveis.categoria;
  if (colecaoFixa) delete filtrosVisiveis.colecao;
  const qtdFiltros = contaFiltrosAtivos(filtrosVisiveis);

  const nomeCategoria = (slug: string) =>
    categorias.find((c) => c.slug === slug)?.name ?? slug;
  const nomeColecao = (slug: string) =>
    colecoes.find((c) => c.slug === slug)?.name ?? slug;

  const painelFiltros = (
    <div className="space-y-8">
      {!categoriaFixa && facetas.categorias.length > 0 && (
        <GrupoFiltro titulo="Categoria">
          {facetas.categorias.map((f) => (
            <Opcao
              key={f.valor}
              rotulo={nomeCategoria(f.valor)}
              quantidade={f.quantidade}
              ativo={filtros.categoria === f.valor}
              onClick={() =>
                atualiza({ categoria: filtros.categoria === f.valor ? undefined : f.valor })
              }
            />
          ))}
        </GrupoFiltro>
      )}

      {!colecaoFixa && facetas.colecoes.length > 0 && (
        <GrupoFiltro titulo="Coleção">
          {facetas.colecoes.map((f) => (
            <Opcao
              key={f.valor}
              rotulo={nomeColecao(f.valor)}
              quantidade={f.quantidade}
              ativo={filtros.colecao === f.valor}
              onClick={() =>
                atualiza({ colecao: filtros.colecao === f.valor ? undefined : f.valor })
              }
            />
          ))}
        </GrupoFiltro>
      )}

      {facetas.generos.length > 0 && (
        <GrupoFiltro titulo="Para quem">
          {facetas.generos.map((f) => (
            <Opcao
              key={f.valor}
              rotulo={{ feminino: "Feminino", masculino: "Masculino", unissex: "Unissex" }[f.valor] ?? f.valor}
              quantidade={f.quantidade}
              ativo={filtros.genero === f.valor}
              onClick={() =>
                atualiza({ genero: filtros.genero === f.valor ? undefined : f.valor })
              }
            />
          ))}
        </GrupoFiltro>
      )}

      {facetas.ouros.length > 0 && (
        <GrupoFiltro titulo="Tipo de ouro">
          {facetas.ouros.map((f) => (
            <Opcao
              key={f.valor}
              rotulo={{ amarelo: "Ouro amarelo", branco: "Ouro branco", rose: "Ouro rosé" }[f.valor] ?? f.valor}
              quantidade={f.quantidade}
              ativo={filtros.ouro === f.valor}
              onClick={() => atualiza({ ouro: filtros.ouro === f.valor ? undefined : f.valor })}
            />
          ))}
        </GrupoFiltro>
      )}

      {facetas.disponibilidades.length > 0 && (
        <GrupoFiltro titulo="Disponibilidade">
          {facetas.disponibilidades.map((f) => (
            <Opcao
              key={f.valor}
              rotulo={AVAILABILITY_LABEL[f.valor as keyof typeof AVAILABILITY_LABEL] ?? f.valor}
              quantidade={f.quantidade}
              ativo={filtros.disponibilidade === f.valor}
              onClick={() =>
                atualiza({
                  disponibilidade: filtros.disponibilidade === f.valor ? undefined : f.valor,
                })
              }
            />
          ))}
        </GrupoFiltro>
      )}

      <GrupoFiltro titulo="Destaques">
        <Opcao
          rotulo="Novidades"
          ativo={Boolean(filtros.novidade)}
          onClick={() => atualiza({ novidade: filtros.novidade ? undefined : true })}
        />
        <Opcao
          rotulo="Peças exclusivas"
          ativo={Boolean(filtros.exclusivo)}
          onClick={() => atualiza({ exclusivo: filtros.exclusivo ? undefined : true })}
        />
      </GrupoFiltro>

      {temFiltroAtivo(filtrosVisiveis) && (
        <Button
          variante="secundario"
          tone="light"
          className="w-full"
          onClick={() => {
            router.push(urlDosFiltros({}, ordem), { scroll: false });
            setDrawerAberto(false);
          }}
        >
          Limpar filtros
        </Button>
      )}
    </div>
  );

  return (
    <div className="tone-light bg-marfim">
      <div className="shell py-10 md:py-14">
        <h1 className="font-display text-[clamp(1.75rem,4vw,3rem)] leading-[1.08]">
          {titulo}
        </h1>
        {subtitulo && (
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-cinza-2">
            {subtitulo}
          </p>
        )}

        {/* `flex-wrap`: em 320px a contagem, a ordenação e o botão de filtro
            não cabem na mesma linha e empurravam a página para o lado. */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-y border-onix/12 py-3">
          <p className="text-sm text-cinza-2">
            {resultado.length} {resultado.length === 1 ? "peça" : "peças"}
          </p>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm">
              <span className="sr-only sm:not-sr-only sm:text-cinza-2">Ordenar por</span>
              <select
                value={ordem}
                onChange={(e) => atualiza({}, e.target.value as Ordenacao)}
                className="min-h-11 border border-onix/20 bg-transparent px-3 text-sm"
              >
                {ORDENACOES.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="button"
              onClick={() => setDrawerAberto(true)}
              className="tap inline-flex min-h-11 items-center gap-2 border border-onix/20 px-4 text-sm lg:hidden"
            >
              <SlidersHorizontal className="size-4" aria-hidden />
              Filtrar
              {qtdFiltros > 0 && (
                <span className="grid size-5 place-items-center bg-ouro-escuro text-[10px] font-semibold text-marfim">
                  {qtdFiltros}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="mt-8 gap-10 lg:flex">
          <aside className="hidden w-64 shrink-0 lg:block">
            <h2 className="eyebrow mb-6 text-ouro-escuro">Filtros</h2>
            {painelFiltros}
          </aside>

          <div className="min-w-0 flex-1">
            {visiveis.length > 0 ? (
              <>
                <ProductGrid produtos={visiveis} tone="light" prioridadeAte={4} colunas="tres" />

                {totalPaginas > 1 && (
                  <nav aria-label="Paginação" className="mt-10">
                    <ul className="no-scrollbar flex items-center gap-2 overflow-x-auto">
                      {Array.from({ length: totalPaginas }).map((_, i) => {
                        const n = i + 1;
                        const atual = n === paginaAtual;
                        return (
                          <li key={n}>
                            <button
                              type="button"
                              onClick={() => vaParaPagina(n)}
                              aria-current={atual ? "page" : undefined}
                              className={`tap grid size-11 place-items-center border text-sm ${
                                atual
                                  ? "border-onix bg-onix text-marfim"
                                  : "border-onix/20 hover:border-ouro-escuro"
                              }`}
                            >
                              {n}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </nav>
                )}
              </>
            ) : (
              <EmptyState
                tone="light"
                titulo="Nenhuma peça com esses filtros"
                texto="Tente remover um filtro ou volte para o catálogo completo."
                acao={
                  <>
                    <Button
                      variante="primario"
                      tone="light"
                      onClick={() => router.push(urlDosFiltros({}, ordem), { scroll: false })}
                    >
                      Limpar filtros
                    </Button>
                    <ButtonLink href="/catalogo" variante="secundario" tone="light">
                      Ver catálogo
                    </ButtonLink>
                  </>
                }
              />
            )}
          </div>
        </div>
      </div>

      {/* Bottom-sheet no mobile: sobe de baixo, teto de 85vh e um botão final
          que fecha mostrando quantos resultados sobraram. */}
      {drawerAberto && (
        <div className="fixed inset-0 z-[65] lg:hidden">
          <button
            type="button"
            aria-label="Fechar filtros"
            onClick={() => setDrawerAberto(false)}
            className="absolute inset-0 bg-onix/60"
          />
          <div className="tone-light absolute inset-x-0 bottom-0 flex max-h-[85vh] flex-col border-t border-ouro-escuro/40 bg-marfim">
            <div className="flex items-center justify-between border-b border-onix/12 px-5 py-4">
              <h2 className="font-display-sm text-lg">Filtros</h2>
              <button
                type="button"
                onClick={() => setDrawerAberto(false)}
                aria-label="Fechar filtros"
                className="tap grid size-11 place-items-center"
              >
                <X className="size-5" aria-hidden />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-6">
              {painelFiltros}
            </div>

            <div className="border-t border-onix/12 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <Button
                variante="primario"
                tone="light"
                tamanho="lg"
                className="w-full"
                onClick={() => setDrawerAberto(false)}
              >
                Ver {resultado.length} {resultado.length === 1 ? "peça" : "peças"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function GrupoFiltro({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="mb-3 font-sans text-[11px] tracking-[0.14em] text-cinza-2 uppercase">
        {titulo}
      </h3>
      <ul className="space-y-1">{children}</ul>
    </section>
  );
}

function Opcao({
  rotulo,
  quantidade,
  ativo,
  onClick,
}: {
  rotulo: string;
  quantidade?: number;
  ativo: boolean;
  onClick: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        aria-pressed={ativo}
        className={`tap flex min-h-11 w-full items-center justify-between gap-3 border-l-2 pl-3 text-left text-sm ${
          ativo
            ? "border-ouro-escuro font-medium text-ouro-escuro"
            : "border-transparent text-onix hover:border-onix/20"
        }`}
      >
        <span>{rotulo}</span>
        {quantidade !== undefined && (
          <span className="text-xs text-cinza-2">{quantidade}</span>
        )}
      </button>
    </li>
  );
}
