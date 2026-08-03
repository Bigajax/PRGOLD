import { TEXTO_SEM_PRECO } from "@/config/catalogo";
import type { Product } from "@/types";
import { effectivePrice } from "@/types";

const BRL = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function brl(valor: number): string {
  return BRL.format(valor);
}

/**
 * Preço para exibição. Devolve a frase de consulta quando não há valor — que é
 * o caso de todo o catálogo até a PR Gold informar os preços.
 */
export function precoTexto(p: Product): string {
  const valor = effectivePrice(p);
  return valor === null ? TEXTO_SEM_PRECO : brl(valor);
}

/** Percentual de desconto, arredondado para baixo. Só quando há oferta real. */
export function descontoPercentual(p: Product): number | null {
  if (p.price === null || p.promoPrice === null || p.promoPrice >= p.price) return null;
  return Math.floor(((p.price - p.promoPrice) / p.price) * 100);
}

/** "12 g" — sem casa decimal quando é inteiro, com uma quando não é. */
export function pesoTexto(gramas: number): string {
  const n = Number(gramas);
  return `${Number.isInteger(n) ? n : n.toFixed(1).replace(".", ",")} g`;
}

/**
 * Ficha técnica: pares rótulo/valor, na ordem em que a joalheria lê a peça.
 *
 * Campo sem dado NÃO ENTRA na lista — é aqui que a regra de "não inventar"
 * vira comportamento. A ficha encolhe sozinha e nunca mostra "—".
 */
export function fichaTecnica(p: Product): { label: string; value: string }[] {
  const linhas: { label: string; value: string }[] = [];

  if (p.material) linhas.push({ label: "Material", value: p.material });
  if (p.karat) linhas.push({ label: "Quilates", value: `${p.karat}K` });
  if (p.goldType) {
    linhas.push({
      label: "Tipo de ouro",
      value: { amarelo: "Ouro amarelo", branco: "Ouro branco", rose: "Ouro rosé" }[
        p.goldType
      ],
    });
  }
  if (p.weightG) linhas.push({ label: "Peso", value: pesoTexto(p.weightG) });
  if (p.dimensions) linhas.push({ label: "Dimensões", value: p.dimensions });
  if (p.stones) linhas.push({ label: "Pedras", value: p.stones });

  return linhas;
}

/**
 * Versão compacta da ficha, para o card do catálogo: no máximo dois dados, e
 * só os que diferenciam a peça de relance.
 */
export function fichaCompacta(p: Product): string | null {
  const partes: string[] = [];
  if (p.material) partes.push(p.material);
  if (p.weightG) partes.push(pesoTexto(p.weightG));
  else if (p.dimensions) partes.push(p.dimensions.split(",")[0].trim());
  return partes.length ? partes.join(" · ") : null;
}

/** Só dígitos — usado para normalizar telefone antes de gravar ou montar link. */
export function apenasDigitos(valor: string): string {
  return valor.replace(/\D/g, "");
}

/**
 * Normaliza telefone brasileiro para DDI + DDD + número.
 * Aceita "(44) 99878-8108" e devolve "5544998788108".
 */
export function normalizaWhatsApp(valor: string): string {
  const d = apenasDigitos(valor);
  if (d.length === 10 || d.length === 11) return `55${d}`;
  return d;
}

export function formataData(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formataDataHora(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
