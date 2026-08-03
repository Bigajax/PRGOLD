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

import type { Collection } from "@/types";

export const colecoesDemo: Collection[] = [
  {
    "id": "col-1",
    "slug": "aliancas",
    "name": "Alianças",
    "description": "As peças que marcam um compromisso.",
    "image": "/images/pr-gold/products/alianca-abaulada-1.webp",
    "bannerDesktop": null,
    "bannerMobile": null,
    "position": 0,
    "active": true
  },
  {
    "id": "col-2",
    "slug": "fe",
    "name": "Fé",
    "description": "Crucifixos, escapulários e peças devocionais.",
    "image": "/images/pr-gold/products/corrente-romana-quadrada-com-crucifixo-1.webp",
    "bannerDesktop": null,
    "bannerMobile": null,
    "position": 1,
    "active": true
  },
  {
    "id": "col-3",
    "slug": "personalizados",
    "name": "Personalizados",
    "description": "Criadas a partir de uma ideia.",
    "image": "/images/pr-gold/products/colar-com-pingente-personalizado-1.webp",
    "bannerDesktop": null,
    "bannerMobile": null,
    "position": 2,
    "active": true
  },
  {
    "id": "col-4",
    "slug": "presentes",
    "name": "Presentes",
    "description": "Conjuntos pensados para presentear.",
    "image": "/images/pr-gold/products/kit-pulseira-e-corrente-1.webp",
    "bannerDesktop": null,
    "bannerMobile": null,
    "position": 3,
    "active": true
  }
];
