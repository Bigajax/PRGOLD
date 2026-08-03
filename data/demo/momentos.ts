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

import type { Moment } from "@/types";

export const momentosDemo: Moment[] = [
  {
    "id": "mom-1",
    "slug": "pedido-de-casamento",
    "name": "Pedido de casamento",
    "filterQuery": "categoria=aneis",
    "description": null,
    "image": null,
    "position": 0,
    "active": true
  },
  {
    "id": "mom-2",
    "slug": "casamento",
    "name": "Casamento",
    "filterQuery": "colecao=aliancas",
    "description": null,
    "image": null,
    "position": 1,
    "active": true
  },
  {
    "id": "mom-3",
    "slug": "aniversario",
    "name": "Aniversário",
    "filterQuery": "categoria=colares",
    "description": null,
    "image": null,
    "position": 2,
    "active": true
  },
  {
    "id": "mom-4",
    "slug": "formatura",
    "name": "Formatura",
    "filterQuery": "categoria=aneis",
    "description": null,
    "image": null,
    "position": 3,
    "active": true
  },
  {
    "id": "mom-5",
    "slug": "presente",
    "name": "Presente",
    "filterQuery": "colecao=presentes",
    "description": null,
    "image": null,
    "position": 4,
    "active": true
  },
  {
    "id": "mom-6",
    "slug": "conquista-pessoal",
    "name": "Conquista pessoal",
    "filterQuery": "categoria=correntes",
    "description": null,
    "image": null,
    "position": 5,
    "active": true
  },
  {
    "id": "mom-7",
    "slug": "joia-personalizada",
    "name": "Joia personalizada",
    "filterQuery": "colecao=personalizados",
    "description": null,
    "image": null,
    "position": 6,
    "active": true
  }
];
