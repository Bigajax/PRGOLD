import { Suspense } from "react";
import type { Metadata } from "next";
import { textos } from "@/config/textos";
import { CatalogView } from "@/components/catalog/CatalogView";
import { ProductSkeleton } from "@/components/ui/Estados";

export const metadata: Metadata = {
  title: "Catálogo",
  description:
    "Alianças, anéis, correntes, colares, pulseiras e pingentes em ouro. Todas as peças da vitrine da PR Gold.",
  alternates: { canonical: "/catalogo" },
};

export default function CatalogoPage() {
  return (
    // `useSearchParams` exige Suspense: sem ele a rota inteira vira dinâmica e
    // perde a pré-renderização.
    <Suspense
      fallback={
        <div className="tone-light bg-marfim">
          <div className="shell py-14">
            <ProductSkeleton />
          </div>
        </div>
      }
    >
      <CatalogView titulo={textos.catalogo.titulo} subtitulo={textos.catalogo.subtitulo} />
    </Suspense>
  );
}
