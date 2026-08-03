import type { MetadataRoute } from "next";
import { site } from "@/config/site";
import { getCatalogoSeguro, getCategoriasSeguro, getColecoesSeguro } from "@/services/catalogo";

/**
 * Sitemap.
 *
 * Usa as leituras resilientes: se o banco estiver fora, o sitemap sai com as
 * páginas fixas em vez de falhar a rota inteira.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [catalogo, categorias, colecoes] = await Promise.all([
    getCatalogoSeguro(),
    getCategoriasSeguro(),
    getColecoesSeguro(),
  ]);

  const fixas: MetadataRoute.Sitemap = [
    { url: `${site.url}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${site.url}/catalogo`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${site.url}/colecoes`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${site.url}/monte-sua-peca`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${site.url}/sobre`, changeFrequency: "yearly", priority: 0.5 },
    { url: `${site.url}/contato`, changeFrequency: "yearly", priority: 0.5 },
    { url: `${site.url}/politica-de-privacidade`, changeFrequency: "yearly", priority: 0.2 },
  ];

  const rotasCategorias: MetadataRoute.Sitemap = categorias
    .filter((c) => c.active)
    .map((c) => ({
      url: `${site.url}/catalogo/${c.slug}`,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

  const rotasColecoes: MetadataRoute.Sitemap = colecoes
    .filter((c) => c.active)
    .map((c) => ({
      url: `${site.url}/colecoes/${c.slug}`,
      changeFrequency: "monthly",
      priority: 0.6,
    }));

  const rotasProdutos: MetadataRoute.Sitemap = catalogo
    .filter((p) => p.active && !p.archivedAt)
    .map((p) => ({
      url: `${site.url}/produto/${p.slug}`,
      changeFrequency: "weekly",
      priority: 0.7,
    }));

  // /favoritos fica de fora de propósito: é conteúdo do aparelho de cada
  // visitante, não há nada para indexar.
  return [...fixas, ...rotasCategorias, ...rotasColecoes, ...rotasProdutos];
}
