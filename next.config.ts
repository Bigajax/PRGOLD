import type { NextConfig } from "next";

/**
 * PR Gold — configuração do Next 16.
 *
 * Notas de versão que valem registrar (o Next 16 mudou coisas relevantes):
 * - `middleware.ts` foi renomeado para `proxy.ts` (runtime nodejs, sem edge).
 * - Turbopack é o padrão em `dev` e `build`; nenhuma flag é necessária.
 * - `images.qualities` passou a permitir SÓ os valores declarados aqui.
 * - `images.minimumCacheTTL` subiu de 60s para 4h por padrão.
 */
const nextConfig: NextConfig = {
  images: {
    // As fotos enviadas pelo painel vivem no Storage do Supabase. Nada além
    // disso é permitido: o <Image> do Next não vira proxy de imagem alheia.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
    // Fotografia de joia é detalhe puro: brilho do ouro, faceta da pedra e
    // textura do elo. 75 achata esses detalhes num fundo preto, onde o
    // banding aparece primeiro. 90 fica disponível para o hero e a galeria
    // da página de produto; o resto do site continua em 75.
    qualities: [75, 90],
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    serverActions: {
      // O upload de foto do painel vai por Server Action (FormData). O teto
      // de validação no servidor é 8 MB; a folga cobre o overhead do
      // multipart (boundaries e headers de parte).
      bodySizeLimit: "9mb",
    },
  },
};

export default nextConfig;
