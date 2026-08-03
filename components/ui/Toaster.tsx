"use client";

import { useEffect, useState } from "react";
import { CircleAlert, CircleCheck } from "lucide-react";

/**
 * Avisos curtos, sem dependência externa.
 *
 * Qualquer módulo dispara com `toast("mensagem")` — inclusive fora de
 * componente React, o que é o motivo de usar CustomEvent em vez de contexto.
 */

const EVENTO = "prgold:toast";

export type ToastTipo = "sucesso" | "erro";

export function toast(mensagem: string, tipo: ToastTipo = "sucesso") {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(EVENTO, { detail: { mensagem, tipo } })
  );
}

type Item = { id: number; mensagem: string; tipo: ToastTipo };

export function Toaster() {
  const [itens, setItens] = useState<Item[]>([]);

  useEffect(() => {
    let seq = 0;
    const aoReceber = (e: Event) => {
      const { mensagem, tipo } = (e as CustomEvent).detail as Omit<Item, "id">;
      const id = ++seq;
      setItens((atual) => [...atual, { id, mensagem, tipo }]);
      window.setTimeout(() => {
        setItens((atual) => atual.filter((i) => i.id !== id));
      }, 3200);
    };
    window.addEventListener(EVENTO, aoReceber);
    return () => window.removeEventListener(EVENTO, aoReceber);
  }, []);

  if (itens.length === 0) return null;

  return (
    <div
      // Acima da barra fixa inferior no mobile, para não ficar escondido atrás
      // dela; no desktop, canto inferior com respiro.
      className="pointer-events-none fixed inset-x-0 bottom-20 z-[60] flex flex-col items-center gap-2 px-4 lg:bottom-8"
      aria-live="polite"
      role="status"
    >
      {itens.map((item) => (
        <div
          key={item.id}
          className={`pointer-events-auto flex max-w-md items-center gap-3 border px-4 py-3 text-sm shadow-lg ${
            item.tipo === "erro"
              ? "border-alerta bg-onix text-marfim"
              : "border-ouro/40 bg-onix text-marfim"
          }`}
        >
          {item.tipo === "erro" ? (
            <CircleAlert className="size-4 shrink-0 text-alerta" aria-hidden />
          ) : (
            <CircleCheck className="size-4 shrink-0 text-ouro" aria-hidden />
          )}
          <span>{item.mensagem}</span>
        </div>
      ))}
    </div>
  );
}
