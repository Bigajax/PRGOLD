"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { buscar, MIN_BUSCA } from "@/lib/catalogo";
import { useCatalogo, useSettings } from "@/components/providers/SiteProvider";
import { useArmazenamentoLocal } from "@/hooks/useArmazenamentoLocal";
import { mensagemBuscaVazia, waLink } from "@/lib/whatsapp";
import { precoTexto } from "@/lib/format";
import { ButtonExterno, ButtonLink } from "@/components/ui/Button";
import { ProductImage } from "@/components/catalog/ProductImage";

/* ── Contexto ───────────────────────────────────────────────────────────── */

type BuscaContexto = { aberta: boolean; abrir: () => void; fechar: () => void };
const Contexto = createContext<BuscaContexto | null>(null);

export function useBusca(): BuscaContexto {
  const ctx = useContext(Contexto);
  if (!ctx) throw new Error("useBusca precisa estar dentro de <SearchProvider>.");
  return ctx;
}

/**
 * O provider fica ACIMA do header, da barra inferior e do botão flutuante.
 *
 * O motivo é técnico, não organizacional: com a busca aberta esses elementos
 * precisam DESMONTAR. Barra fixa e teclado do iOS brigam — dentro do
 * navegador embutido do Instagram, o resultado é o campo de busca escondido
 * atrás da própria barra.
 */
export function SearchProvider({ children }: { children: ReactNode }) {
  const [aberta, setAberta] = useState(false);

  const abrir = useCallback(() => setAberta(true), []);
  const fechar = useCallback(() => setAberta(false), []);

  const valor = useMemo(() => ({ aberta, abrir, fechar }), [aberta, abrir, fechar]);

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

/* ── Overlay ────────────────────────────────────────────────────────────── */

const CHAVE_RECENTES = "prgold:buscas";
const MAX_RECENTES = 6;

/** Atalhos oferecidos antes de a pessoa digitar. */
const BUSCAS_FREQUENTES = [
  "corrente",
  "aliança",
  "anel",
  "pulseira",
  "crucifixo",
  "personalizado",
];

/** Quantas peças o painel do desktop mostra antes de mandar para o catálogo. */
const MAX_NO_PAINEL = 5;

/**
 * Grava a busca no histórico local. Usado pelos dois formatos.
 */
function useRecentes() {
  const { lista, definir } = useArmazenamentoLocal(CHAVE_RECENTES);
  const gravar = useCallback(
    (t: string) => {
      const limpo = t.trim();
      if (!limpo) return;
      definir((atual) =>
        [limpo, ...atual.filter((r) => r.toLowerCase() !== limpo.toLowerCase())].slice(
          0,
          MAX_RECENTES
        )
      );
    },
    [definir]
  );
  return { recentes: lista, gravar };
}

/**
 * Busca do desktop: painel ancorado no próprio botão do cabeçalho.
 *
 * Aqui a barra de escrever é MOLDURA, e não uma linha solta: num painel
 * pequeno, um campo sem contorno lê como título da caixa e a pessoa não sabe
 * onde clicar. No overlay de tela cheia o problema não existe, porque lá o
 * campo ocupa a largura toda e tem o ícone colado.
 *
 * O overlay de tela cheia continua sendo o formato do telefone — ver o
 * comentário do `SearchProvider` sobre teclado do iOS e barra fixa.
 */
export function PainelBusca({ aoFechar }: { aoFechar: () => void }) {
  const catalogo = useCatalogo();
  const settings = useSettings();
  const { recentes, gravar } = useRecentes();

  const [termo, setTermo] = useState("");
  const [debounced, setDebounced] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(termo), 220);
    return () => window.clearTimeout(t);
  }, [termo]);

  // O painel só existe depois de um clique, então focar na montagem é o
  // comportamento esperado: a pessoa abriu para digitar.
  useLayoutEffect(() => {
    inputRef.current?.focus();
  }, []);

  const resultados = useMemo(
    () => (debounced.trim().length >= MIN_BUSCA ? buscar(catalogo, debounced) : []),
    [catalogo, debounced]
  );

  const buscou = debounced.trim().length >= MIN_BUSCA;
  const sugestoes = recentes.length > 0 ? recentes : BUSCAS_FREQUENTES;

  return (
    <div className="w-[26rem] border border-ouro/20 bg-onix-2 p-4 shadow-[0_18px_44px_rgba(0,0,0,0.45)]">
      {/* A moldura é o ponto do pedido: o campo precisa PARECER campo. */}
      <div className="flex items-center gap-2 border border-ouro/30 bg-onix px-3 focus-within:border-ouro">
        <Search className="size-4 shrink-0 text-ouro" aria-hidden />
        <input
          ref={inputRef}
          type="search"
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && termo.trim().length >= MIN_BUSCA) gravar(termo);
          }}
          placeholder="Buscar por corrente, aliança, anel..."
          aria-label="Buscar peças"
          // 16px explícito: menos que isso e o iOS dá zoom ao focar.
          className="min-h-11 min-w-0 flex-1 bg-transparent text-[16px] text-marfim placeholder:text-cinza/50 focus:outline-none"
        />
        {termo && (
          <button
            type="button"
            onClick={() => {
              setTermo("");
              inputRef.current?.focus();
            }}
            aria-label="Limpar busca"
            className="tap grid size-8 shrink-0 place-items-center text-cinza hover:text-ouro"
          >
            <X className="size-4" aria-hidden />
          </button>
        )}
      </div>

      {!buscou && (
        <div className="mt-4">
          <p className="eyebrow mb-3 text-ouro">
            {recentes.length > 0 ? "Buscas recentes" : "Buscas frequentes"}
          </p>
          <ul className="flex flex-wrap gap-2">
            {sugestoes.map((t) => (
              <li key={t}>
                <button
                  type="button"
                  onClick={() => {
                    setTermo(t);
                    gravar(t);
                    inputRef.current?.focus();
                  }}
                  className="tap min-h-9 border border-ouro/30 px-3 text-xs text-marfim hover:border-ouro hover:text-ouro"
                >
                  {t}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {buscou && resultados.length > 0 && (
        <div className="mt-4">
          <ul className="divide-y divide-ouro/15">
            {resultados.slice(0, MAX_NO_PAINEL).map((p) => (
              <li key={p.id}>
                <Link
                  href={`/produto/${p.slug}`}
                  onClick={() => {
                    gravar(debounced);
                    aoFechar();
                  }}
                  className="tap flex items-center gap-3 py-2.5"
                >
                  <span className="relative block size-12 shrink-0 overflow-hidden bg-grafite">
                    <ProductImage produto={p} sizes="48px" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-display-sm text-sm text-marfim">
                      {p.name}
                    </span>
                    <span className="block truncate text-xs text-cinza">
                      {p.categoryName ?? "Peça em ouro"} · {precoTexto(p)}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          {resultados.length > MAX_NO_PAINEL && (
            <Link
              href={`/catalogo?q=${encodeURIComponent(debounced)}`}
              onClick={() => {
                gravar(debounced);
                aoFechar();
              }}
              className="mt-3 block border-t border-ouro/15 pt-3 font-sans text-[11px] tracking-[0.16em] text-ouro uppercase hover:underline"
            >
              Ver as {resultados.length} peças
            </Link>
          )}
        </div>
      )}

      {buscou && resultados.length === 0 && (
        <div className="mt-4 border border-dashed border-ouro/25 px-4 py-6 text-center">
          <p className="text-sm text-marfim">Nenhuma peça para “{debounced}”.</p>
          <p className="mt-1 text-xs text-cinza">
            Nossa equipe pode procurar para você.
          </p>
          <div className="mt-4">
            <ButtonExterno
              href={waLink(mensagemBuscaVazia(debounced), settings)}
              variante="whatsapp"
            >
              Perguntar no WhatsApp
            </ButtonExterno>
          </div>
        </div>
      )}
    </div>
  );
}

export function SearchOverlay() {
  const { aberta, fechar } = useBusca();
  const catalogo = useCatalogo();
  const settings = useSettings();

  const [termo, setTermo] = useState("");
  const [debounced, setDebounced] = useState("");

  // As buscas recentes vivem no navegador, não no React: quem lê é o
  // `useSyncExternalStore` dentro do hook, e não um efeito de montagem.
  const { recentes, gravar: gravaRecente } = useRecentes();

  const inputRef = useRef<HTMLInputElement>(null);
  const painelRef = useRef<HTMLDivElement>(null);
  const scrollSalvo = useRef(0);

  // Debounce de 220ms: rápido o bastante para parecer instantâneo, lento o
  // bastante para não recalcular a cada tecla.
  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(termo), 220);
    return () => window.clearTimeout(t);
  }, [termo]);

  // O foco precisa acontecer no MESMO tique do layout. Dentro de setTimeout o
  // iOS considera que não houve gesto do usuário e não abre o teclado.
  useLayoutEffect(() => {
    if (aberta) inputRef.current?.focus();
  }, [aberta]);

  useEffect(() => {
    if (!aberta) return;

    // Trava o corpo guardando a posição, e restaura exatamente onde estava.
    scrollSalvo.current = window.scrollY;
    const body = document.body;
    body.style.position = "fixed";
    body.style.top = `-${scrollSalvo.current}px`;
    body.style.width = "100%";

    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        fechar();
        return;
      }
      // Armadilha de foco manual: sem isto o Tab escapa para a página que
      // está atrás do overlay.
      if (e.key === "Tab" && painelRef.current) {
        const focaveis = painelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])'
        );
        if (focaveis.length === 0) return;
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
      window.scrollTo(0, scrollSalvo.current);
    };
  }, [aberta, fechar]);

  const resultados = useMemo(
    () => (debounced.trim().length >= MIN_BUSCA ? buscar(catalogo, debounced) : []),
    [catalogo, debounced]
  );

  if (!aberta) return null;

  const buscou = debounced.trim().length >= MIN_BUSCA;
  const semResultado = buscou && resultados.length === 0;

  const escolher = (t: string) => {
    setTermo(t);
    gravaRecente(t);
  };

  return (
    // `lg:hidden`: no desktop a busca é o painel ancorado no cabeçalho
    // (`PainelBusca`). A tela cheia continua sendo o formato do telefone pelo
    // motivo descrito no `SearchProvider` — barra fixa e teclado do iOS.
    <div
      className="fixed inset-0 z-[70] flex flex-col bg-onix lg:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Buscar peças"
      ref={painelRef}
    >
      <div className="shell flex items-center gap-3 border-b border-ouro/25 py-4">
        <Search className="size-5 shrink-0 text-ouro" aria-hidden />
        <input
          ref={inputRef}
          type="search"
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && termo.trim().length >= MIN_BUSCA) {
              gravaRecente(termo);
            }
          }}
          placeholder="Buscar por corrente, aliança, anel..."
          aria-label="Buscar peças"
          // 16px explícito: menos que isso e o iOS dá zoom ao focar.
          className="min-w-0 flex-1 bg-transparent text-[16px] text-marfim placeholder:text-cinza/50 focus:outline-none"
        />
        <button
          type="button"
          onClick={fechar}
          aria-label="Fechar busca"
          className="tap grid size-11 place-items-center text-marfim hover:text-ouro"
        >
          <X className="size-5" aria-hidden />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto overscroll-contain">
        <div className="shell py-6">
          {!buscou && (
            <div className="space-y-8">
              {recentes.length > 0 && (
                <section>
                  <h2 className="eyebrow mb-4 text-ouro">Buscas recentes</h2>
                  <ul className="flex flex-wrap gap-2">
                    {recentes.map((r) => (
                      <li key={r}>
                        <button
                          type="button"
                          onClick={() => escolher(r)}
                          className="tap min-h-11 border border-ouro/30 px-4 text-sm text-marfim hover:border-ouro hover:text-ouro"
                        >
                          {r}
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              <section>
                <h2 className="eyebrow mb-4 text-ouro">Buscas frequentes</h2>
                <ul className="flex flex-wrap gap-2">
                  {BUSCAS_FREQUENTES.map((t) => (
                    <li key={t}>
                      <button
                        type="button"
                        onClick={() => escolher(t)}
                        className="tap min-h-11 border border-ouro/30 px-4 text-sm text-marfim hover:border-ouro hover:text-ouro"
                      >
                        {t}
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          )}

          {buscou && resultados.length > 0 && (
            <>
              <p className="eyebrow mb-4 text-cinza">
                {resultados.length} {resultados.length === 1 ? "peça" : "peças"}
              </p>
              <ul className="divide-y divide-ouro/15">
                {resultados.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/produto/${p.slug}`}
                      onClick={() => {
                        gravaRecente(debounced);
                        fechar();
                      }}
                      className="tap flex items-center gap-4 py-3"
                    >
                      <span className="relative block size-16 shrink-0 overflow-hidden bg-grafite">
                        <ProductImage produto={p} sizes="64px" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-display-sm text-base text-marfim">
                          {p.name}
                        </span>
                        <span className="block text-xs text-cinza">
                          {p.categoryName ?? "Peça em ouro"} · {precoTexto(p)}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}

          {semResultado && (
            <div className="flex flex-col items-center gap-5 border border-dashed border-ouro/25 px-6 py-14 text-center">
              <Search className="size-6 text-ouro" aria-hidden />
              <div>
                <h2 className="font-display-sm text-xl text-marfim">
                  Nenhuma peça encontrada
                </h2>
                <p className="mt-2 text-sm text-cinza">
                  Não achamos nada para “{debounced}”. Nossa equipe pode procurar
                  para você.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-3">
                <ButtonLink href="/catalogo" variante="secundario" tone="dark" onClick={fechar}>
                  Ver catálogo
                </ButtonLink>
                <ButtonExterno
                  href={waLink(mensagemBuscaVazia(debounced), settings)}
                  variante="whatsapp"
                >
                  Perguntar no WhatsApp
                </ButtonExterno>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
