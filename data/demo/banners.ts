/**
 * GERADO POR scripts/monta-acervo.mjs — não editar à mão.
 *
 * Catálogo de DEMONSTRAÇÃO. Alimenta a vitrine enquanto o Supabase não está
 * configurado; quando as variáveis de ambiente existirem, o banco assume e
 * nada daqui é lido.
 *
 * Origem dos dados: fotos e legendas publicadas pela própria PR Gold em
 * @prgold_oficial. Peso, comprimento, largura, tipo de elo e pedras vêm das
 * legendas da marca. Preço não existe em nenhuma peça — a PR Gold não publica
 * valores, e a vitrine exibe "Valor sob consulta".
 */

import type { Banner } from "@/types";

export const bannersDemo: Banner[] = [
  {
    "id": "banner-1",
    "title": "",
    "subtitle": null,
    "imageDesktop": "/images/pr-gold/hero-desktop.webp",
    "imageMobile": "/images/pr-gold/hero-mobile.webp",
    "ctaLabel": null,
    "link": null,
    "align": "left",
    "overlay": 45,
    "position": 0,
    "active": true,
    "startsAt": null,
    "endsAt": null
  }
];
