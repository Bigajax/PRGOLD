import "server-only";

import { unstable_cache } from "next/cache";
import type { Banner, Benefit, InstagramPost, Moment, SiteSettings } from "@/types";
import { site } from "@/config/site";
import { beneficiosPadrao, textos } from "@/config/textos";
import { bannersDemo } from "@/data/demo/banners";
import { instagramDemo } from "@/data/demo/instagram";
import { momentosDemo } from "@/data/demo/momentos";
import { mapBanner, mapBenefit, mapInstagram, mapMoment } from "./mappers";
import { anonClient, DEMO_MODE, TAG_CONFIG, TAG_CONTEUDO } from "./supabase";

const OPCOES_CONTEUDO = { tags: [TAG_CONTEUDO], revalidate: 300 };

/* ── Banners ────────────────────────────────────────────────────────────── */

async function buscaBanners(): Promise<Banner[]> {
  if (DEMO_MODE) return bannersDemo;
  const db = anonClient();
  if (!db) return bannersDemo;

  const { data, error } = await db
    .from("banners")
    .select("*")
    .order("position", { ascending: true });

  if (error) throw new Error(error.message);
  const lista = (data ?? []).map(mapBanner);
  // Sem banner cadastrado, o hero padrão assume. A home nunca fica com um
  // buraco no lugar da primeira dobra.
  return lista.length ? lista : bannersDemo;
}

export const getBanners = unstable_cache(buscaBanners, ["banners"], OPCOES_CONTEUDO);

/* ── Benefícios ─────────────────────────────────────────────────────────── */

async function buscaBeneficios(): Promise<Benefit[]> {
  const padrao: Benefit[] = beneficiosPadrao.map((b, i) => ({
    id: `padrao-${i + 1}`,
    icon: b.icon,
    title: b.title,
    description: b.description,
    position: i,
    active: true,
  }));

  if (DEMO_MODE) return padrao;
  const db = anonClient();
  if (!db) return padrao;

  const { data, error } = await db
    .from("benefits")
    .select("*")
    .order("position", { ascending: true });

  if (error) throw new Error(error.message);
  const lista = (data ?? []).map(mapBenefit);
  return lista.length ? lista : padrao;
}

export const getBeneficios = unstable_cache(buscaBeneficios, ["beneficios"], OPCOES_CONTEUDO);

/* ── Instagram ──────────────────────────────────────────────────────────── */

async function buscaInstagram(): Promise<InstagramPost[]> {
  if (DEMO_MODE) return instagramDemo;
  const db = anonClient();
  if (!db) return instagramDemo;

  const { data, error } = await db
    .from("instagram_gallery")
    .select("*")
    .order("position", { ascending: true });

  if (error) throw new Error(error.message);
  const lista = (data ?? []).map(mapInstagram);
  return lista.length ? lista : instagramDemo;
}

export const getInstagram = unstable_cache(buscaInstagram, ["instagram"], OPCOES_CONTEUDO);

/* ── Momentos ───────────────────────────────────────────────────────────── */

async function buscaMomentos(): Promise<Moment[]> {
  if (DEMO_MODE) return momentosDemo;
  const db = anonClient();
  if (!db) return momentosDemo;

  const { data, error } = await db
    .from("moments")
    .select("*")
    .order("position", { ascending: true });

  if (error) throw new Error(error.message);
  const lista = (data ?? []).map(mapMoment);
  return lista.length ? lista : momentosDemo;
}

export const getMomentos = unstable_cache(buscaMomentos, ["momentos"], OPCOES_CONTEUDO);

/* ── Configurações da loja ──────────────────────────────────────────────── */

/**
 * Valores padrão vindos do código versionado. A tabela `site_settings` apenas
 * SOBREPÕE o que estiver preenchido — chave vazia no banco não apaga o
 * fallback. É o que garante que o site nunca fique sem WhatsApp.
 */
function settingsPadrao(): SiteSettings {
  return {
    whatsapp: site.whatsapp,
    whatsappDefaultMessage: site.whatsappDefaultMessage,
    instagramHandle: site.instagramHandle,
    instagramUrl: site.instagramUrl,
    email: site.email,
    address: site.address,
    city: site.city,
    businessHours: site.businessHours,
    topBarText: textos.barraTopo.texto,
    topBarCtaLabel: textos.barraTopo.ctaLabel,
    aboutTitle: textos.sobre.titulo,
    aboutText: textos.sobre.texto,
    footerTagline: textos.rodape.frase,
    legalName: site.legalName,
    legalDocument: site.legalDocument,
    seoTitle: `${site.name} | Joias em ouro`,
    seoDescription: site.description,
  };
}

const CHAVES: Record<string, keyof SiteSettings> = {
  whatsapp: "whatsapp",
  whatsapp_default_message: "whatsappDefaultMessage",
  instagram_handle: "instagramHandle",
  instagram_url: "instagramUrl",
  email: "email",
  address: "address",
  city: "city",
  business_hours: "businessHours",
  top_bar_text: "topBarText",
  top_bar_cta_label: "topBarCtaLabel",
  about_title: "aboutTitle",
  about_text: "aboutText",
  footer_tagline: "footerTagline",
  legal_name: "legalName",
  legal_document: "legalDocument",
  seo_title: "seoTitle",
  seo_description: "seoDescription",
};

async function buscaSettings(): Promise<SiteSettings> {
  const padrao = settingsPadrao();
  if (DEMO_MODE) return padrao;

  const db = anonClient();
  if (!db) return padrao;

  const { data, error } = await db.from("site_settings").select("key, value");
  if (error) throw new Error(error.message);

  const resultado = { ...padrao };
  for (const linha of data ?? []) {
    const campo = CHAVES[linha.key as string];
    const valor = typeof linha.value === "string" ? linha.value.trim() : "";
    if (campo && valor) resultado[campo] = valor;
  }
  return resultado;
}

export const getSettings = unstable_cache(buscaSettings, ["settings"], {
  tags: [TAG_CONFIG],
  revalidate: 300,
});

export async function getSettingsSeguro(): Promise<SiteSettings> {
  try {
    return await getSettings();
  } catch {
    return settingsPadrao();
  }
}
