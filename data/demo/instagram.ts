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

import type { InstagramPost } from "@/types";

export const instagramDemo: InstagramPost[] = [
  {
    "id": "ig-1",
    "image": "/images/pr-gold/instagram/ig-1.webp",
    "postUrl": "https://www.instagram.com/prgold_oficial/p/DZP8ZIyEWYy/",
    "alt": "Publicação da PR Gold no Instagram",
    "position": 0,
    "active": true
  },
  {
    "id": "ig-2",
    "image": "/images/pr-gold/instagram/ig-2.webp",
    "postUrl": "https://www.instagram.com/prgold_oficial/p/DYpusxjkSgY/",
    "alt": "Publicação da PR Gold no Instagram",
    "position": 1,
    "active": true
  },
  {
    "id": "ig-3",
    "image": "/images/pr-gold/instagram/ig-3.webp",
    "postUrl": "https://www.instagram.com/prgold_oficial/p/DZu4zE1kSBQ/",
    "alt": "Publicação da PR Gold no Instagram",
    "position": 2,
    "active": true
  },
  {
    "id": "ig-4",
    "image": "/images/pr-gold/instagram/ig-4.webp",
    "postUrl": "https://www.instagram.com/prgold_oficial/p/DYxCy_bEeQN/",
    "alt": "Publicação da PR Gold no Instagram",
    "position": 3,
    "active": true
  },
  {
    "id": "ig-5",
    "image": "/images/pr-gold/instagram/ig-5.webp",
    "postUrl": "https://www.instagram.com/prgold_oficial/p/DaddoSPkfi2/",
    "alt": "Publicação da PR Gold no Instagram",
    "position": 4,
    "active": true
  },
  {
    "id": "ig-6",
    "image": "/images/pr-gold/instagram/ig-6.webp",
    "postUrl": "https://www.instagram.com/prgold_oficial/p/DY9yuEFEdak/",
    "alt": "Publicação da PR Gold no Instagram",
    "position": 5,
    "active": true
  },
  {
    "id": "ig-7",
    "image": "/images/pr-gold/instagram/ig-7.webp",
    "postUrl": "https://www.instagram.com/prgold_oficial/p/DaLCBskEQRu/",
    "alt": "Publicação da PR Gold no Instagram",
    "position": 6,
    "active": true
  },
  {
    "id": "ig-8",
    "image": "/images/pr-gold/instagram/ig-8.webp",
    "postUrl": "https://www.instagram.com/prgold_oficial/p/DZNJN4rESE2/",
    "alt": "Publicação da PR Gold no Instagram",
    "position": 7,
    "active": true
  }
];
