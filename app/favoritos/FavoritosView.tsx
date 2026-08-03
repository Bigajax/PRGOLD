"use client";

import { Heart } from "lucide-react";
import { site } from "@/config/site";
import { textos } from "@/config/textos";
import { useProdutoPorSlug, useSettings } from "@/components/providers/SiteProvider";
import { useFavorites } from "@/hooks/useFavorites";
import { mensagemFavoritos, waLink } from "@/lib/whatsapp";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import { EmptyState, ProductSkeleton } from "@/components/ui/Estados";
import { Button, ButtonExterno, ButtonLink } from "@/components/ui/Button";
import { IconeWhatsApp } from "@/components/ui/Icones";

/**
 * Favoritos do visitante — sem login, guardados no próprio aparelho.
 *
 * Enquanto `pronto` é falso, mostramos o esqueleto: o servidor não conhece o
 * localStorage, e renderizar "lista vazia" antes de ler o storage faria a
 * página piscar "você não tem favoritos" para quem tem.
 */
export function FavoritosView() {
  const { slugs, pronto, limpar } = useFavorites();
  const porSlug = useProdutoPorSlug();
  const settings = useSettings();

  // Slug que não existe mais no catálogo é descartado em silêncio — a peça
  // pode ter saído da vitrine desde que foi salva.
  const produtos = slugs.map((s) => porSlug.get(s)).filter((p) => p !== undefined);

  return (
    <div className="tone-light bg-marfim">
      <div className="shell py-10 md:py-14">
        <h1 className="font-display text-[clamp(1.75rem,4vw,3rem)] leading-[1.08]">
          {textos.favoritos.titulo}
        </h1>
        <p className="mt-3 max-w-xl text-base leading-relaxed text-cinza-2">
          {textos.favoritos.subtitulo}
        </p>

        {!pronto ? (
          <div className="mt-10">
            <ProductSkeleton quantidade={4} />
          </div>
        ) : produtos.length === 0 ? (
          <div className="mt-10">
            <EmptyState
              tone="light"
              icone={<Heart className="size-6" />}
              titulo={textos.favoritos.vazioTitulo}
              texto={textos.favoritos.vazioTexto}
              acao={
                <ButtonLink href="/catalogo" variante="primario" tone="light">
                  Ver catálogo
                </ButtonLink>
              }
            />
          </div>
        ) : (
          <>
            <div className="mt-8 flex flex-wrap items-center gap-3 border-y border-onix/12 py-3">
              <p className="mr-auto text-sm text-cinza-2">
                {produtos.length} {produtos.length === 1 ? "peça salva" : "peças salvas"}
              </p>
              <ButtonExterno
                href={waLink(mensagemFavoritos(produtos, site.url), settings)}
                variante="whatsapp"
              >
                <IconeWhatsApp className="size-4" />
                {textos.favoritos.ctaConsultar}
              </ButtonExterno>
              <Button variante="secundario" tone="light" onClick={limpar}>
                {textos.favoritos.ctaLimpar}
              </Button>
            </div>

            <div className="mt-8">
              <ProductGrid produtos={produtos} tone="light" prioridadeAte={4} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
