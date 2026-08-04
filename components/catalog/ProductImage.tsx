import Image from "next/image";
import type { Product } from "@/types";
import { coverImage } from "@/types";

/**
 * Imagem de peça, com placeholder de domínio.
 *
 * Quando não há foto, o lugar não vira um retângulo cinza: desenhamos um
 * estojo aberto sob o feixe de luz, que é a própria linguagem fotográfica da
 * PR Gold. Placeholder genérico sinaliza abandono; placeholder de domínio
 * sinaliza cuidado.
 */
export function ProductImage({
  produto,
  prioridade = false,
  sizes = "(max-width: 768px) 50vw, 25vw",
  className = "",
  indice = 0,
}: {
  produto: Product;
  prioridade?: boolean;
  sizes?: string;
  className?: string;
  indice?: number;
}) {
  const ordenadas = [...produto.images].sort((a, b) => a.position - b.position);
  const imagem = ordenadas[indice] ?? coverImage(produto);

  if (!imagem) return <PlaceholderJoia className={className} />;

  return (
    <Image
      src={imagem.url}
      alt={imagem.alt ?? produto.name}
      fill
      sizes={sizes}
      priority={prioridade}
      quality={prioridade ? 90 : 75}
      className={`object-cover ${className}`}
    />
  );
}

export function PlaceholderJoia({ className = "" }: { className?: string }) {
  return (
    <div
      className={`grid h-full w-full place-items-center bg-onix ${className}`}
      aria-hidden
    >
      <svg
        viewBox="0 0 120 150"
        className="h-3/5 w-auto"
        fill="none"
        role="presentation"
      >
        {/* O feixe, com a oclusão das fotos: aceso acima do estojo (que começa
            em y=40), quase nada atrás dele, um resto de luz sob a base. */}
        <defs>
          <linearGradient
            id="feixe-ph"
            x1="0"
            y1="0"
            x2="0"
            y2="150"
            gradientUnits="userSpaceOnUse"
          >
            {/* #F9E0A6/#F2B83A: a família da `--color-luz` do tema — o facho
                é luz, não o ouro dos controles. */}
            <stop offset="0" stopColor="#F9E0A6" stopOpacity="0.85" />
            <stop offset="0.22" stopColor="#F2B83A" stopOpacity="0.5" />
            <stop offset="0.3" stopColor="#F2B83A" stopOpacity="0.08" />
            <stop offset="0.78" stopColor="#F2B83A" stopOpacity="0.08" />
            <stop offset="1" stopColor="#F2B83A" stopOpacity="0.3" />
          </linearGradient>
          <linearGradient
            id="feixe-ph-halo"
            x1="40"
            y1="0"
            x2="80"
            y2="0"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0" stopColor="#F2B83A" stopOpacity="0" />
            <stop offset="0.5" stopColor="#F2B83A" stopOpacity="0.16" />
            <stop offset="1" stopColor="#F2B83A" stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect x="40" y="0" width="40" height="150" fill="url(#feixe-ph-halo)" />
        <rect x="59" y="0" width="2" height="150" fill="url(#feixe-ph)" />
        {/* Estojo aberto */}
        <path
          d="M28 62 h64 v56 h-64 z"
          stroke="#D4AF37"
          strokeOpacity="0.55"
          strokeWidth="1.5"
        />
        <path
          d="M28 62 l10 -22 h44 l10 22"
          stroke="#D4AF37"
          strokeOpacity="0.35"
          strokeWidth="1.5"
        />
        {/* Peça */}
        <circle cx="60" cy="90" r="11" stroke="#E7CB78" strokeOpacity="0.8" strokeWidth="2" />
      </svg>
    </div>
  );
}
