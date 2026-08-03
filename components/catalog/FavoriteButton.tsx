"use client";

import { Heart } from "lucide-react";
import { useFavorites } from "@/hooks/useFavorites";
import { toast } from "@/components/ui/Toaster";
import type { Tone } from "@/types";

/**
 * Coração de favorito.
 *
 * Fica DENTRO do card, que por sua vez tem um link esticado sobre toda a
 * área. Sem `stopPropagation` + `preventDefault`, tocar no coração navegaria
 * para a peça em vez de salvá-la.
 *
 * Até montar, renderiza no estado neutro (`pronto === false`): o servidor não
 * conhece o localStorage, e pintar o coração antes disso quebra a hidratação.
 */
export function FavoriteButton({
  slug,
  nome,
  tone,
  tamanho = "sm",
  className = "",
}: {
  slug: string;
  nome: string;
  tone: Tone;
  tamanho?: "sm" | "md";
  className?: string;
}) {
  const { ehFavorito, alternar, pronto } = useFavorites();
  const ativo = pronto && ehFavorito(slug);

  const dimensao = tamanho === "sm" ? "size-8" : "size-11";
  const icone = tamanho === "sm" ? "size-4" : "size-5";

  const cor = ativo
    ? tone === "dark"
      ? "text-ouro"
      : "text-ouro-escuro"
    : tone === "dark"
      ? "text-marfim/70 hover:text-ouro"
      : "text-onix/50 hover:text-ouro-escuro";

  return (
    <button
      type="button"
      aria-pressed={ativo}
      aria-label={ativo ? `Remover ${nome} dos favoritos` : `Salvar ${nome} nos favoritos`}
      // Sem classe de posicionamento na base, de propósito: quem chama decide.
      // Duas utilitárias de `position` no mesmo elemento não se resolvem pela
      // ordem da string, e sim pela ordem no CSS gerado — `relative` sai depois
      // de `absolute` e venceria, jogando o botão para fora do canto.
      className={`tap z-20 grid place-items-center ${dimensao} ${cor} ${className}`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const agora = alternar(slug);
        toast(agora ? "Salvo nos seus favoritos" : "Removido dos favoritos");
      }}
    >
      <Heart className={icone} fill={ativo ? "currentColor" : "none"} aria-hidden />
    </button>
  );
}
