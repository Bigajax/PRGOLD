import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCategoria, getCategoriasSeguro } from "@/services/catalogo";
import { CatalogView } from "@/components/catalog/CatalogView";
import { ProductSkeleton } from "@/components/ui/Estados";

/**
 * Categoria = catálogo com um recorte fixo.
 *
 * Reaproveita o MESMO componente do catálogo com `categoriaFixa`, em vez de
 * duplicar a lógica de filtro, ordenação e paginação numa segunda tela.
 */

export async function generateStaticParams() {
  const categorias = await getCategoriasSeguro();
  return categorias.filter((c) => c.active).map((c) => ({ categoria: c.slug }));
}

export async function generateMetadata(
  props: PageProps<"/catalogo/[categoria]">
): Promise<Metadata> {
  const { categoria: slug } = await props.params;
  // `.catch` para que uma falha de banco não derrube a página inteira com 500.
  const categoria = await getCategoria(slug).catch(() => null);
  if (!categoria) return {};

  return {
    title: categoria.name,
    description:
      categoria.description ??
      `${categoria.name} em ouro na vitrine da PR Gold.`,
    alternates: { canonical: `/catalogo/${categoria.slug}` },
  };
}

export default async function CategoriaPage(props: PageProps<"/catalogo/[categoria]">) {
  const { categoria: slug } = await props.params;
  const categoria = await getCategoria(slug);

  if (!categoria || !categoria.active) notFound();

  return (
    <Suspense
      fallback={
        <div className="tone-light bg-marfim">
          <div className="shell py-14">
            <ProductSkeleton />
          </div>
        </div>
      }
    >
      <CatalogView
        categoriaFixa={categoria.slug}
        titulo={categoria.name}
        subtitulo={categoria.description ?? undefined}
      />
    </Suspense>
  );
}
