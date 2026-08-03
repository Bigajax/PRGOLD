/**
 * Coletor local de fotos do Instagram oficial da PR Gold.
 *
 * Por que existe um servidor aqui em vez de um script simples: as URLs do CDN
 * do Instagram são assinadas e de vida curta, e só podem ser lidas de dentro
 * da página autenticada. Este processo recebe a lista direto do navegador
 * (POST em localhost) e faz o download no Node, onde não há restrição de CORS.
 *
 * Uso:
 *   node scripts/coletor-fotos.mjs
 * e, no console da página do perfil, o snippet que faz o POST para
 * http://localhost:4599/coleta
 *
 * Só baixa imagens publicadas pela própria PR Gold. Nada aqui captura tela:
 * são os arquivos originais, sem nenhum elemento de interface do Instagram.
 */

import { createServer } from "node:http";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const PORTA = 4599;
const DESTINO = path.resolve(process.cwd(), "_fotos-ig");

const cabecalhosCors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function lerCorpo(req) {
  return new Promise((resolve, reject) => {
    const partes = [];
    req.on("data", (c) => partes.push(c));
    req.on("end", () => resolve(Buffer.concat(partes).toString("utf8")));
    req.on("error", reject);
  });
}

async function baixar(url) {
  const resposta = await fetch(url, {
    headers: {
      // O CDN recusa requisições sem Referer coerente.
      Referer: "https://www.instagram.com/",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36",
    },
  });
  if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
  return Buffer.from(await resposta.arrayBuffer());
}

const servidor = createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, cabecalhosCors).end();
    return;
  }

  if (req.method !== "POST" || !req.url?.startsWith("/coleta")) {
    res.writeHead(404, cabecalhosCors).end("nao encontrado");
    return;
  }

  try {
    const itens = JSON.parse(await lerCorpo(req));
    await mkdir(DESTINO, { recursive: true });

    const manifesto = [];
    let baixadas = 0;
    const falhas = [];

    for (let i = 0; i < itens.length; i++) {
      const item = itens[i];
      // `nome` explícito permite reaproveitar o coletor para vídeo (.mp4) sem
      // um segundo servidor só para isso.
      const nome = item.nome ?? `prgold_${String(i).padStart(2, "0")}.jpg`;
      try {
        const buffer = await baixar(item.url);
        await writeFile(path.join(DESTINO, nome), buffer);
        baixadas++;
        manifesto.push({
          file: nome,
          alt: item.alt ?? null,
          post: item.post ?? null,
          bytes: buffer.length,
        });
      } catch (erro) {
        falhas.push({ indice: i, motivo: String(erro.message ?? erro) });
      }
    }

    // Só reescreve o manifesto do acervo fotográfico; uma coleta de vídeos
    // (que passa `nome`) não pode apagar o manifesto das fotos.
    if (!itens.some((i) => i.nome)) {
      await writeFile(
        path.join(DESTINO, "prgold_manifest.json"),
        JSON.stringify(manifesto, null, 2),
        "utf8"
      );
    }

    console.log(`[coletor] ${baixadas} imagens salvas em ${DESTINO}`);
    if (falhas.length) console.log(`[coletor] ${falhas.length} falhas`, falhas);

    // A resposta NÃO devolve nenhuma URL — só contagens.
    res.writeHead(200, { ...cabecalhosCors, "Content-Type": "application/json" });
    res.end(JSON.stringify({ recebidas: itens.length, baixadas, falhas: falhas.length }));
  } catch (erro) {
    res.writeHead(500, { ...cabecalhosCors, "Content-Type": "application/json" });
    res.end(JSON.stringify({ erro: String(erro.message ?? erro) }));
  }
});

servidor.listen(PORTA, "127.0.0.1", () => {
  console.log(`[coletor] ouvindo em http://localhost:${PORTA}/coleta`);
  console.log(`[coletor] destino: ${DESTINO}`);
});
