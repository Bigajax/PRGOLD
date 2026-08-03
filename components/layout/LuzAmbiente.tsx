"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * Luz de ambiente da vitrine.
 *
 * Uma camada presa à janela: o conteúdo rola, a luz fica. O feixe deixa de ser
 * propriedade de uma seção e passa a ser a atmosfera da marca.
 *
 * Toda a aparência mora no CSS (`.luz-ambiente` em `globals.css`), inclusive o
 * teto de contraste. Este arquivo só responde a duas perguntas: QUAL seção está
 * no meio da tela, e QUANTO a página já rolou.
 */

/** Força quando a rota não declara nada — catálogo, produto, institucionais. */
const FORCA_REPOUSO = 0.25;

/** Teto do deslocamento do halo, em pixels. */
const DESVIO_MAX = 40;

/** Pixels de halo por pixel de rolagem, até o teto (1000px de scroll -> 25px). */
const DESVIO_POR_SCROLL = 0.025;

export function LuzAmbiente() {
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  /* ── Qual seção manda na luz ────────────────────────────────────────────
     `rootMargin` de -50% em cima e embaixo reduz a raiz a uma LINHA no meio da
     janela. Assim "intersecting" passa a significar "esta seção está no centro
     da tela" — que é a pergunta real, e evita ter de comparar retângulos a cada
     quadro. */
  useEffect(() => {
    const camada = ref.current;
    if (!camada) return;

    const aplicar = (forca: string, tom: string) => {
      camada.style.setProperty("--luz-forca", forca);
      camada.dataset.fundo = tom === "dark" ? "escuro" : "claro";
    };

    const alvos = document.querySelectorAll<HTMLElement>("[data-luz]");

    // Rota sem seção declarada é página de trabalho — filtro, ficha técnica,
    // formulário. Fica no repouso, e o observador nem chega a existir.
    if (alvos.length === 0) {
      aplicar(String(FORCA_REPOUSO), "light");
      return;
    }

    const observador = new IntersectionObserver(
      (entradas) => {
        for (const entrada of entradas) {
          if (!entrada.isIntersecting) continue;
          const alvo = entrada.target as HTMLElement;
          aplicar(alvo.dataset.luz ?? String(FORCA_REPOUSO), alvo.dataset.tom ?? "light");
        }
      },
      { rootMargin: "-50% 0px -50% 0px", threshold: 0 }
    );

    alvos.forEach((alvo) => observador.observe(alvo));
    return () => observador.disconnect();
  }, [pathname]);

  /* ── O halo à deriva ────────────────────────────────────────────────────
     O halo desloca alguns pixels e o núcleo fica parado. É essa diferença que
     dá a sensação de a luz viver numa camada mais profunda que o conteúdo.

     A posição é escrita DIRETO na variável CSS, sem passar por estado: guardar
     scroll em `useState` custaria um render por pixel rolado, e o valor nem é
     lido pelo React — só pelo compositor. */
  useEffect(() => {
    const camada = ref.current;
    if (!camada) return;

    // Camada decorativa não tem como oferecer um botão de pausa, então ela
    // obedece sem discussão.
    const semMovimento = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (semMovimento.matches) {
      camada.style.setProperty("--luz-desvio", "0px");
      return;
    }

    let agendado = false;
    const escrever = () => {
      agendado = false;
      const desvio = Math.min(DESVIO_MAX, window.scrollY * DESVIO_POR_SCROLL);
      camada.style.setProperty("--luz-desvio", `${-desvio.toFixed(1)}px`);
    };

    const aoRolar = () => {
      if (agendado) return;
      agendado = true;
      requestAnimationFrame(escrever);
    };

    escrever();
    window.addEventListener("scroll", aoRolar, { passive: true });
    return () => window.removeEventListener("scroll", aoRolar);
  }, []);

  return (
    <div ref={ref} className="luz-ambiente" data-fundo="claro" aria-hidden>
      {/* O grão é o que costura a página inteira no mesmo ar — sem ele, halo e
          feixe ficam pairando sobre um fundo liso e o efeito não "assenta".
          Mesma técnica do `.veu-botanico` da PR Grife: ruído repetido em
          200x200, em `multiply`, por cima de tudo. */}
      <span className="luz-ambiente__grao" />
    </div>
  );
}
