/**
 * Prepara os vídeos do hero e da seção institucional para a web.
 *
 * Os arquivos que saem do Instagram vêm pesados demais para a primeira dobra
 * (o do hero chegou com quase 13 MB). Aqui eles viram H.264 720p com teto de
 * bitrate, sem trilha de áudio (são mudos por definição) e com `faststart` —
 * o índice do arquivo vai para o começo, então o vídeo começa a tocar antes de
 * terminar de baixar.
 *
 * Também há um corte de duração: um laço de ambiente não precisa de mais de
 * ~12 segundos, e cada segundo extra é peso na primeira dobra.
 *
 * Gera ainda um poster JPEG do primeiro quadro — sem ele, o navegador mostra
 * um retângulo preto até o primeiro frame decodificar.
 *
 * Rodar: node scripts/prepara-videos.mjs
 */

import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdir, readdir, stat } from "node:fs/promises";
import path from "node:path";
import ffmpeg from "@ffmpeg-installer/ffmpeg";
import ffprobe from "@ffprobe-installer/ffprobe";

const exec = promisify(execFile);

const ORIGEM = path.resolve(process.cwd(), "_fotos-ig");
const DESTINO_VIDEO = path.resolve(process.cwd(), "public", "videos");
const DESTINO_POSTER = path.resolve(process.cwd(), "public", "images", "pr-gold", "posters");

/** Duração máxima do laço, em segundos. */
const DURACAO_MAX = 12;

async function duracao(arquivo) {
  const { stdout } = await exec(ffprobe.path, [
    "-v", "error",
    "-show_entries", "format=duration",
    "-of", "default=nw=1:nk=1",
    arquivo,
  ]);
  return Number(stdout.trim()) || 0;
}

async function converter(nome) {
  const entrada = path.join(ORIGEM, nome);
  const saida = path.join(DESTINO_VIDEO, nome);
  const poster = path.join(DESTINO_POSTER, nome.replace(/\.mp4$/, ".jpg"));

  const dur = await duracao(entrada);
  const corte = Math.min(dur, DURACAO_MAX);

  await exec(ffmpeg.path, [
    "-y",
    "-i", entrada,
    "-t", String(corte),
    // Teto de 720px de largura, mas NUNCA amplia: `min(720,iw)`. Um dos posts
    // só existe em 360px no Instagram, e esticá-lo para 720 entregava um
    // arquivo maior e mais borrado que o original.
    // `-2` mantém a altura par, exigência do H.264.
    "-vf", "scale='min(720,iw)':-2",
    "-c:v", "libx264",
    "-preset", "slow",
    "-crf", "28",
    "-maxrate", "1100k",
    "-bufsize", "2200k",
    "-pix_fmt", "yuv420p",
    // Sem áudio: são laços de ambiente, e trilha em autoplay é bloqueada.
    "-an",
    "-movflags", "+faststart",
    saida,
  ]);

  await exec(ffmpeg.path, [
    "-y",
    "-i", entrada,
    "-vf", "scale='min(720,iw)':-2",
    "-frames:v", "1",
    "-q:v", "4",
    poster,
  ]);

  const antes = (await stat(entrada)).size;
  const depois = (await stat(saida)).size;
  return { nome, dur: dur.toFixed(1), corte: corte.toFixed(1), antes, depois };
}

await mkdir(DESTINO_VIDEO, { recursive: true });
await mkdir(DESTINO_POSTER, { recursive: true });

const arquivos = (await readdir(ORIGEM)).filter((f) => f.endsWith(".mp4"));

for (const nome of arquivos) {
  const r = await converter(nome);
  const mb = (b) => (b / 1024 / 1024).toFixed(2);
  console.log(
    `[video] ${r.nome}: ${r.dur}s -> ${r.corte}s | ${mb(r.antes)} MB -> ${mb(r.depois)} MB`
  );
}
