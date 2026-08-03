/**
 * PR Gold — domínio.
 *
 * Um domínio, um arquivo: vitrine, painel, services e scripts importam daqui.
 * O banco fala snake_case; a aplicação fala camelCase. A conversão acontece em
 * um único lugar (`services/mappers.ts`) e nenhum componente conhece nome de
 * coluna.
 *
 * Convenção de "não inventar": todo campo de ficha técnica é `| null`. `null`
 * significa "a PR Gold ainda não informou" e a UI simplesmente NÃO renderiza a
 * linha. Nunca preencher com "—", "a combinar" ou string vazia.
 */

/* ========================================================================== */
/* Produto                                                                     */
/* ========================================================================== */

export type Gender = "feminino" | "masculino" | "unissex";

/** Tipo de ouro. Lista fechada — espelha o CHECK do banco. */
export type GoldType = "amarelo" | "branco" | "rose";

/**
 * Os três estados de disponibilidade que a vitrine conhece.
 *
 * Note que não existe "esgotado": a PR Gold tem confecção própria, e afirmar
 * que uma peça acabou é uma promessa negativa que ninguém pediu. Quando não há
 * estoque nem encomenda declarada, o site diz "Consulte disponibilidade" e
 * manda a pessoa conversar — que é exatamente o objetivo do site.
 */
export type Availability = "pronta-entrega" | "sob-encomenda" | "consultar";

export type ProductImage = {
  url: string;
  /** Texto alternativo. Sem ele, a UI cai para o nome do produto. */
  alt: string | null;
  /** 0 é a capa: aparece no card, no OG e como imagem principal da galeria. */
  position: number;
};

export type Product = {
  id: string;
  slug: string;
  /** Código interno exibido na página e enviado na mensagem de WhatsApp. */
  code: string;
  name: string;

  shortDescription: string | null;
  fullDescription: string | null;

  categorySlug: string | null;
  categoryName: string | null;
  collectionSlug: string | null;
  collectionName: string | null;
  gender: Gender | null;

  /* ── Ficha técnica ──────────────────────────────────────────────────────
     Nenhum destes campos é inventado em lugar nenhum do projeto. O que a
     PR Gold não informou fica `null` e some da tela.                       */
  material: string | null;
  goldType: GoldType | null;
  /** Quilates, ex.: 18. */
  karat: number | null;
  /** Peso em gramas. */
  weightG: number | null;
  /** Texto livre: "60 cm", "Aro 20", "4 mm". */
  dimensions: string | null;
  /** Texto livre: "Zircônias", "Diamante natural". */
  stones: string | null;

  /* ── Preço ──────────────────────────────────────────────────────────────
     `price` null ou `priceOnRequest` true resultam em "Valor sob consulta".
     `promoPrice` só é exibido quando é MENOR que `price`.                   */
  price: number | null;
  promoPrice: number | null;
  priceOnRequest: boolean;

  /* ── Disponibilidade (entradas da derivação, nunca o resultado) ───────── */
  /** null = a loja não controla estoque desta peça. */
  stockQuantity: number | null;
  lowStockThreshold: number | null;
  readyToShip: boolean;
  madeToOrder: boolean;

  images: ProductImage[];

  featured: boolean;
  newArrival: boolean;
  exclusive: boolean;
  active: boolean;
  position: number;
  archivedAt: string | null;

  seoTitle: string | null;
  seoDescription: string | null;

  /** Marca conteúdo de demonstração. Some quando o banco real assume. */
  demo?: boolean;
};

/* ========================================================================== */
/* Disponibilidade derivada — a função mais importante do projeto              */
/* ========================================================================== */

/**
 * Disponibilidade NUNCA é digitada: é consequência do estoque e das duas
 * chaves que o lojista controla ("é pronta entrega" e "aceita encomenda").
 *
 * Não existe campo `status` em nenhuma tabela nem em nenhum formulário. Esta
 * função é a fonte única que alimenta: o selo do card, o badge da página de
 * produto, o filtro do catálogo, o JSON-LD e o texto da mensagem de WhatsApp.
 *
 * Viés de segurança: na dúvida, promete menos. Estoque zerado cai para
 * encomenda (se a loja aceitar) ou para "consulte" — jamais permanece
 * "disponível".
 */
export function deriveAvailability(p: {
  stockQuantity: number | null;
  readyToShip: boolean;
  madeToOrder: boolean;
}): Availability {
  if (p.stockQuantity !== null && p.stockQuantity > 0) return "pronta-entrega";
  // Peça que a loja declara ter em mãos mas cujo estoque ela não controla.
  if (p.stockQuantity === null && p.readyToShip) return "pronta-entrega";
  if (p.madeToOrder) return "sob-encomenda";
  return "consultar";
}

/** Rótulo público. É o vocabulário que o visitante lê — não mexer sem alinhar. */
export const AVAILABILITY_LABEL: Record<Availability, string> = {
  "pronta-entrega": "Pronta entrega",
  "sob-encomenda": "Sob encomenda",
  consultar: "Consulte disponibilidade",
};

/**
 * Estoque baixo, para a urgência honesta ("últimas unidades").
 * Só existe quando há contagem real — nunca é texto de marketing.
 */
export function isLowStock(p: Product, globalThreshold: number): boolean {
  if (p.stockQuantity === null || p.stockQuantity <= 0) return false;
  const limiar = p.lowStockThreshold ?? globalThreshold;
  return limiar > 0 && p.stockQuantity <= limiar;
}

/** Preço efetivo: promocional quando realmente menor, senão o cheio. */
export function effectivePrice(p: Product): number | null {
  if (p.priceOnRequest) return null;
  if (p.promoPrice !== null && p.price !== null && p.promoPrice < p.price) {
    return p.promoPrice;
  }
  return p.price;
}

/** Só há oferta quando existe um "de" maior que o "por". Nunca inventar desconto. */
export function hasDiscount(p: Product): boolean {
  return (
    !p.priceOnRequest &&
    p.price !== null &&
    p.promoPrice !== null &&
    p.promoPrice < p.price
  );
}

export function coverImage(p: Product): ProductImage | null {
  if (p.images.length === 0) return null;
  return [...p.images].sort((a, b) => a.position - b.position)[0];
}

/* ========================================================================== */
/* Taxonomia e conteúdo editorial                                             */
/* ========================================================================== */

export type Category = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  image: string | null;
  position: number;
  active: boolean;
};

export type Collection = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  image: string | null;
  bannerDesktop: string | null;
  bannerMobile: string | null;
  position: number;
  active: boolean;
};

export type BannerAlign = "left" | "center" | "right";

export type Banner = {
  id: string;
  title: string;
  subtitle: string | null;
  imageDesktop: string;
  /** Recorte próprio para o mobile. Sem ele, a arte desktop é reenquadrada. */
  imageMobile: string | null;
  ctaLabel: string | null;
  link: string | null;
  align: BannerAlign;
  /** 0 a 100: intensidade do véu escuro sobre a foto, para o texto ter leitura. */
  overlay: number;
  position: number;
  active: boolean;
  startsAt: string | null;
  endsAt: string | null;
};

export type Benefit = {
  id: string;
  icon: string;
  title: string;
  description: string | null;
  position: number;
  active: boolean;
};

export type InstagramPost = {
  id: string;
  image: string;
  postUrl: string | null;
  alt: string | null;
  position: number;
  active: boolean;
};

/** Ocasião → recorte do catálogo. Alimenta a seção "Para momentos que permanecem". */
export type Moment = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  image: string | null;
  /** Query string aplicada ao catálogo, ex.: "categoria=aliancas". */
  filterQuery: string;
  position: number;
  active: boolean;
};

/* ========================================================================== */
/* Monte sua peça                                                             */
/* ========================================================================== */

export const CUSTOM_REQUEST_STATUSES = [
  "nova",
  "em-atendimento",
  "orcamento-enviado",
  "aguardando-aprovacao",
  "em-producao",
  "finalizada",
  "cancelada",
] as const;

export type CustomRequestStatus = (typeof CUSTOM_REQUEST_STATUSES)[number];

export const CUSTOM_REQUEST_STATUS_LABEL: Record<CustomRequestStatus, string> = {
  nova: "Nova",
  "em-atendimento": "Em atendimento",
  "orcamento-enviado": "Orçamento enviado",
  "aguardando-aprovacao": "Aguardando aprovação",
  "em-producao": "Em produção",
  finalizada: "Finalizada",
  cancelada: "Cancelada",
};

export type CustomRequest = {
  id: string;
  /** Etapa 1 */
  pieceType: string;
  /** Etapa 2 */
  style: string | null;
  /** Etapa 3 */
  goldType: GoldType | null;
  stones: string | null;
  engraving: string | null;
  finish: string | null;
  size: string | null;
  notes: string | null;
  /** Etapa 4 */
  referenceImage: string | null;
  /** Etapa 5 */
  name: string;
  whatsapp: string;
  city: string | null;
  email: string | null;
  message: string | null;

  status: CustomRequestStatus;
  origin: string | null;
  createdAt: string;
};

/* ========================================================================== */
/* Configurações editáveis pelo painel                                        */
/* ========================================================================== */

/**
 * O que o lojista pode mudar sozinho. Nome da marca, URL canônica e identidade
 * visual ficam de fora de propósito: mudam a cada semestre, não a cada semana.
 */
export type SiteSettings = {
  whatsapp: string;
  whatsappDefaultMessage: string;
  instagramHandle: string;
  instagramUrl: string;
  email: string;
  address: string;
  city: string;
  businessHours: string;
  topBarText: string;
  topBarCtaLabel: string;
  aboutTitle: string;
  aboutText: string;
  footerTagline: string;
  legalName: string;
  legalDocument: string;
  seoTitle: string;
  seoDescription: string;
};

/* ========================================================================== */
/* Utilidades de UI                                                           */
/* ========================================================================== */

/** Fundo em que um componente está. Nunca adivinhar — sempre receber. */
export type Tone = "dark" | "light";

export type ActionResult =
  | { ok: true; warnings?: string[] }
  | { ok: false; error: string };
