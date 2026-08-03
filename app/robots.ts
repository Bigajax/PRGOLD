import type { MetadataRoute } from "next";
import { site } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // O painel não é segredo, mas também não é conteúdo: fora do índice.
      // A proteção de verdade são as quatro camadas do /admin, não este arquivo.
      disallow: ["/admin", "/admin/", "/favoritos"],
    },
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
