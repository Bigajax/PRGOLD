/**
 * Monta o acervo do site a partir das fotos coletadas + curadoria.
 *
 * Faz duas coisas:
 * 1. Otimiza e organiza as imagens em public/images/pr-gold/.
 * 2. Gera o catálogo de demonstração em data/demo/, que alimenta a vitrine
 *    enquanto o Supabase não estiver configurado.
 *
 * Rodar: node scripts/monta-acervo.mjs
 */

import sharp from "sharp";
import { readFile, writeFile, mkdir, rm } from "node:fs/promises";
import path from "node:path";
import {
  produtos,
  editoriais,
  hero,
  galeriaInstagram,
  descartes,
  MATERIAL,
  KARAT,
} from "./curadoria.mjs";

const RAIZ = process.cwd();
const ORIGEM = path.join(RAIZ, "_fotos-ig");
const PUB = path.join(RAIZ, "public", "images", "pr-gold");
const DADOS = path.join(RAIZ, "data", "demo");

const manifesto = JSON.parse(
  await readFile(path.join(ORIGEM, "prgold_manifest.json"), "utf8")
);

const arquivoDe = (indice) => path.join(ORIGEM, manifesto[indice].file);

/**
 * Reduz e converte para WebP. `largura` é o teto do lado maior — nunca amplia
 * (`withoutEnlargement`), porque esticar a foto de uma joia só entrega borrão.
 */
async function otimizar(indice, destino, largura, opcoes = {}) {
  await mkdir(path.dirname(destino), { recursive: true });
  let img = sharp(arquivoDe(indice)).rotate();

  if (opcoes.quadrado) {
    img = img.resize(largura, largura, { fit: "cover", position: "attention" });
  } else if (opcoes.altura) {
    img = img.resize(largura, opcoes.altura, {
      fit: "cover",
      position: opcoes.posicao ?? "centre",
    });
  } else {
    img = img.resize({ width: largura, withoutEnlargement: true });
  }

  await img.webp({ quality: opcoes.quality ?? 82, effort: 5 }).toFile(destino);
  return path.posix.join(
    "/images/pr-gold",
    path.relative(PUB, destino).split(path.sep).join("/")
  );
}

// Recomeça do zero para não deixar sobra de uma curadoria anterior.
await rm(PUB, { recursive: true, force: true });
await mkdir(PUB, { recursive: true });
await mkdir(DADOS, { recursive: true });

/* ── Taxonomia ──────────────────────────────────────────────────────────── */

// Definida antes dos produtos porque o tipo `Product` carrega o NOME da
// categoria e da coleção junto do slug — é o que evita um segundo lookup em
// cada card da vitrine.
const CATEGORIAS = [
  { slug: "aliancas", name: "Alianças", description: "Para o momento que começa uma história." },
  { slug: "aneis", name: "Anéis", description: "Solitários, personalizados e peças com pedras." },
  { slug: "correntes", name: "Correntes", description: "Elos romanos, grumet e cadeado em ouro." },
  { slug: "colares", name: "Colares", description: "Correntes femininas com pingente." },
  { slug: "pulseiras", name: "Pulseiras", description: "Do elo cadeado ao bracelete rígido." },
  { slug: "pingentes", name: "Pingentes", description: "Peças personalizadas em alto relevo." },
];

const COLECOES = [
  { slug: "aliancas", name: "Alianças", description: "As peças que marcam um compromisso." },
  { slug: "fe", name: "Fé", description: "Crucifixos, escapulários e peças devocionais." },
  { slug: "personalizados", name: "Personalizados", description: "Criadas a partir de uma ideia." },
  { slug: "presentes", name: "Presentes", description: "Conjuntos pensados para presentear." },
];

const nomeCategoria = (slug) => CATEGORIAS.find((c) => c.slug === slug)?.name ?? null;
const nomeColecao = (slug) => COLECOES.find((c) => c.slug === slug)?.name ?? null;

/* ── Produtos ───────────────────────────────────────────────────────────── */

const registros = [];
let n = 0;

for (const p of produtos) {
  n++;
  const imagens = [];

  for (let i = 0; i < p.fotos.length; i++) {
    const destino = path.join(PUB, "products", `${p.slug}-${i + 1}.webp`);
    const url = await otimizar(p.fotos[i], destino, 1400);
    imagens.push({
      url,
      alt: i === 0 ? `${p.nome} em ouro` : `${p.nome} — detalhe ${i + 1}`,
      position: i,
    });
  }

  registros.push({
    id: `demo-${String(n).padStart(3, "0")}`,
    slug: p.slug,
    code: `PRG-${String(n).padStart(3, "0")}`,
    name: p.nome,
    shortDescription: null,
    fullDescription: null,
    categorySlug: p.categoria,
    categoryName: nomeCategoria(p.categoria),
    collectionSlug: p.colecao ?? null,
    collectionName: p.colecao ? nomeColecao(p.colecao) : null,
    gender: p.genero ?? null,
    material: MATERIAL,
    goldType: "amarelo",
    karat: KARAT,
    weightG: p.peso ?? null,
    dimensions: p.dimensoes ?? null,
    stones: p.pedras ?? null,
    // Preço NUNCA é inventado: a PR Gold não publica valores.
    price: null,
    promoPrice: null,
    priceOnRequest: true,
    // Estoque não controlado no acervo de demonstração. Peças marcadas
    // `soEncomenda` caem em "Sob encomenda"; as demais, em "Consulte
    // disponibilidade" — que é a verdade enquanto a loja não confirmar.
    stockQuantity: null,
    lowStockThreshold: null,
    readyToShip: false,
    madeToOrder: Boolean(p.soEncomenda),
    images: imagens,
    featured: Boolean(p.destaque),
    newArrival: Boolean(p.novidade),
    exclusive: Boolean(p.exclusivo),
    active: true,
    position: n,
    archivedAt: null,
    seoTitle: null,
    seoDescription: null,
    demo: true,
  });

  console.log(`[produto] ${p.slug} (${imagens.length} fotos)`);
}

/* ── Editorial e institucional ──────────────────────────────────────────── */

const editorialUrls = {};
for (const e of editoriais) {
  const destino = path.join(PUB, e.pasta, `${e.arquivo}.webp`);
  editorialUrls[e.arquivo] = { url: await otimizar(e.foto, destino, 1800), alt: e.alt };
  console.log(`[${e.pasta}] ${e.arquivo}`);
}

/* ── Hero ───────────────────────────────────────────────────────────────── */

// O hero é dividido: no desktop a foto ocupa a coluna da direita (retrato
// 3:4, como saiu da câmera) e no mobile ela vira um bloco 4:5 no topo. Duas
// artes de verdade, não a mesma imagem esticada.
const heroDesktop = await otimizar(hero.desktop, path.join(PUB, "hero-desktop.webp"), 1400, {
  quality: 86,
});
const heroMobile = await otimizar(hero.mobile, path.join(PUB, "hero-mobile.webp"), 1080, {
  altura: 1350,
  quality: 86,
});
console.log("[hero] desktop + mobile");

/* ── Capas de categoria e coleção ───────────────────────────────────────── */

const capaDe = (slug) => {
  const primeiro = registros.find((r) => r.categorySlug === slug);
  return primeiro?.images[0]?.url ?? null;
};
const capaColecao = (slug) => {
  const primeiro = registros.find((r) => r.collectionSlug === slug);
  return primeiro?.images[0]?.url ?? null;
};

/* ── Grade do Instagram ─────────────────────────────────────────────────── */

const instagram = [];
for (let i = 0; i < galeriaInstagram.length; i++) {
  const idx = galeriaInstagram[i];
  const destino = path.join(PUB, "instagram", `ig-${i + 1}.webp`);
  const url = await otimizar(idx, destino, 700, { quadrado: true, quality: 80 });
  instagram.push({
    id: `ig-${i + 1}`,
    image: url,
    postUrl: manifesto[idx].post ? `https://www.instagram.com${manifesto[idx].post}` : null,
    alt: "Publicação da PR Gold no Instagram",
    position: i,
    active: true,
  });
}
console.log(`[instagram] ${instagram.length} imagens`);

/* ── Escrita dos arquivos de dados ──────────────────────────────────────── */

const cabecalho = `/**
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
`;

const categorias = CATEGORIAS.map((c, i) => ({
    id: `cat-${i + 1}`,
    ...c,
    image: capaDe(c.slug),
    position: i,
    active: true,
  }))
  .filter((c) => registros.some((r) => r.categorySlug === c.slug));

const colecoes = COLECOES.map((c, i) => ({
    id: `col-${i + 1}`,
    ...c,
    image: capaColecao(c.slug),
    bannerDesktop: null,
    bannerMobile: null,
    position: i,
    active: true,
  }))
  .filter((c) => registros.some((r) => r.collectionSlug === c.slug));

const momentos = [
  { slug: "pedido-de-casamento", name: "Pedido de casamento", filterQuery: "categoria=aneis" },
  { slug: "casamento", name: "Casamento", filterQuery: "colecao=aliancas" },
  { slug: "aniversario", name: "Aniversário", filterQuery: "categoria=colares" },
  { slug: "formatura", name: "Formatura", filterQuery: "categoria=aneis" },
  { slug: "presente", name: "Presente", filterQuery: "colecao=presentes" },
  { slug: "conquista-pessoal", name: "Conquista pessoal", filterQuery: "categoria=correntes" },
  { slug: "joia-personalizada", name: "Joia personalizada", filterQuery: "colecao=personalizados" },
].map((m, i) => ({
  id: `mom-${i + 1}`,
  ...m,
  description: null,
  image: null,
  position: i,
  active: true,
}));

const banners = [
  {
    id: "banner-1",
    title: "",
    subtitle: null,
    imageDesktop: heroDesktop,
    imageMobile: heroMobile,
    ctaLabel: null,
    link: null,
    align: "left",
    overlay: 45,
    position: 0,
    active: true,
    startsAt: null,
    endsAt: null,
  },
];

const escrever = (arquivo, nome, tipo, valor) =>
  writeFile(
    path.join(DADOS, arquivo),
    `${cabecalho}\nimport type { ${tipo} } from "@/types";\n\nexport const ${nome}: ${tipo}[] = ${JSON.stringify(valor, null, 2)};\n`,
    "utf8"
  );

await escrever("produtos.ts", "produtosDemo", "Product", registros);
await escrever("categorias.ts", "categoriasDemo", "Category", categorias);
await escrever("colecoes.ts", "colecoesDemo", "Collection", colecoes);
await escrever("momentos.ts", "momentosDemo", "Moment", momentos);
await escrever("banners.ts", "bannersDemo", "Banner", banners);
await escrever("instagram.ts", "instagramDemo", "InstagramPost", instagram);

await writeFile(
  path.join(DADOS, "editorial.ts"),
  `${cabecalho}\nexport const editorial = ${JSON.stringify(editorialUrls, null, 2)} as const;\n\nexport const heroDemo = ${JSON.stringify(
    { desktop: heroDesktop, mobile: heroMobile, alt: hero.alt },
    null,
    2
  )} as const;\n`,
  "utf8"
);

/* ── Relatório de descartes ─────────────────────────────────────────────── */

const usadas = new Set([
  ...produtos.flatMap((p) => p.fotos),
  ...editoriais.map((e) => e.foto),
  hero.desktop,
  hero.mobile,
  ...galeriaInstagram,
]);
const naoUsadas = manifesto.map((_, i) => i).filter((i) => !usadas.has(i));

console.log(`\n[resumo] ${registros.length} peças, ${categorias.length} categorias, ${colecoes.length} coleções`);
console.log(`[resumo] ${usadas.size} fotos usadas, ${naoUsadas.length} não usadas`);
console.log(`[resumo] descartes explícitos: ${descartes.length} grupos`);
