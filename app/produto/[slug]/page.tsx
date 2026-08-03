import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { site } from "@/config/site";
import { getCatalogoSeguro, getProduto } from "@/services/catalogo";
import { relacionados } from "@/lib/catalogo";
import { effectivePrice, deriveAvailability, coverImage } from "@/types";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductBuyBox } from "@/components/product/ProductBuyBox";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import { SectionHeading } from "@/components/ui/SectionHeading";

export async function generateStaticParams() {
  const catalogo = await getCatalogoSeguro();
  return catalogo
    .filter((p) => p.active && !p.archivedAt)
    .map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(
  props: PageProps<"/produto/[slug]">
): Promise<Metadata> {
  const { slug } = await props.params;
  // Falha de banco não pode derrubar a página com 500 — sem metadata, o Next
  // cai no template do layout.
  const produto = await getProduto(slug).catch(() => null);
  if (!produto) return {};

  const capa = coverImage(produto);

  return {
    title: produto.seoTitle ?? produto.name,
    description:
      produto.seoDescription ??
      produto.shortDescription ??
      `${produto.name} em ouro. Código ${produto.code}. Consulte pela PR Gold.`,
    alternates: { canonical: `/produto/${produto.slug}` },
    openGraph: {
      title: produto.name,
      description: produto.shortDescription ?? site.description,
      url: `${site.url}/produto/${produto.slug}`,
      images: capa ? [{ url: capa.url, alt: capa.alt ?? produto.name }] : undefined,
    },
  };
}

export default async function ProdutoPage(props: PageProps<"/produto/[slug]">) {
  const { slug } = await props.params;
  const produto = await getProduto(slug);

  if (!produto || !produto.active || produto.archivedAt) notFound();

  const catalogo = await getCatalogoSeguro();
  const relacionadas = relacionados(
    catalogo.filter((p) => p.active && !p.archivedAt),
    produto,
    4
  );

  const disponibilidade = deriveAvailability(produto);
  const preco = effectivePrice(produto);
  const capa = coverImage(produto);

  /**
   * JSON-LD do produto.
   *
   * `availability` é derivada da MESMA função que pinta o selo na tela — o
   * buscador nunca vê uma disponibilidade diferente da que o visitante vê.
   * Sem preço confirmado, não existe bloco `offers`: inventar um valor para o
   * Google é tão errado quanto inventar para o cliente.
   */
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: produto.name,
    sku: produto.code,
    ...(produto.shortDescription ? { description: produto.shortDescription } : {}),
    ...(capa ? { image: `${site.url}${capa.url}` } : {}),
    ...(produto.material ? { material: produto.material } : {}),
    brand: { "@type": "Brand", name: site.name },
    ...(preco !== null
      ? {
          offers: {
            "@type": "Offer",
            priceCurrency: "BRL",
            price: preco,
            url: `${site.url}/produto/${produto.slug}`,
            availability:
              disponibilidade === "pronta-entrega"
                ? "https://schema.org/InStock"
                : disponibilidade === "sob-encomenda"
                  ? "https://schema.org/PreOrder"
                  : "https://schema.org/LimitedAvailability",
          },
        }
      : {}),
  };

  const migalhas = [
    { nome: "Início", url: "/" },
    { nome: "Catálogo", url: "/catalogo" },
    ...(produto.categorySlug && produto.categoryName
      ? [{ nome: produto.categoryName, url: `/catalogo/${produto.categorySlug}` }]
      : []),
    { nome: produto.name, url: `/produto/${produto.slug}` },
  ];

  const jsonLdMigalhas = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: migalhas.map((m, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: m.nome,
      item: `${site.url}${m.url}`,
    })),
  };

  return (
    <div className="tone-light bg-marfim pb-28 md:pb-0">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdMigalhas) }}
      />

      <div className="shell pt-6">
        <nav aria-label="Você está em">
          <ol className="no-scrollbar flex items-center gap-2 overflow-x-auto text-xs whitespace-nowrap text-cinza-2">
            {migalhas.map((m, i) => (
              <li key={m.url} className="flex items-center gap-2">
                {i < migalhas.length - 1 ? (
                  <>
                    <Link href={m.url} className="tap hover:text-ouro-escuro">
                      {m.nome}
                    </Link>
                    <span aria-hidden>/</span>
                  </>
                ) : (
                  <span aria-current="page" className="text-onix">
                    {m.nome}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      </div>

      <div className="shell grid gap-10 py-8 md:grid-cols-2 md:gap-14 md:py-12">
        <ProductGallery produto={produto} />
        <ProductBuyBox produto={produto} />
      </div>

      {relacionadas.length > 0 && (
        <section className="shell border-t border-onix/12 py-14">
          <SectionHeading
            etiqueta="Seleção"
            titulo="Você também pode gostar"
            tone="light"
          />
          <div className="mt-8">
            <ProductGrid produtos={relacionadas} tone="light" />
          </div>
        </section>
      )}
    </div>
  );
}
