"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { precoTexto, descontoPercentual, brl } from "@/lib/format";
import { hasDiscount } from "@/types";
import type { Product, Tone } from "@/types";
import { FavoriteButton } from "./FavoriteButton";
import { ProductImage } from "./ProductImage";

/**
 * Célula da vitrine — a foto É o card.
 *
 * A imagem sangra o card inteiro e a informação pousa sobre o degradê da
 * base, no mesmo desenho dos cards de categoria e coleção: nome, preço e um
 * único sinal de entrada (o círculo dourado). Foi pedido do cliente: o bloco
 * de texto embaixo da foto desalinhava as fileiras no mobile (cada nome
 * quebra numa altura) e multiplicava chamadas no card.
 *
 * O que saiu do card NÃO sumiu do site: disponibilidade, ficha técnica e
 * estoque baixo continuam na página da peça, que é onde a decisão acontece.
 *
 * Decisões que permanecem:
 *
 * 1. **Não existe botão de WhatsApp aqui.** O card leva à página da peça, onde
 *    a pessoa vê a ficha completa antes de abrir a conversa.
 *
 * 2. **Um selo por card.** Hierarquia: Exclusivo > Novidade.
 *
 * 3. **Link esticado**, não card envolvido por `<a>`. O coração precisa ser
 *    clicável de forma independente (ele tem `z-20`), e âncora dentro de
 *    âncora é HTML inválido. O círculo de seta é `aria-hidden`: o alvo é o
 *    card inteiro — ele não é um segundo botão.
 */
export function ProductCard({
  produto,
  prioridade = false,
}: {
  produto: Product;
  /** Aceito por compatibilidade com a grade; a base do card é sempre escura
   *  (a informação vive sobre a foto), então o tom do fundo não muda nada. */
  tone?: Tone;
  prioridade?: boolean;
}) {
  const desconto = descontoPercentual(produto);

  const selo = produto.exclusive
    ? "Exclusivo"
    : produto.newArrival
      ? "Novidade"
      : null;

  return (
    <article className="cartao group relative aspect-[3/4]">
      <ProductImage
        produto={produto}
        prioridade={prioridade}
        className="img-zoom"
      />
      {/* O feixe atravessa a foto uma vez, no hover. */}
      <span className="feixe-varre" aria-hidden />

      {/* Selo e desconto empilham no mesmo canto para não cercar a foto de
          etiquetas — o canto oposto é do coração. */}
      <span className="absolute top-2.5 left-2.5 flex flex-col items-start gap-1.5">
        {selo && (
          <span className="rounded-full bg-onix/70 px-3 py-1.5 font-sans text-[10px] font-medium tracking-[0.14em] text-ouro uppercase backdrop-blur-md">
            {selo}
          </span>
        )}
        {desconto !== null && (
          <span className="rounded-full bg-ouro px-2.5 py-1 font-sans text-[10px] font-semibold tracking-wide text-onix">
            -{desconto}%
          </span>
        )}
      </span>

      <FavoriteButton
        slug={produto.slug}
        nome={produto.name}
        tone="dark"
        className="absolute top-1.5 right-1.5 rounded-full bg-onix/45 backdrop-blur-md"
      />

      {/* No celular o card tem ~170px de largura: tipo e seta encolhem um
          passo para o nome caber em duas linhas sem trancar em reticências e
          o preço não quebrar. No `sm` tudo volta ao corpo cheio. */}
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 bg-gradient-to-t from-onix via-onix/70 to-transparent p-3 pt-12 sm:gap-3 sm:p-4 sm:pt-14">
        <div className="min-w-0">
          <h3 className="font-display-sm text-sm leading-snug text-marfim sm:text-base">
            <Link
              href={`/produto/${produto.slug}`}
              // Link esticado: a área de toque é o card inteiro.
              className="after:absolute after:inset-0 after:content-['']"
            >
              <span className="line-clamp-2">{produto.name}</span>
            </Link>
          </h3>
          <p className="mt-1 flex flex-wrap items-baseline gap-x-2">
            {hasDiscount(produto) && produto.price !== null && (
              <span className="text-xs text-cinza line-through">
                {brl(produto.price)}
              </span>
            )}
            {/* `ouro` sobre a base do degradê (ônix): 9,5:1. */}
            <span className="text-xs font-medium text-ouro sm:text-sm">
              {precoTexto(produto)}
            </span>
          </p>
        </div>

        <span
          className="grid size-8 shrink-0 place-items-center rounded-full bg-ouro text-onix transition-transform group-hover:-translate-y-0.5 sm:size-9"
          aria-hidden
        >
          <ArrowUpRight className="size-3.5 sm:size-4" strokeWidth={2} />
        </span>
      </div>
    </article>
  );
}
