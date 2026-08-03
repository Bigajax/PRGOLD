import "server-only";

import type {
  Banner,
  Benefit,
  Category,
  Collection,
  CustomRequest,
  Gender,
  GoldType,
  InstagramPost,
  Moment,
  Product,
  ProductImage,
} from "@/types";
import { num, texto } from "./supabase";

/**
 * Fronteira snake_case -> camelCase.
 *
 * É o ÚNICO lugar do projeto que conhece nome de coluna. Nenhum componente,
 * nenhuma página e nenhuma action leem `short_description` direto.
 */

type Row = Record<string, unknown>;

export function mapProduct(row: Row): Product {
  const imagens = Array.isArray(row.product_images)
    ? (row.product_images as Row[])
        .map(
          (img): ProductImage => ({
            url: String(img.url),
            alt: texto(img.alt),
            position: Number(img.position ?? 0),
          })
        )
        .sort((a, b) => a.position - b.position)
    : [];

  const categoria = row.categories as Row | null | undefined;
  const colecao = row.collections as Row | null | undefined;

  return {
    id: String(row.id),
    slug: String(row.slug),
    code: String(row.code),
    name: String(row.name),

    shortDescription: texto(row.short_description),
    fullDescription: texto(row.full_description),

    categorySlug: categoria ? String(categoria.slug) : null,
    categoryName: categoria ? String(categoria.name) : null,
    collectionSlug: colecao ? String(colecao.slug) : null,
    collectionName: colecao ? String(colecao.name) : null,
    gender: (texto(row.gender) as Gender | null) ?? null,

    material: texto(row.material),
    goldType: (texto(row.gold_type) as GoldType | null) ?? null,
    karat: num(row.karat),
    weightG: num(row.weight_g),
    dimensions: texto(row.dimensions),
    stones: texto(row.stones),

    price: num(row.price),
    promoPrice: num(row.promo_price),
    priceOnRequest: Boolean(row.price_on_request),

    stockQuantity: num(row.stock_quantity),
    lowStockThreshold: num(row.low_stock_threshold),
    readyToShip: Boolean(row.ready_to_ship),
    madeToOrder: Boolean(row.made_to_order),

    images: imagens,

    featured: Boolean(row.featured),
    newArrival: Boolean(row.new_arrival),
    exclusive: Boolean(row.exclusive),
    active: Boolean(row.active),
    position: Number(row.position ?? 0),
    archivedAt: texto(row.archived_at),

    seoTitle: texto(row.seo_title),
    seoDescription: texto(row.seo_description),
  };
}

export function mapCategory(row: Row): Category {
  return {
    id: String(row.id),
    slug: String(row.slug),
    name: String(row.name),
    description: texto(row.description),
    image: texto(row.image),
    position: Number(row.position ?? 0),
    active: Boolean(row.active),
  };
}

export function mapCollection(row: Row): Collection {
  return {
    id: String(row.id),
    slug: String(row.slug),
    name: String(row.name),
    description: texto(row.description),
    image: texto(row.image),
    bannerDesktop: texto(row.banner_desktop),
    bannerMobile: texto(row.banner_mobile),
    position: Number(row.position ?? 0),
    active: Boolean(row.active),
  };
}

export function mapBanner(row: Row): Banner {
  return {
    id: String(row.id),
    title: String(row.title ?? ""),
    subtitle: texto(row.subtitle),
    imageDesktop: String(row.image_desktop),
    imageMobile: texto(row.image_mobile),
    ctaLabel: texto(row.cta_label),
    link: texto(row.link),
    align: (texto(row.align) as Banner["align"]) ?? "left",
    overlay: Number(row.overlay ?? 40),
    position: Number(row.position ?? 0),
    active: Boolean(row.active),
    startsAt: texto(row.starts_at),
    endsAt: texto(row.ends_at),
  };
}

export function mapBenefit(row: Row): Benefit {
  return {
    id: String(row.id),
    icon: String(row.icon ?? "Sparkles"),
    title: String(row.title),
    description: texto(row.description),
    position: Number(row.position ?? 0),
    active: Boolean(row.active),
  };
}

export function mapInstagram(row: Row): InstagramPost {
  return {
    id: String(row.id),
    image: String(row.image),
    postUrl: texto(row.post_url),
    alt: texto(row.alt),
    position: Number(row.position ?? 0),
    active: Boolean(row.active),
  };
}

export function mapMoment(row: Row): Moment {
  return {
    id: String(row.id),
    slug: String(row.slug),
    name: String(row.name),
    description: texto(row.description),
    image: texto(row.image),
    filterQuery: String(row.filter_query ?? ""),
    position: Number(row.position ?? 0),
    active: Boolean(row.active),
  };
}

export function mapCustomRequest(row: Row): CustomRequest {
  return {
    id: String(row.id),
    pieceType: String(row.piece_type),
    style: texto(row.style),
    goldType: (texto(row.gold_type) as GoldType | null) ?? null,
    stones: texto(row.stones),
    engraving: texto(row.engraving),
    finish: texto(row.finish),
    size: texto(row.size),
    notes: texto(row.notes),
    referenceImage: texto(row.reference_image),
    name: String(row.name),
    whatsapp: String(row.whatsapp),
    city: texto(row.city),
    email: texto(row.email),
    message: texto(row.message),
    status: (texto(row.status) as CustomRequest["status"]) ?? "nova",
    origin: texto(row.origin),
    createdAt: String(row.created_at),
  };
}

/** Colunas do produto com os relacionamentos que a vitrine precisa. */
export const PRODUCT_SELECT =
  "*, product_images(url, alt, position), categories(slug, name), collections(slug, name)";
