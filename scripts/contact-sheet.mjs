/**
 * Monta folhas de contato numeradas a partir de `_fotos-ig/`.
 *
 * Serve para classificar o acervo visualmente antes de decidir o que vira
 * produto, o que vira editorial e o que vira institucional. O número impresso
 * em cada miniatura é o índice do manifesto — é por ele que a classificação é
 * registrada em `_fotos-ig/classificacao.json`.
 */

import sharp from "sharp";
import { readFile, mkdir } from "node:fs/promises";
import path from "node:path";

const DIR = path.resolve(process.cwd(), "_fotos-ig");
const SAIDA = path.join(DIR, "folhas");

const COLS = 8;
const LINHAS = 5;
const CELULA = 190;
const ROTULO = 22;
const POR_FOLHA = COLS * LINHAS;

const manifesto = JSON.parse(await readFile(path.join(DIR, "prgold_manifest.json"), "utf8"));
await mkdir(SAIDA, { recursive: true });

const larguraFolha = COLS * CELULA;
const alturaFolha = LINHAS * (CELULA + ROTULO);

for (let folha = 0; folha * POR_FOLHA < manifesto.length; folha++) {
  const fatia = manifesto.slice(folha * POR_FOLHA, (folha + 1) * POR_FOLHA);
  const composicao = [];

  for (let i = 0; i < fatia.length; i++) {
    const item = fatia[i];
    const indice = folha * POR_FOLHA + i;
    const col = i % COLS;
    const lin = Math.floor(i / COLS);
    const x = col * CELULA;
    const y = lin * (CELULA + ROTULO);

    try {
      const thumb = await sharp(path.join(DIR, item.file))
        .resize(CELULA - 6, CELULA - 6, { fit: "cover" })
        .toBuffer();
      composicao.push({ input: thumb, left: x + 3, top: y + 3 });
    } catch {
      // Arquivo ilegível: a célula fica vazia e o número continua batendo.
    }

    const etiqueta = Buffer.from(
      `<svg width="${CELULA}" height="${ROTULO}">
         <rect width="100%" height="100%" fill="#080808"/>
         <text x="6" y="16" font-family="monospace" font-size="14" fill="#D4AF37">#${indice}</text>
       </svg>`
    );
    composicao.push({ input: etiqueta, left: x, top: y + CELULA });
  }

  const nome = path.join(SAIDA, `folha-${String(folha).padStart(2, "0")}.png`);
  await sharp({
    create: {
      width: larguraFolha,
      height: alturaFolha,
      channels: 3,
      background: "#080808",
    },
  })
    .composite(composicao)
    .png()
    .toFile(nome);

  console.log(`[folha] ${nome} (${fatia.length} imagens)`);
}
