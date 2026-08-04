"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gem, Heart, House, Search } from "lucide-react";
import { IconeWhatsApp } from "@/components/ui/Icones";
import { useSettings } from "@/components/providers/SiteProvider";
import { useFavorites } from "@/hooks/useFavorites";
import { mensagemAtendimento, waLink } from "@/lib/whatsapp";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { LuzAmbiente } from "./LuzAmbiente";
import { useBusca } from "./SearchOverlay";

/**
 * Chrome do site: barra do topo, cabeçalho, barra fixa inferior e botão
 * flutuante do WhatsApp.
 *
 * Regra do rodapé fixo: UM elemento por tela. Na página de produto a barra de
 * navegação some, porque lá o rodapé pertence ao CTA de consulta. Duas barras
 * fixas empilhadas comem um terço da tela útil do celular.
 *
 * Com a busca aberta, todo o chrome desmonta — barra fixa e teclado do iOS não
 * convivem, e o pior ambiente (navegador embutido do Instagram) é justamente
 * onde a maior parte do público chega.
 */

function ehPaginaDeProduto(pathname: string) {
  return pathname.startsWith("/produto/");
}

/**
 * O painel vive dentro do mesmo layout raiz (para reaproveitar os providers),
 * mas NÃO pode herdar o chrome da vitrine: cabeçalho de loja em cima da tela
 * de cadastro rouba altura útil e confunde quem está operando.
 */
function ehPainel(pathname: string) {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

export function SiteHeader() {
  const { aberta } = useBusca();
  const pathname = usePathname();
  if (aberta || ehPainel(pathname)) return null;
  // Sem barra acima do cabeçalho: a frase dela passou para o rodapé, e os 36px
  // que ela ocupava voltaram para o hero e para a faixa de elos.
  return <Header />;
}

/**
 * Luz de ambiente — atmosfera da vitrine.
 *
 * Some no painel pelo mesmo motivo do cabeçalho: /admin é ferramenta de
 * trabalho, e ali cada pixel de tela vale mais que qualquer efeito.
 *
 * Diferente do resto do chrome, ela NÃO desmonta com a busca aberta: o overlay
 * de busca é `z-70` e cobre a camada, então não há conflito a resolver.
 */
export function SiteLuz() {
  const pathname = usePathname();
  if (ehPainel(pathname)) return null;
  return <LuzAmbiente />;
}

/** Rodapé da vitrine — some no painel pelo mesmo motivo do cabeçalho. */
export function SiteFooter() {
  const { aberta } = useBusca();
  const pathname = usePathname();
  if (aberta || ehPainel(pathname)) return null;
  return <Footer />;
}

export function FloatingWhatsApp() {
  const { aberta } = useBusca();
  const pathname = usePathname();
  const settings = useSettings();

  if (aberta || ehPaginaDeProduto(pathname) || ehPainel(pathname)) return null;

  return (
    <a
      href={waLink(mensagemAtendimento(settings), settings)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar com a PR Gold pelo WhatsApp"
      // Acima da barra inferior, com a área segura do iPhone somada.
      // Círculo verde com o glifo branco: é a forma em que o WhatsApp é
      // reconhecido em qualquer site. O raio 0 do sistema não vale aqui — a
      // própria paleta abre exceção para controle circular.
      className="tap fixed right-4 bottom-[calc(5.25rem+env(safe-area-inset-bottom))] z-40 grid size-13 place-items-center rounded-full bg-whats text-white shadow-lg lg:bottom-8"
    >
      <IconeWhatsApp className="size-7" />
    </a>
  );
}

export function TabBar() {
  const { aberta, abrir } = useBusca();
  const pathname = usePathname();
  const { total, pronto } = useFavorites();

  if (aberta || ehPaginaDeProduto(pathname) || ehPainel(pathname)) return null;

  const itens = [
    { label: "Início", href: "/", icone: House },
    // `Gem`: numa joalheria, o catálogo é onde estão as joias. O `Sparkles`
    // que estava aqui lia como "efeitos" ou "IA", não como vitrine.
    { label: "Catálogo", href: "/catalogo", icone: Gem },
    { label: "Buscar", href: null, icone: Search, acao: abrir },
    { label: "Favoritos", href: "/favoritos", icone: Heart, contador: pronto ? total : 0 },
  ];

  /* Pílula flutuante de vidro, no desenho das barras do iOS: descolada das
     bordas, raio total, fundo translúcido com blur.

     A OPACIDADE DO VIDRO É MEDIDA, não estética: sobre seção clara o blur
     mistura marfim no fundo da pílula. Em 70% de ônix o rótulo `cinza` caía
     para 2,2:1; em 90% ele mede 5,0:1 e o ativo em `ouro-claro` 4,7:1 — por
     isso o ativo usa `ouro-claro` (o `ouro` puro media 3,6:1 no pior caso). */
  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-4 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-40 lg:hidden"
    >
      <ul className="mx-auto grid max-w-md grid-cols-4 overflow-hidden rounded-full border border-marfim/10 bg-onix/90 shadow-[0_12px_32px_rgba(8,8,8,0.35)] backdrop-blur-xl">
        {itens.map((item) => {
          const Icone = item.icone;
          const ativo = item.href
            ? item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href)
            : false;
          const cor = ativo ? "text-ouro-claro" : "text-cinza";

          const conteudo = (
            <>
              <span className="relative">
                <Icone className="size-5" aria-hidden />
                {item.contador ? (
                  <span className="absolute -top-1.5 -right-2 grid size-4 place-items-center rounded-full bg-ouro font-sans text-[9px] font-semibold text-onix">
                    {item.contador > 9 ? "9+" : item.contador}
                  </span>
                ) : null}
              </span>
              <span className="font-sans text-[10px] tracking-[0.1em] uppercase">
                {item.label}
              </span>
            </>
          );

          return (
            <li key={item.label}>
              {item.href ? (
                <Link
                  href={item.href}
                  aria-current={ativo ? "page" : undefined}
                  className={`tap flex min-h-14 flex-col items-center justify-center gap-1 ${cor}`}
                >
                  {conteudo}
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={item.acao}
                  className={`tap flex min-h-14 w-full flex-col items-center justify-center gap-1 ${cor}`}
                >
                  {conteudo}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Espaçador da barra fixa: sem ele o rodapé fica atrás dela no mobile.
 *  4,5rem = altura da pílula (3,5rem) + o respiro que a descola do rodapé. */
export function TabBarSpacer() {
  const pathname = usePathname();
  if (ehPaginaDeProduto(pathname) || ehPainel(pathname)) return null;
  return <div className="h-[4.5rem] pb-[env(safe-area-inset-bottom)] lg:hidden" aria-hidden />;
}
