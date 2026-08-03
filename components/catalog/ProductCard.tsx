"use client";

import Link from "next/link";
import { LIMIAR_ESTOQUE_BAIXO } from "@/config/catalogo";
import { fichaCompacta, precoTexto, descontoPercentual } from "@/lib/format";
import { AVAILABILITY_LABEL, deriveAvailability, hasDiscount, isLowStock } from "@/types";
import type { Product, Tone } from "@/types";
import { brl } from "@/lib/format";
import { FavoriteButton } from "./FavoriteButton";
import { ProductImage } from "./ProductImage";
import { FichaCompacta } from "@/components/ui/Ficha";

/**
 * Célula da vitrine.
 *
 * Três decisões que valem registrar:
 *
 * 1. **Não existe botão de WhatsApp aqui.** O card leva à página da peça, onde
 *    a pessoa vê a ficha técnica completa antes de abrir a conversa. Encurtar
 *    esse caminho faria a mensagem chegar sem contexto, e o atendimento
 *    gastaria uma ida e volta só para descobrir de qual peça se trata.
 *
 * 2. **Um selo por card.** Hierarquia: Exclusivo > Novidade. Três selos
 *    empilhados não destacam nada.
 *
 * 3. **Link esticado**, não card envolvido por `<a>`. O coração precisa ser
 *    clicável de forma independente, e âncora dentro de âncora é HTML inválido.
 */
export function ProductCard({
  produto,
  tone,
  prioridade = false,
}: {
  produto: Product;
  tone: Tone;
  prioridade?: boolean;
}) {
  const disponibilidade = deriveAvailability(produto);
  const estoqueBaixo = isLowStock(produto, LIMIAR_ESTOQUE_BAIXO);
  const desconto = descontoPercentual(produto);

  const selo = produto.exclusive
    ? "Exclusivo"
    : produto.newArrival
      ? "Novidade"
      : null;

  const secundario = tone === "dark" ? "text-cinza" : "text-cinza-2";
  const dourado = tone === "dark" ? "text-ouro" : "text-ouro-escuro";

  return (
    <article className="cartao group flex flex-col">
      {/* A foto tem raio próprio, menor que o do cartão: raio interno igual ao
          externo deixa a moldura com espessura irregular nos cantos — é a
          regra do raio concêntrico. */}
      <div className="relative m-1.5 aspect-[3/4] overflow-hidden rounded-[0.875rem] bg-onix">
        <ProductImage
          produto={produto}
          prioridade={prioridade}
          className="img-zoom"
        />
        {/* O feixe atravessa a foto uma vez, no hover. */}
        <span className="feixe-varre" aria-hidden />

        {selo && (
          <span className="absolute top-2.5 left-2.5 rounded-full bg-onix/70 px-3 py-1.5 font-sans text-[10px] font-medium tracking-[0.14em] text-ouro uppercase backdrop-blur-md">
            {selo}
          </span>
        )}

        <FavoriteButton
          slug={produto.slug}
          nome={produto.name}
          tone="dark"
          className="absolute top-1.5 right-1.5 rounded-full bg-onix/45 backdrop-blur-md"
        />

        {desconto !== null && (
          <span className="absolute right-2.5 bottom-2.5 rounded-full bg-ouro px-2.5 py-1 font-sans text-[10px] font-semibold tracking-wide text-onix">
            -{desconto}%
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4 pt-2.5">
        <p className={`font-sans text-[10px] tracking-[0.18em] uppercase ${dourado}`}>
          {AVAILABILITY_LABEL[disponibilidade]}
          {estoqueBaixo && produto.stockQuantity !== null && (
            <span className={secundario}>
              {" "}
              · {produto.stockQuantity === 1 ? "última unidade" : `${produto.stockQuantity} unidades`}
            </span>
          )}
        </p>

        <h3 className="font-display-sm text-base leading-snug">
          <Link
            href={`/produto/${produto.slug}`}
            // Link esticado: a área de toque é o card inteiro.
            className="after:absolute after:inset-0 after:content-['']"
          >
            <span className="line-clamp-2">{produto.name}</span>
          </Link>
        </h3>

        <FichaCompacta texto={fichaCompacta(produto)} tone={tone} />

        <div className="mt-auto flex items-baseline gap-2 pt-2">
          {hasDiscount(produto) && produto.price !== null && (
            <span className={`text-xs line-through ${secundario}`}>
              {brl(produto.price)}
            </span>
          )}
          <span className="text-sm font-medium">{precoTexto(produto)}</span>
        </div>
      </div>
    </article>
  );
}
