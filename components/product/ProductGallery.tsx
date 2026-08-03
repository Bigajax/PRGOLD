"use client";

import { useState } from "react";
import Image from "next/image";
import type { Product } from "@/types";
import { PlaceholderJoia } from "@/components/catalog/ProductImage";

/**
 * Galeria da peça.
 *
 * Mobile: carrossel por gesto, com snap e contador. Nada de setas minúsculas —
 * o polegar já sabe arrastar.
 * Desktop: imagem grande + miniaturas verticais.
 */
export function ProductGallery({ produto }: { produto: Product }) {
  const imagens = [...produto.images].sort((a, b) => a.position - b.position);
  const [ativa, setAtiva] = useState(0);

  if (imagens.length === 0) {
    return (
      <div className="relative aspect-[3/4] w-full">
        <PlaceholderJoia />
      </div>
    );
  }

  return (
    <div className="md:flex md:flex-row-reverse md:gap-4">
      {/* Mobile: trilho com snap */}
      <div className="md:hidden">
        <div
          className="trilho trilho--cheio no-scrollbar"
          onScroll={(e) => {
            const el = e.currentTarget;
            const i = Math.round(el.scrollLeft / el.clientWidth);
            if (i !== ativa) setAtiva(i);
          }}
        >
          {imagens.map((img, i) => (
            <div key={img.url} className="relative aspect-[3/4] w-full bg-onix">
              <Image
                src={img.url}
                alt={img.alt ?? produto.name}
                fill
                sizes="100vw"
                priority={i === 0}
                quality={90}
                className="object-cover"
              />
            </div>
          ))}
        </div>

        {imagens.length > 1 && (
          <div className="mt-3 flex items-center justify-center gap-2" aria-hidden>
            {imagens.map((img, i) => (
              <span
                key={img.url}
                className={`h-px w-6 transition-colors ${
                  i === ativa ? "bg-ouro-escuro" : "bg-onix/20"
                }`}
              />
            ))}
            <span className="ml-3 font-sans text-[11px] tracking-widest text-cinza-2">
              {ativa + 1} / {imagens.length}
            </span>
          </div>
        )}
      </div>

      {/* Desktop: imagem grande + miniaturas */}
      <div className="hidden flex-1 md:block">
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-onix">
          <Image
            src={imagens[ativa].url}
            alt={imagens[ativa].alt ?? produto.name}
            fill
            sizes="(max-width: 1024px) 60vw, 45vw"
            priority
            quality={90}
            className="object-cover"
          />
        </div>
      </div>

      {imagens.length > 1 && (
        <ul className="hidden w-20 shrink-0 space-y-3 md:block">
          {imagens.map((img, i) => (
            <li key={img.url}>
              <button
                type="button"
                onClick={() => setAtiva(i)}
                aria-label={`Ver foto ${i + 1} de ${imagens.length}`}
                aria-pressed={i === ativa}
                className={`tap relative block aspect-[3/4] w-full overflow-hidden border bg-onix ${
                  i === ativa ? "border-ouro-escuro" : "border-transparent opacity-70"
                }`}
              >
                <Image
                  src={img.url}
                  alt=""
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
