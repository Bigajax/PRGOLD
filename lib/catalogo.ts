import { SINONIMOS, type Ordenacao } from "@/config/catalogo";
import { deriveAvailability, effectivePrice, type Availability, type Product } from "@/types";

/**
 * Motor de catálogo em memória: filtros, facetas, ordenação e busca.
 *
 * Roda no cliente sobre o catálogo já carregado pelo layout. Não existe
 * requisição por interação e não existe servidor de busca — o catálogo de uma
 * vitrine cabe na memória, e é isso que torna a experiência instantânea.
 */

/* ── Normalização ───────────────────────────────────────────────────────── */

const cacheNormalizado = new WeakMap<Product, string>();

export function normaliza(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    // Faixa dos sinais diacríticos combinantes, escrita por código para não
    // depender da codificação deste arquivo.
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * "Palheiro" de busca de uma peça: tudo que a pessoa poderia digitar para
 * chegar nela, incluindo os sinônimos do vocabulário da joalheria brasileira
 * (quem procura "cordão" quer corrente; quem digita "grumê" quer grumet).
 */
function palheiro(p: Product): string {
  const existente = cacheNormalizado.get(p);
  if (existente) return existente;

  const base = [
    p.name,
    p.code,
    p.categoryName,
    p.collectionName,
    p.shortDescription,
    p.fullDescription,
    p.material,
    p.dimensions,
    p.stones,
    p.gender,
    p.goldType,
  ]
    .filter(Boolean)
    .join(" ");

  const normal = normaliza(base);

  // Acrescenta os sinônimos cujo termo canônico aparece na peça.
  const extras: string[] = [];
  for (const [canonico, variantes] of Object.entries(SINONIMOS)) {
    if (normal.includes(canonico) || variantes.some((v) => normal.includes(v))) {
      extras.push(...variantes);
    }
  }

  const completo = `${normal} ${extras.join(" ")}`;
  cacheNormalizado.set(p, completo);
  return completo;
}

/* ── Busca com ranking ──────────────────────────────────────────────────── */

export const MIN_BUSCA = 2;

export function buscar(catalogo: Product[], termo: string, limite = 30): Product[] {
  const q = normaliza(termo);
  if (q.length < MIN_BUSCA) return [];

  const termos = q.split(" ").filter(Boolean);

  const pontuados = catalogo
    .map((p) => {
      const feno = palheiro(p);
      // AND: todos os termos precisam aparecer.
      if (!termos.every((t) => feno.includes(t))) return null;

      const nome = normaliza(p.name);
      let pontos = 0;
      if (nome === q) pontos += 8;
      else if (nome.startsWith(q)) pontos += 6;
      else if (nome.includes(q)) pontos += 4;

      if (normaliza(p.categoryName ?? "").includes(q)) pontos += 2;
      if (normaliza(p.code).includes(q)) pontos += 3;
      if (p.featured) pontos += 0.5;
      if (p.newArrival) pontos += 0.25;
      if (deriveAvailability(p) === "pronta-entrega") pontos += 1.5;

      return { p, pontos };
    })
    .filter((x): x is { p: Product; pontos: number } => x !== null);

  pontuados.sort(
    (a, b) => b.pontos - a.pontos || a.p.name.localeCompare(b.p.name, "pt-BR")
  );

  return pontuados.slice(0, limite).map((x) => x.p);
}

/* ── Filtros ────────────────────────────────────────────────────────────── */

export type Filtros = {
  categoria?: string;
  colecao?: string;
  genero?: string;
  ouro?: string;
  disponibilidade?: string;
  precoMin?: number;
  precoMax?: number;
  novidade?: boolean;
  exclusivo?: boolean;
  busca?: string;
};

export const FILTROS_VAZIOS: Filtros = {};

export function filtrosDaUrl(params: URLSearchParams | Record<string, string | undefined>): Filtros {
  const get = (k: string) =>
    params instanceof URLSearchParams ? (params.get(k) ?? undefined) : params[k];

  const numero = (v: string | undefined) => {
    if (!v) return undefined;
    const n = Number(v);
    return Number.isFinite(n) && n > 0 ? n : undefined;
  };

  return {
    categoria: get("categoria") || undefined,
    colecao: get("colecao") || undefined,
    genero: get("genero") || undefined,
    ouro: get("ouro") || undefined,
    disponibilidade: get("disp") || undefined,
    precoMin: numero(get("min")),
    precoMax: numero(get("max")),
    novidade: get("novidade") === "1" || undefined,
    exclusivo: get("exclusivo") === "1" || undefined,
    busca: get("q") || undefined,
  };
}

export function urlDosFiltros(f: Filtros, ordem?: Ordenacao, pagina?: number): string {
  const p = new URLSearchParams();
  if (f.categoria) p.set("categoria", f.categoria);
  if (f.colecao) p.set("colecao", f.colecao);
  if (f.genero) p.set("genero", f.genero);
  if (f.ouro) p.set("ouro", f.ouro);
  if (f.disponibilidade) p.set("disp", f.disponibilidade);
  if (f.precoMin) p.set("min", String(f.precoMin));
  if (f.precoMax) p.set("max", String(f.precoMax));
  if (f.novidade) p.set("novidade", "1");
  if (f.exclusivo) p.set("exclusivo", "1");
  if (f.busca) p.set("q", f.busca);
  if (ordem && ordem !== "destaques") p.set("ordem", ordem);
  if (pagina && pagina > 1) p.set("pagina", String(pagina));
  const s = p.toString();
  return s ? `?${s}` : "";
}

export function temFiltroAtivo(f: Filtros): boolean {
  return Object.values(f).some((v) => v !== undefined && v !== "" && v !== false);
}

export function contaFiltrosAtivos(f: Filtros): number {
  return Object.entries(f).filter(
    ([chave, v]) => chave !== "busca" && v !== undefined && v !== "" && v !== false
  ).length;
}

function passaFiltro(p: Product, f: Filtros): boolean {
  if (f.categoria && p.categorySlug !== f.categoria) return false;
  if (f.colecao && p.collectionSlug !== f.colecao) return false;
  if (f.genero && p.gender !== f.genero) return false;
  if (f.ouro && p.goldType !== f.ouro) return false;
  if (f.novidade && !p.newArrival) return false;
  if (f.exclusivo && !p.exclusive) return false;

  if (f.disponibilidade) {
    if (deriveAvailability(p) !== (f.disponibilidade as Availability)) return false;
  }

  if (f.precoMin !== undefined || f.precoMax !== undefined) {
    const valor = effectivePrice(p);
    // Peça sem preço não entra em faixa de preço — não dá para afirmar que
    // "sob consulta" custa entre X e Y.
    if (valor === null) return false;
    if (f.precoMin !== undefined && valor < f.precoMin) return false;
    if (f.precoMax !== undefined && valor > f.precoMax) return false;
  }

  return true;
}

export function aplicaFiltros(catalogo: Product[], f: Filtros): Product[] {
  const base = f.busca ? buscar(catalogo, f.busca, catalogo.length) : catalogo;
  return base.filter((p) => passaFiltro(p, f));
}

/* ── Ordenação ──────────────────────────────────────────────────────────── */

export function ordena(lista: Product[], ordem: Ordenacao): Product[] {
  const copia = [...lista];
  const nome = (a: Product, b: Product) => a.name.localeCompare(b.name, "pt-BR");
  // Peça sem preço vai para o fim das ordenações por valor, nos dois sentidos:
  // ela não é "a mais barata" nem "a mais cara", é desconhecida.
  const preco = (p: Product) => effectivePrice(p);

  switch (ordem) {
    case "recentes":
      return copia.sort((a, b) => a.position - b.position || nome(a, b));
    case "menor-preco":
      return copia.sort((a, b) => {
        const x = preco(a);
        const y = preco(b);
        if (x === null && y === null) return nome(a, b);
        if (x === null) return 1;
        if (y === null) return -1;
        return x - y || nome(a, b);
      });
    case "maior-preco":
      return copia.sort((a, b) => {
        const x = preco(a);
        const y = preco(b);
        if (x === null && y === null) return nome(a, b);
        if (x === null) return 1;
        if (y === null) return -1;
        return y - x || nome(a, b);
      });
    case "nome":
      return copia.sort(nome);
    default:
      return copia.sort(
        (a, b) =>
          Number(b.featured) - Number(a.featured) ||
          Number(b.newArrival) - Number(a.newArrival) ||
          a.position - b.position ||
          nome(a, b)
      );
  }
}

/* ── Facetas ────────────────────────────────────────────────────────────── */

export type Faceta = { valor: string; quantidade: number };

/**
 * Facetas calculadas ANTES dos filtros locais.
 *
 * É o que impede as opções de sumirem conforme a pessoa filtra — o efeito mais
 * frustrante de uma vitrine é escolher "feminino" e ver todas as categorias
 * desaparecerem da lista.
 */
export function facetas(catalogo: Product[]) {
  const conta = (chave: (p: Product) => string | null | undefined): Faceta[] => {
    const mapa = new Map<string, number>();
    for (const p of catalogo) {
      const v = chave(p);
      if (v) mapa.set(v, (mapa.get(v) ?? 0) + 1);
    }
    return [...mapa.entries()]
      .map(([valor, quantidade]) => ({ valor, quantidade }))
      .sort((a, b) => b.quantidade - a.quantidade);
  };

  return {
    categorias: conta((p) => p.categorySlug),
    colecoes: conta((p) => p.collectionSlug),
    generos: conta((p) => p.gender),
    ouros: conta((p) => p.goldType),
    disponibilidades: conta((p) => deriveAvailability(p)),
  };
}

/* ── Relacionados ───────────────────────────────────────────────────────── */

/**
 * "Você também pode gostar": mesma categoria primeiro, depois mesma coleção,
 * depois mesmo gênero. Nunca devolve a própria peça e nunca inventa relação.
 */
export function relacionados(catalogo: Product[], p: Product, limite = 4): Product[] {
  const pontos = (o: Product) => {
    let n = 0;
    if (o.categorySlug && o.categorySlug === p.categorySlug) n += 4;
    if (o.collectionSlug && o.collectionSlug === p.collectionSlug) n += 2;
    if (o.gender && o.gender === p.gender) n += 1;
    if (o.featured) n += 0.5;
    return n;
  };

  return catalogo
    .filter((o) => o.slug !== p.slug)
    .map((o) => ({ o, n: pontos(o) }))
    .filter((x) => x.n > 0)
    .sort((a, b) => b.n - a.n || a.o.name.localeCompare(b.o.name, "pt-BR"))
    .slice(0, limite)
    .map((x) => x.o);
}
