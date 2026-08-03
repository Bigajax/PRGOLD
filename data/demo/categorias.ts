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

import type { Category } from "@/types";

export const categoriasDemo: Category[] = [
  {
    "id": "cat-1",
    "slug": "aliancas",
    "name": "Alianças",
    "description": "Para o momento que começa uma história.",
    "image": "/images/pr-gold/products/alianca-abaulada-1.webp",
    "position": 0,
    "active": true
  },
  {
    "id": "cat-2",
    "slug": "aneis",
    "name": "Anéis",
    "description": "Solitários, personalizados e peças com pedras.",
    "image": "/images/pr-gold/products/anel-feminino-com-pedraria-natural-1.webp",
    "position": 1,
    "active": true
  },
  {
    "id": "cat-3",
    "slug": "correntes",
    "name": "Correntes",
    "description": "Elos romanos, grumet e cadeado em ouro.",
    "image": "/images/pr-gold/products/corrente-romana-quadrada-25g-1.webp",
    "position": 2,
    "active": true
  },
  {
    "id": "cat-4",
    "slug": "colares",
    "name": "Colares",
    "description": "Correntes femininas com pingente.",
    "image": "/images/pr-gold/products/corrente-lacraia-1.webp",
    "position": 3,
    "active": true
  },
  {
    "id": "cat-5",
    "slug": "pulseiras",
    "name": "Pulseiras",
    "description": "Do elo cadeado ao bracelete rígido.",
    "image": "/images/pr-gold/products/pulseira-elo-cadeado-1.webp",
    "position": 4,
    "active": true
  },
  {
    "id": "cat-6",
    "slug": "pingentes",
    "name": "Pingentes",
    "description": "Peças personalizadas em alto relevo.",
    "image": "/images/pr-gold/products/pingente-personalizado-macico-1.webp",
    "position": 5,
    "active": true
  }
];
