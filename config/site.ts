/**
 * PR Gold — identidade e canais.
 *
 * FONTE ÚNICA. Nenhum telefone, e-mail, @ ou endereço pode aparecer hardcoded
 * em componente. Trocar o WhatsApp da loja tem que ser editar uma linha aqui
 * (ou um campo no painel, que sobrepõe estes valores em runtime).
 *
 * ---------------------------------------------------------------------------
 * TODO_CONFIRMAR — nada abaixo marcado assim foi confirmado pela PR Gold.
 * A lista completa do que falta está em `docs/materiais-pendentes.md`, e o
 * site mostra um aviso em desenvolvimento enquanto houver pendência.
 * ---------------------------------------------------------------------------
 */

export const site = {
  /* ── Identidade (confirmada no perfil oficial @prgold_oficial) ────────── */
  name: "PR Gold",
  legalName: "", // TODO_CONFIRMAR — razão social
  legalDocument: "", // TODO_CONFIRMAR — CNPJ
  /** Da bio oficial: "JÓIAS EM OURO 18K". */
  tagline: "Joias em ouro com atendimento personalizado.",
  /** Da bio oficial: "DESDE 2019 joalheria com confecção própria". */
  foundedYear: 2019,

  description:
    "Joalheria de ouro com confecção própria. Alianças, anéis, correntes, pulseiras, brincos e peças personalizadas, com atendimento próximo pelo WhatsApp.",

  /* ── Canais ───────────────────────────────────────────────────────────── */

  /**
   * Número comercial da PR Gold. Formato obrigatório: DDI + DDD + número, SÓ
   * DÍGITOS. Sem "+", sem espaço, sem parêntese, sem hífen.
   *
   * ORIGEM: a própria PR Gold publica "Orçamentos 44998788108" nas legendas de
   * dezenas de posts do perfil oficial (@prgold_oficial). O DDD 44 confere com
   * Maringá-PR, que é a cidade informada na bio. Não foi inventado nem
   * deduzido — é o número que a marca divulga publicamente para orçamento.
   *
   * AINDA ASSIM, CONFIRMAR POR ESCRITO antes de publicar: se o atendimento do
   * site vai para um número diferente do que está no Instagram, é aqui que se
   * troca. Um dígito errado desvia todos os clientes em silêncio.
   */
  whatsapp: "5544998788108",
  whatsappDefaultMessage:
    "Olá, PR Gold! Vim pelo site e gostaria de um atendimento.",

  /* Confirmados no perfil público. */
  instagramHandle: "prgold_oficial",
  instagramUrl: "https://www.instagram.com/prgold_oficial/",

  email: "", // TODO_CONFIRMAR — e-mail real ou vazio para ocultar o campo
  address: "", // TODO_CONFIRMAR — endereço; vazio oculta a linha
  /** Confirmado na bio oficial: "Maringa Pr". */
  city: "Maringá - PR",
  businessHours: "", // TODO_CONFIRMAR — vazio oculta a linha

  /**
   * URL pública final. Sem ela, canonical, OG e sitemap apontam para lugar
   * nenhum e a prévia de link no WhatsApp chega sem imagem.
   */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
} as const;

export type Site = typeof site;

/**
 * Vídeos da marca.
 *
 * São publicações do próprio perfil oficial, reencodadas para a web por
 * `scripts/prepara-videos.mjs` (720p, sem áudio, com o índice no começo do
 * arquivo). Cada um tem um poster do primeiro quadro: sem ele, o espaço fica
 * preto até o vídeo decodificar — e isso acontece na primeira dobra.
 *
 * Para trocar um vídeo, suba o novo em `_fotos-ig/`, rode o script e aponte
 * aqui. O nome de arquivo carrega a versão de propósito: sobrescrever o mesmo
 * nome continua entregando o vídeo antigo pelo cache do navegador.
 */
export const midia = {
  /**
   * Respeitar "reduzir animações" do sistema operacional.
   *
   * DECISÃO ATUAL: `false` — os laços tocam sempre.
   *
   * É a mesma escolha do projeto irmão (PR Grife): o vídeo de ambiente é a
   * apresentação da marca, não um enfeite animado. O motivo prático também
   * pesou: o Windows costuma vir com "Mostrar animações" desligado, o Chrome
   * traduz isso em `prefers-reduced-motion: reduce`, e o hero aparecia parado
   * na máquina de quem estava avaliando o site.
   *
   * `true` devolve o comportamento acessível: quem pediu menos movimento no
   * sistema vê o poster parado. É o que o briefing pede em acessibilidade, e
   * a troca é esta linha.
   *
   * O que NÃO muda com a chave: os vídeos são mudos, sem controles e não
   * disparam som nem navegação. O risco de movimento automático aqui é de
   * desconforto, não de perda de conteúdo — a página inteira funciona sem
   * eles.
   */
  respeitarMovimentoReduzido: false,

  hero: [
    {
      src: "/videos/hero-1.mp4",
      poster: "/images/pr-gold/posters/hero-1.jpg",
      post: "https://www.instagram.com/p/DaV4F3rBYLg/",
    },
    {
      src: "/videos/hero-2.mp4",
      poster: "/images/pr-gold/posters/hero-2.jpg",
      post: "https://www.instagram.com/p/DN6Yu3lEQPM/",
    },
  ],
  atelie: {
    src: "/videos/atelie.mp4",
    poster: "/images/pr-gold/posters/atelie.jpg",
    post: "https://www.instagram.com/p/DZ4okx8RNQc/",
    alt: "Ouro sendo fundido no ateliê da PR Gold",
  },
} as const;

/** Placeholder do guia: 55 seguido só de zeros. */
export function isPlaceholderWhatsApp(numero: string): boolean {
  return /^550+$/.test(numero) || numero.trim() === "";
}

/**
 * Lista de pendências que impedem a publicação. Alimenta o aviso de
 * desenvolvimento e o relatório de entrega — em vez de depender de alguém
 * lembrar de conferir.
 */
export function pendenciasDeConfiguracao(overrides?: {
  whatsapp?: string;
  email?: string;
  address?: string;
  businessHours?: string;
}): string[] {
  const whatsapp = overrides?.whatsapp || site.whatsapp;
  const pendencias: string[] = [];

  if (isPlaceholderWhatsApp(whatsapp)) {
    pendencias.push("Número de WhatsApp comercial (DDI + DDD, só dígitos)");
  } else if (whatsapp === "5544998788108") {
    pendencias.push(
      "Confirmar por escrito o WhatsApp de atendimento (o atual saiu das legendas do Instagram oficial)"
    );
  }
  if (!(overrides?.email ?? site.email)) {
    pendencias.push("E-mail de contato (ou decisão de ocultar o campo)");
  }
  if (!(overrides?.address ?? site.address)) {
    pendencias.push("Endereço para exibição (ou decisão de mostrar só a cidade)");
  }
  if (!(overrides?.businessHours ?? site.businessHours)) {
    pendencias.push("Horário de atendimento");
  }
  if (!site.legalDocument) {
    pendencias.push("CNPJ e razão social para o rodapé");
  }
  if (site.url.includes("localhost")) {
    pendencias.push("Domínio final em NEXT_PUBLIC_SITE_URL");
  }

  return pendencias;
}
