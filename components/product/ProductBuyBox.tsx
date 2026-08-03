"use client";

import { Share2 } from "lucide-react";
import { LIMIAR_ESTOQUE_BAIXO, RESSALVA_PRECO, textoEncomenda } from "@/config/catalogo";
import { site } from "@/config/site";
import { brl, fichaTecnica, precoTexto, descontoPercentual } from "@/lib/format";
import { mensagemProduto, waLink } from "@/lib/whatsapp";
import { useSettings } from "@/components/providers/SiteProvider";
import { AVAILABILITY_LABEL, deriveAvailability, hasDiscount, isLowStock } from "@/types";
import type { Product } from "@/types";
import { FichaCompleta } from "@/components/ui/Ficha";
import { FavoriteButton } from "@/components/catalog/FavoriteButton";
import { IconeWhatsApp } from "@/components/ui/Icones";
import { toast } from "@/components/ui/Toaster";

/**
 * Coluna de decisão da peça.
 *
 * O CTA é o único ponto do site que abre a conversa sobre uma peça específica,
 * e por isso a mensagem carrega tudo que o atendimento precisaria perguntar:
 * nome, código, valor, disponibilidade e o link da página.
 *
 * No mobile ele também aparece fixo no rodapé — e é por isso que a barra de
 * navegação global desaparece nesta página.
 */
export function ProductBuyBox({ produto }: { produto: Product }) {
  const settings = useSettings();
  const disponibilidade = deriveAvailability(produto);
  const ficha = fichaTecnica(produto);
  const desconto = descontoPercentual(produto);
  const estoqueBaixo = isLowStock(produto, LIMIAR_ESTOQUE_BAIXO);

  const url = `${site.url}/produto/${produto.slug}`;
  const link = waLink(mensagemProduto(produto, url), settings);

  const corBadge =
    disponibilidade === "pronta-entrega"
      ? "border-sucesso text-sucesso"
      : disponibilidade === "sob-encomenda"
        ? "border-ouro-escuro text-ouro-escuro"
        : "border-onix/30 text-cinza-2";

  async function compartilhar() {
    const dados = { title: produto.name, text: produto.name, url };
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(dados);
        return;
      } catch {
        // Compartilhamento cancelado pelo usuário: não é erro, não avisa nada.
        return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      toast("Link copiado");
    } catch {
      toast("Não foi possível copiar o link", "erro");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <span
          className={`inline-flex min-h-8 items-center border px-3 font-sans text-[10px] tracking-[0.18em] uppercase ${corBadge}`}
        >
          {AVAILABILITY_LABEL[disponibilidade]}
          {estoqueBaixo && produto.stockQuantity !== null && (
            <>
              {" · "}
              {produto.stockQuantity === 1
                ? "última unidade"
                : `${produto.stockQuantity} unidades`}
            </>
          )}
        </span>

        <h1 className="mt-4 font-display text-[clamp(1.75rem,4vw,2.75rem)] leading-[1.1]">
          {produto.name}
        </h1>

        <p className="mt-3 font-sans text-[11px] tracking-[0.16em] text-cinza-2 uppercase">
          Código {produto.code}
          {produto.categoryName ? ` · ${produto.categoryName}` : ""}
          {produto.collectionName ? ` · Coleção ${produto.collectionName}` : ""}
        </p>
      </div>

      {produto.shortDescription && (
        <p className="text-base leading-relaxed text-cinza-2">{produto.shortDescription}</p>
      )}

      <div>
        <div className="flex flex-wrap items-baseline gap-3">
          {hasDiscount(produto) && produto.price !== null && (
            <span className="text-base text-cinza-2 line-through">{brl(produto.price)}</span>
          )}
          <span className="font-display text-3xl">{precoTexto(produto)}</span>
          {desconto !== null && (
            <span className="bg-ouro-escuro px-2 py-1 font-sans text-[10px] font-semibold tracking-wider text-marfim">
              -{desconto}%
            </span>
          )}
        </div>
        {/* Só faz sentido ressalvar valor quando existe um valor exibido. */}
        {precoTexto(produto) !== "Valor sob consulta" && (
          <p className="mt-2 text-xs text-cinza-2">{RESSALVA_PRECO}</p>
        )}
      </div>

      {disponibilidade === "sob-encomenda" && (
        <p className="border-l-2 border-ouro-escuro pl-4 text-sm leading-relaxed text-cinza-2">
          {textoEncomenda()}
        </p>
      )}

      {/* CTA principal — desktop. No mobile ele vive na barra fixa. */}
      <div className="hidden flex-col gap-3 md:flex">
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="tap inline-flex min-h-13 items-center justify-center gap-3 border border-whats bg-whats px-7 font-sans text-xs tracking-[0.14em] text-onix uppercase hover:bg-whats/90"
        >
          <IconeWhatsApp className="size-5" />
          Consultar esta joia
        </a>

        <div className="flex items-center gap-2">
          <FavoriteButton
            slug={produto.slug}
            nome={produto.name}
            tone="light"
            tamanho="md"
            className="border border-onix/20"
          />
          <button
            type="button"
            onClick={compartilhar}
            className="tap inline-flex min-h-11 flex-1 items-center justify-center gap-2 border border-onix/20 text-sm hover:border-ouro-escuro"
          >
            <Share2 className="size-4" aria-hidden />
            Compartilhar
          </button>
        </div>
      </div>

      {ficha.length > 0 && (
        <section aria-labelledby="ficha-tecnica" className="mt-2">
          <h2
            id="ficha-tecnica"
            className="mb-3 font-sans text-[11px] tracking-[0.16em] text-cinza-2 uppercase"
          >
            Ficha técnica
          </h2>
          <FichaCompleta linhas={ficha} tone="light" />
        </section>
      )}

      {produto.fullDescription && (
        <details className="border-b border-onix/12 py-4" open>
          <summary className="cursor-pointer font-sans text-[11px] tracking-[0.16em] uppercase">
            Detalhes da peça
          </summary>
          <p className="mt-3 text-sm leading-relaxed text-cinza-2">
            {produto.fullDescription}
          </p>
        </details>
      )}

      <details className="border-b border-onix/12 py-4">
        <summary className="cursor-pointer font-sans text-[11px] tracking-[0.16em] uppercase">
          Como comprar
        </summary>
        <ol className="mt-3 space-y-2 text-sm leading-relaxed text-cinza-2">
          <li>Toque em “Consultar esta joia”. O WhatsApp abre com os dados da peça.</li>
          <li>Um especialista confirma disponibilidade, valor e formas de pagamento.</li>
          <li>Combinamos a entrega junto com você.</li>
        </ol>
        <p className="mt-3 text-xs text-cinza-2">
          Este site é uma vitrine: o botão abre uma conversa, não conclui uma compra.
        </p>
      </details>

      {/* Barra fixa do mobile. A tab bar global some nesta página — um único
          elemento fixo por tela, ou navegação ou ação. */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-onix/15 bg-marfim px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            {/* Abaixo de 380px a linha de disponibilidade sai: com ela, o preço
                e o próprio CTA ficam truncados, e o preço é a informação que
                não pode faltar aqui. */}
            <p className="hidden truncate font-sans text-[10px] tracking-[0.16em] text-cinza-2 uppercase min-[380px]:block">
              {AVAILABILITY_LABEL[disponibilidade]}
            </p>
            <p className="truncate text-sm font-medium">{precoTexto(produto)}</p>
          </div>
          <FavoriteButton
            slug={produto.slug}
            nome={produto.name}
            tone="light"
            tamanho="md"
            className="shrink-0 border border-onix/20"
          />
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="tap inline-flex min-h-12 shrink-0 items-center justify-center gap-2 border border-whats bg-whats px-5 font-sans text-[11px] tracking-[0.12em] text-onix uppercase"
          >
            <IconeWhatsApp className="size-4" />
            Consultar
          </a>
        </div>
      </div>
    </div>
  );
}
