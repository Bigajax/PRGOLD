"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Heart, Menu, Search, X } from "lucide-react";
import { filtrarMenu, menuBarra, menuPrincipal, type NavItem } from "@/config/nav";
import { useCategorias, useSettings } from "@/components/providers/SiteProvider";
import { useFavorites } from "@/hooks/useFavorites";
import { mensagemAtendimento, waLink } from "@/lib/whatsapp";
import { Logo } from "./Logo";
import { PainelBusca, useBusca } from "./SearchOverlay";

/**
 * Cabeçalho fixo.
 *
 * Ônix, e isso é decisão de marca, não inércia: o brasão da PR Gold é dourado
 * com filete fino e "SINCE 2019" em corpo minúsculo. Sobre marfim ele apaga —
 * foi testado. Fundo escuro é o único em que a marca aparece inteira.
 *
 * A barra NÃO lista categoria. Onze links sempre visíveis não eram onze
 * caminhos, eram uma parede: a pessoa lia todos para achar um. Ficaram dois
 * rótulos, e o resto abre num painel sob "Catálogo".
 *
 * Também não há WhatsApp nem botão de catálogo aqui. O WhatsApp já está no
 * botão flutuante, na gaveta do mobile e no rodapé; e o catálogo, na primeira
 * linha do painel e no botão do hero. Repetido no topo, virava ruído ao lado
 * de um menu que já se chama "Catálogo".
 *
 * Ao rolar, o cabeçalho reduz a altura — sem efeito de vidro, que sobre
 * fotografia vira mancha.
 */
export function Header() {
  /** Guarda a rota em que o menu foi aberto; `null` significa fechado. */
  const [abertoEm, setAbertoEm] = useState<string | null>(null);
  const pathname = usePathname();
  const { abrir } = useBusca();
  const { total, pronto } = useFavorites();
  const categorias = useCategorias();
  const settings = useSettings();

  const itens = filtrarMenu(
    menuPrincipal,
    categorias.filter((c) => c.active).map((c) => c.slug)
  );

  // O que a barra já mostra não se repete dentro do painel.
  const noPainel = itens.filter((i) => !menuBarra.some((b) => b.href === i.href));

  // A posição da rolagem é estado do NAVEGADOR, não do React. Ler por
  // `useSyncExternalStore` evita o render em cascata que um `setState` no
  // corpo do efeito provocaria a cada montagem do cabeçalho.
  const rolou = useSyncExternalStore(
    (callback) => {
      window.addEventListener("scroll", callback, { passive: true });
      return () => window.removeEventListener("scroll", callback);
    },
    () => window.scrollY > 24,
    () => false
  );

  // Navegar fecha o menu. Em vez de um efeito que zera o estado depois da
  // troca de rota (render em cascata), a abertura é DERIVADA: o menu só conta
  // como aberto enquanto a rota for a mesma de quando ele foi aberto. Cobre
  // inclusive o botão voltar do Android.
  const menuAberto = abertoEm !== null && abertoEm === pathname;

  useEffect(() => {
    document.body.style.overflow = menuAberto ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuAberto]);

  return (
    <>
      <header
        className={`sticky top-0 z-50 border-b border-ouro/20 bg-onix transition-[height] duration-300 ${
          rolou ? "h-[4.5rem]" : "h-24"
        }`}
      >
        <div className="shell flex h-full items-center justify-between gap-4">
          {/* Mobile: hambúrguer */}
          <button
            type="button"
            onClick={() => setAbertoEm(pathname)}
            aria-label="Abrir menu"
            aria-expanded={menuAberto}
            className="tap -ml-2 grid size-11 place-items-center text-marfim lg:hidden"
          >
            <Menu className="size-5" aria-hidden />
          </button>

          <div className="lg:flex-1">
            <Logo tamanho={rolou ? "sm" : "md"} />
          </div>

          <nav aria-label="Menu principal" className="hidden lg:block">
            <ul className="flex items-center gap-8">
              <li>
                <MenuCatalogo itens={noPainel} pathname={pathname} />
              </li>
              {menuBarra
                .filter((item) => item.href !== "/catalogo")
                .map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="cabecalho__link">
                      {item.label}
                    </Link>
                  </li>
                ))}
            </ul>
          </nav>

          {/* Só buscar e favoritos. Ver comentário do topo: WhatsApp e botão de
              catálogo saíram porque já existem em outros três lugares cada. */}
          <div className="flex items-center gap-1 lg:flex-1 lg:justify-end">
            {/* Dois botões para o mesmo gesto, e não um com `if` de largura:
                a escolha é de layout, então quem decide é a media query. No
                telefone abre a tela cheia; no desktop, o painel ancorado. */}
            <button
              type="button"
              onClick={abrir}
              aria-label="Buscar peças"
              className="tap grid size-11 place-items-center text-marfim hover:text-ouro lg:hidden"
            >
              <Search className="size-5" aria-hidden />
            </button>

            <BuscaAncorada pathname={pathname} />

            <Link
              href="/favoritos"
              aria-label={`Favoritos${pronto && total ? ` (${total})` : ""}`}
              className="tap relative grid size-11 place-items-center text-marfim hover:text-ouro"
            >
              <Heart className="size-5" aria-hidden />
              {pronto && total > 0 && (
                <span className="absolute top-1.5 right-1.5 grid size-4 place-items-center bg-ouro font-sans text-[9px] font-semibold text-onix">
                  {total > 9 ? "9+" : total}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Gaveta de navegação no mobile — 86% da largura, como manda o padrão:
          a faixa que sobra mostra que a página continua ali atrás.
          No telefone a lista continua inteira e plana: não há hover para abrir
          painel, e esconder categoria atrás de um acordeão só somaria um toque. */}
      {menuAberto && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button
            type="button"
            aria-label="Fechar menu"
            onClick={() => setAbertoEm(null)}
            className="absolute inset-0 bg-onix/70"
          />
          <div className="absolute inset-y-0 left-0 flex w-[86%] max-w-sm flex-col border-r border-ouro/25 bg-onix">
            <div className="flex items-center justify-between border-b border-ouro/20 px-5 py-4">
              <Logo tamanho="sm" />
              <button
                type="button"
                onClick={() => setAbertoEm(null)}
                aria-label="Fechar menu"
                className="tap grid size-11 place-items-center text-marfim"
              >
                <X className="size-5" aria-hidden />
              </button>
            </div>

            <nav aria-label="Menu" className="flex-1 overflow-y-auto px-5 py-4">
              <ul className="divide-y divide-ouro/12">
                {itens.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="tap flex min-h-12 items-center font-sans text-sm tracking-[0.12em] text-marfim uppercase"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="border-t border-ouro/20 p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
              <a
                href={waLink(mensagemAtendimento(settings), settings)}
                target="_blank"
                rel="noopener noreferrer"
                className="tap flex min-h-12 items-center justify-center border border-whats bg-whats font-sans text-[11px] tracking-[0.14em] text-onix uppercase"
              >
                Falar pelo WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * Busca do desktop: o botão e o painel que ele abre, ancorados no canto.
 *
 * O painel não fecha por `mouseleave` como o menu de catálogo: quem está
 * digitando tira o mouse do caminho, e o painel sumir no meio da frase seria
 * hostil. Fecha no `Escape`, no clique fora e quando o foco sai do bloco.
 */
function BuscaAncorada({ pathname }: { pathname: string }) {
  const [abertoEm, setAbertoEm] = useState<string | null>(null);
  const aberto = abertoEm !== null && abertoEm === pathname;
  const blocoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!aberto) return;

    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAbertoEm(null);
    };
    const aoApontar = (e: PointerEvent) => {
      if (!blocoRef.current?.contains(e.target as Node)) setAbertoEm(null);
    };

    document.addEventListener("keydown", aoTeclar);
    document.addEventListener("pointerdown", aoApontar);
    return () => {
      document.removeEventListener("keydown", aoTeclar);
      document.removeEventListener("pointerdown", aoApontar);
    };
  }, [aberto]);

  return (
    <div
      ref={blocoRef}
      className="relative hidden lg:block"
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setAbertoEm(null);
        }
      }}
    >
      <button
        type="button"
        aria-label="Buscar peças"
        aria-expanded={aberto}
        aria-controls="painel-busca"
        onClick={() => setAbertoEm(aberto ? null : pathname)}
        className="tap grid size-11 place-items-center text-marfim hover:text-ouro"
      >
        <Search className="size-5" aria-hidden />
      </button>

      {aberto && (
        <div id="painel-busca" className="absolute top-full right-0 pt-4">
          <PainelBusca aoFechar={() => setAbertoEm(null)} />
        </div>
      )}
    </div>
  );
}

/**
 * "Catálogo" e o painel que ele abre.
 *
 * Abre no ponteiro E no teclado — um painel que só existe no hover é um painel
 * que não existe para quem navega por Tab. Daí as três saídas: `Escape`, foco
 * saindo do bloco e troca de rota.
 *
 * O gatilho é `<button>`, e não link: ele abre um painel, não navega. Quem quer
 * o catálogo inteiro tem a primeira linha do painel e o botão "Ver catálogo" à
 * direita da barra.
 */
function MenuCatalogo({ itens, pathname }: { itens: NavItem[]; pathname: string }) {
  // Mesmo truque da gaveta do mobile: a abertura é derivada da rota, então
  // navegar fecha o painel sem efeito em cascata.
  const [abertoEm, setAbertoEm] = useState<string | null>(null);
  const aberto = abertoEm !== null && abertoEm === pathname;

  useEffect(() => {
    if (!aberto) return;
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAbertoEm(null);
    };
    document.addEventListener("keydown", aoTeclar);
    return () => document.removeEventListener("keydown", aoTeclar);
  }, [aberto]);

  if (itens.length === 0) {
    return (
      <Link href="/catalogo" className="cabecalho__link">
        Catálogo
      </Link>
    );
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setAbertoEm(pathname)}
      onMouseLeave={() => setAbertoEm(null)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setAbertoEm(null);
        }
      }}
    >
      <button
        type="button"
        aria-expanded={aberto}
        aria-controls="painel-catalogo"
        onClick={() => setAbertoEm(aberto ? null : pathname)}
        className="cabecalho__link tap inline-flex items-center gap-1.5"
      >
        Catálogo
        <ChevronDown
          className={`size-3.5 transition-transform duration-200 ${aberto ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>

      {aberto && (
        <div
          id="painel-catalogo"
          className="absolute top-full left-1/2 w-[24rem] -translate-x-1/2 pt-4"
        >
          <div className="border border-ouro/20 bg-onix-2 p-5 shadow-[0_18px_44px_rgba(0,0,0,0.45)]">
            <Link
              href="/catalogo"
              className="mb-3 block border-b border-ouro/15 pb-3 font-sans text-[11px] tracking-[0.16em] text-ouro uppercase hover:underline"
            >
              Todas as peças
            </Link>
            <ul className="grid grid-cols-2 gap-x-6">
              {itens.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="tap flex min-h-10 items-center font-sans text-sm text-marfim hover:text-ouro"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
