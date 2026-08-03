/**
 * Prepara as variações da logo oficial da PR Gold.
 *
 * O arquivo fornecido é um JPG 1080x1080 com o brasão dourado sobre fundo
 * preto. A marca NÃO foi redesenhada: o que este script faz é recortar o fundo
 * e gerar os tamanhos que o site precisa.
 *
 * O recorte usa a própria luminância como canal alfa. Funciona porque o
 * material é dourado sobre preto quase puro: o que é escuro vira transparente
 * e o que é dourado permanece, com as bordas antisserrilhadas de graça (a
 * transição de luminância vira transição de opacidade).
 *
 * Rodar: node scripts/prepara-logo.mjs
 */

import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const ORIGEM =
  "C:/Users/Rafael/Downloads/118951785_619953465559322_950688499142750342_n.jpg";

const MARCA = path.resolve(process.cwd(), "public", "images", "brand");
const APP = path.resolve(process.cwd(), "app");

await mkdir(MARCA, { recursive: true });

/* ── 1. Versão recortada, para usar sobre qualquer fundo ─────────────────── */

// `trim` remove a moldura preta uniforme antes de tudo — sem isso o brasão
// fica pequeno no meio de um quadrado vazio no cabeçalho.
const base = sharp(ORIGEM).trim({ threshold: 18 });
const { width, height } = await base.clone().toBuffer({ resolveWithObject: true }).then(
  (r) => r.info
);

const lado = Math.max(width, height);

// Quadrado com margem mínima, para o brasão não encostar na borda.
const quadrado = await base
  .clone()
  .resize(lado, lado, { fit: "contain", background: { r: 0, g: 0, b: 0 } })
  .toBuffer();

// Alfa = luminância esticada: o preto do fundo zera e o dourado fica opaco.
//
// O cálculo é feito pixel a pixel, no buffer cru, de propósito: as rotas de
// composição de canal do sharp dependem de o espaço de cor estar exatamente
// certo, e falham em silêncio — a versão anterior deste script gerava um PNG
// sem canal alfa nenhum, e o único jeito de perceber era inspecionar o
// arquivo. Aqui o que acontece está escrito.
const { data: cru, info } = await sharp(quadrado)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

// Rampa com limiar, em vez de ganho linear.
//
// O fundo do JPG tem grão: a luminância dele oscila em torno de 20. Um ganho
// linear ou deixava resíduo — e o brasão aparecia com um quadrado escuro em
// volta sobre o cabeçalho preto — ou, se forte o bastante para zerar o grão,
// comia as partes escuras do degradê dourado.
//
// Abaixo do PISO é fundo e zera; acima do TETO é a peça e fica opaca; entre os
// dois fica a borda antisserrilhada.
const PISO = 30;
const TETO = 62;

for (let i = 0; i < cru.length; i += info.channels) {
  const luminancia = 0.2126 * cru[i] + 0.7152 * cru[i + 1] + 0.0722 * cru[i + 2];
  const t = (luminancia - PISO) / (TETO - PISO);
  cru[i + 3] = t <= 0 ? 0 : t >= 1 ? 255 : Math.round(t * 255);
}

const recortada = await sharp(cru, {
  raw: { width: info.width, height: info.height, channels: 4 },
})
  .png()
  .toBuffer();

// 512 é o teto útil: o brasão nunca aparece maior que ~200px no site, e um
// PNG de 1024 com alfa passava de 1,5 MB dentro de `public/` — peso que
// viajaria no deploy sem nenhuma tela precisar dele.
await sharp(recortada)
  .resize(512, 512, { fit: "inside" })
  .png({ compressionLevel: 9 })
  .toFile(path.join(MARCA, "logo-prgold.png"));

// Versão pequena, otimizada para o cabeçalho (evita servir 1024px num
// elemento de 44px em telas sem otimizador de imagem).
await sharp(recortada)
  .resize(256, 256, { fit: "inside" })
  .png({ compressionLevel: 9 })
  .toFile(path.join(MARCA, "logo-prgold-256.png"));

/* ── 2. Monocromática marfim, para fundos que não comportam o dourado ────── */

await sharp(recortada)
  .resize(512, 512, { fit: "inside" })
  .tint({ r: 244, g: 240, b: 232 })
  .png({ compressionLevel: 9 })
  .toFile(path.join(MARCA, "logo-prgold-mono.png"));

/* ── 3. Favicon e ícone de aplicativo ────────────────────────────────────── */

// Aqui o fundo preto FICA: é assim que a marca se apresenta, e um brasão
// dourado transparente sobre a aba branca do navegador quase desaparece.
const comFundo = await sharp(quadrado)
  .resize(512, 512, { fit: "contain", background: { r: 8, g: 8, b: 8 } })
  .extend({
    top: 40, bottom: 40, left: 40, right: 40,
    background: { r: 8, g: 8, b: 8 },
  })
  .resize(512, 512)
  .png()
  .toBuffer();

await sharp(comFundo).toFile(path.join(APP, "icon.png"));
await sharp(comFundo).resize(180, 180).toFile(path.join(APP, "apple-icon.png"));

/* ── 4. Imagem de compartilhamento ──────────────────────────────────────── */

const og = await sharp({
  create: { width: 1200, height: 630, channels: 3, background: { r: 8, g: 8, b: 8 } },
})
  .composite([
    {
      input: await sharp(recortada).resize(420, 420, { fit: "inside" }).toBuffer(),
      gravity: "centre",
    },
  ])
  .png()
  .toBuffer();

await sharp(og).toFile(path.join(MARCA, "og.png"));

console.log(`[logo] original ${width}x${height} (após recorte da moldura)`);
console.log("[logo] gerados: logo-prgold.png, logo-prgold-256.png, logo-prgold-mono.png");
console.log("[logo] gerados: app/icon.png, app/apple-icon.png, brand/og.png");
