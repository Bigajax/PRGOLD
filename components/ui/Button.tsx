import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import type { Tone } from "@/types";

type Variante = "primario" | "secundario" | "whatsapp" | "texto";
type Tamanho = "md" | "lg";

/**
 * Botão em pílula.
 *
 * Três escolhas que definem o caráter:
 *
 * 1. **Raio total.** A pílula é o que mais rápido lê como "controle" — o olho
 *    reconhece antes de ler o rótulo.
 * 2. **Caixa de frase, não caixa alta.** Caixa alta com espaçamento largo é
 *    etiqueta de vitrine, não ação. As etiquetas do site continuam em caixa
 *    alta; os botões passaram a falar como quem convida.
 * 3. **Altura generosa.** 48px no tamanho médio, 56px no grande: acima do
 *    piso de toque, não em cima dele.
 *
 * `tone` continua obrigatório nas variantes que dependem do fundo. Dourado
 * puro sobre marfim reprova em contraste, e um botão que adivinha o fundo
 * erra em silêncio.
 */

const base =
  "tap inline-flex items-center justify-center gap-2 rounded-full border text-center font-sans font-medium leading-none disabled:cursor-not-allowed disabled:opacity-45";

const tamanhos: Record<Tamanho, string> = {
  md: "min-h-12 px-6 py-3 text-[0.8125rem] tracking-[0.01em]",
  lg: "min-h-14 px-8 py-4 text-[0.9375rem] tracking-[0.01em]",
};

function classesDe(variante: Variante, tone: Tone): string {
  if (variante === "whatsapp") {
    return "border-transparent bg-whats text-onix shadow-[0_2px_10px_rgba(37,211,102,0.25)] hover:bg-[#1fbe5c] hover:shadow-[0_4px_18px_rgba(37,211,102,0.35)]";
  }

  if (variante === "primario") {
    return tone === "dark"
      ? "border-transparent bg-ouro text-onix shadow-[0_2px_10px_rgba(212,175,55,0.22)] hover:bg-ouro-claro hover:shadow-[0_4px_18px_rgba(212,175,55,0.32)]"
      : "border-transparent bg-onix text-marfim shadow-[0_2px_10px_rgba(8,8,8,0.16)] hover:bg-[#1c1c1c] hover:shadow-[0_6px_22px_rgba(8,8,8,0.22)]";
  }

  if (variante === "secundario") {
    // Fundo levemente preenchido em vez de transparente: é o "botão fosco" do
    // sistema da Apple, que existe sem competir com o botão principal.
    return tone === "dark"
      ? "border-ouro/25 bg-marfim/[0.06] text-marfim hover:border-ouro/45 hover:bg-marfim/10"
      : "border-onix/12 bg-onix/[0.04] text-onix hover:border-onix/20 hover:bg-onix/[0.07]";
  }

  // texto: sem moldura nem fundo — a ação terciária
  return tone === "dark"
    ? "border-transparent px-2 text-cinza hover:text-ouro"
    : "border-transparent px-2 text-cinza-2 hover:text-ouro-escuro";
}

type Comum = {
  variante?: Variante;
  tone?: Tone;
  tamanho?: Tamanho;
  className?: string;
  children: ReactNode;
};

export function Button({
  variante = "primario",
  tone = "dark",
  tamanho = "md",
  className = "",
  children,
  ...props
}: Comum & ComponentProps<"button">) {
  return (
    <button
      className={`${base} ${tamanhos[tamanho]} ${classesDe(variante, tone)} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function ButtonLink({
  variante = "primario",
  tone = "dark",
  tamanho = "md",
  className = "",
  children,
  href,
  ...props
}: Comum & ComponentProps<typeof Link>) {
  return (
    <Link
      href={href}
      className={`${base} ${tamanhos[tamanho]} ${classesDe(variante, tone)} ${className}`}
      {...props}
    >
      {children}
    </Link>
  );
}

/**
 * Link externo. Sempre `rel="noopener noreferrer"` e sempre acionado por
 * clique — nenhum link do site abre sozinho.
 */
export function ButtonExterno({
  variante = "whatsapp",
  tone = "dark",
  tamanho = "md",
  className = "",
  children,
  href,
  ...props
}: Comum & ComponentProps<"a">) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`${base} ${tamanhos[tamanho]} ${classesDe(variante, tone)} ${className}`}
      {...props}
    >
      {children}
    </a>
  );
}
