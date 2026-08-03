import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getColecao, getColecoesSeguro } from "@/services/catalogo";
import { CatalogView } from "@/components/catalog/CatalogView";
import { ProductSkeleton } from "@/components/ui/Estados";

export async function generateStaticParams() {
  const colecoes = await getColecoesSeguro();
  return colecoes.filter((c) => c.active).map((c) => ({ slug: c.slug }));
}

export async function generateMetadata(
  props: PageProps<"/colecoes/[slug]">
): Promise<Metadata> {
  const { slug } = await props.params;
  const colecao = await getColecao(slug).catch(() => null);
  if (!colecao) return {};

  return {
    title: `Coleção ${colecao.name}`,
    description: colecao.description ?? `Coleção ${colecao.name} da PR Gold.`,
    alternates: { canonical: `/colecoes/${colecao.slug}` },
  };
}

export default async function ColecaoPage(props: PageProps<"/colecoes/[slug]">) {
  const { slug } = await props.params;
  const colecao = await getColecao(slug);

  if (!colecao || !colecao.active) notFound();

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
        colecaoFixa={colecao.slug}
        titulo={`Coleção ${colecao.name}`}
        subtitulo={colecao.description ?? undefined}
      />
    </Suspense>
  );
}
