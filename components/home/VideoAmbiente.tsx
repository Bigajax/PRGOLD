"use client";

import { useEffect, useRef } from "react";
import { midia } from "@/config/site";

/**
 * Vídeo de ambiente: mudo, em laço, sem controles.
 *
 * Um `<video autoplay>` falha em silêncio por vários motivos diferentes, e
 * cada um precisa do seu remédio — por isso este componente insiste em vez de
 * tentar uma vez só:
 *
 * 1. **Aba em segundo plano.** O Chrome suspende mídia enquanto a página está
 *    oculta: `readyState` fica em 0 e nenhum byte é baixado, mesmo com
 *    `play()` chamado. Ao voltar à frente, tentamos de novo.
 * 2. **Fora da tela.** Vídeo abaixo da dobra é despriorizado. O
 *    IntersectionObserver dá play quando ele entra em cena e pausa quando sai
 *    — o que também economiza bateria.
 * 3. **Política de autoplay.** Se o navegador recusar, o primeiro toque ou
 *    clique em qualquer lugar da página destrava.
 * 4. **`muted` no HTML do servidor.** O React não serializa esse atributo, e
 *    sem ele o autoplay é bloqueado. É reforçado por propriedade.
 *
 * `preload="auto"`: os arquivos têm entre 250 KB e 1,6 MB, com o índice no
 * começo. Segurar o download com `metadata` só troca peso por risco de o
 * primeiro quadro nunca chegar.
 */
export function VideoAmbiente({
  src,
  poster,
  className = "",
}: {
  src: string;
  poster: string;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;

    const reduzido =
      midia.respeitarMovimentoReduzido &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduzido) {
      v.pause();
      return;
    }

    v.muted = true;
    v.defaultMuted = true;

    const tentar = () => {
      if (document.visibilityState !== "visible") return;
      if (!v.paused && v.readyState >= 2) return;
      // `load()` quando nada chegou: em aba que estava suspensa, só o `play()`
      // não reinicia a busca dos dados.
      if (v.readyState === 0 && v.networkState !== 2) v.load();
      void v.play().catch(() => {
        /* recusado agora; um dos gatilhos abaixo tenta de novo */
      });
    };

    tentar();

    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) tentar();
        else if (!v.paused) v.pause();
      },
      { threshold: 0.1 }
    );
    observador.observe(v);

    const aoVoltar = () => tentar();
    const aoInteragir = () => tentar();

    document.addEventListener("visibilitychange", aoVoltar);
    window.addEventListener("focus", aoVoltar);
    v.addEventListener("canplay", aoVoltar);
    v.addEventListener("loadeddata", aoVoltar);
    // `once` no gesto: destrava a política de autoplay e sai de cena.
    document.addEventListener("pointerdown", aoInteragir, { once: true });
    document.addEventListener("keydown", aoInteragir, { once: true });

    return () => {
      observador.disconnect();
      document.removeEventListener("visibilitychange", aoVoltar);
      window.removeEventListener("focus", aoVoltar);
      v.removeEventListener("canplay", aoVoltar);
      v.removeEventListener("loadeddata", aoVoltar);
      document.removeEventListener("pointerdown", aoInteragir);
      document.removeEventListener("keydown", aoInteragir);
    };
  }, []);

  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      aria-hidden
      tabIndex={-1}
      className={`h-full w-full object-cover ${className}`}
    />
  );
}
