"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Entrada gradual ao rolar.
 *
 * O fallback de movimento reduzido NÃO é tratado aqui em JavaScript: o CSS já
 * neutraliza a classe `.reveal` sob `prefers-reduced-motion`, então quem tem a
 * preferência ligada vê o conteúdo direto, mesmo antes de qualquer observação.
 *
 * O `setState` acontece dentro do callback do IntersectionObserver — que é
 * exatamente o uso previsto de um efeito: assinar uma fonte externa e reagir a
 * ela, e não sincronizar estado no primeiro render.
 */
export function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    const elemento = ref.current;
    if (!elemento) return;

    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) {
          setVisivel(true);
          observador.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.05 }
    );

    observador.observe(elemento);
    return () => observador.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${visivel ? "is-visible" : ""} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
