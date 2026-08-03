/**
 * PR Gold — regras comerciais do catálogo.
 *
 * Fonte única de prazo e de limiares. A lição por trás deste arquivo é do guia
 * mestre: quando o prazo de encomenda era digitável por produto, o catálogo
 * acumulou prazos divergentes e a correção exigiu script no banco inteiro.
 */

/**
 * Prazo de encomenda: é promessa DA LOJA, não propriedade de cada peça.
 *
 * Vazio de propósito — TODO_CONFIRMAR. Enquanto a PR Gold não informar o prazo
 * real que pratica, o site NÃO exibe prazo nenhum: a peça sob encomenda diz
 * apenas "Sob encomenda" e o prazo é combinado no atendimento. Inventar um
 * prazo aqui é a forma mais rápida de queimar a confiança na primeira conversa.
 */
export const PRAZO_ENCOMENDA = "";

export function temPrazoConfirmado(): boolean {
  return PRAZO_ENCOMENDA.trim().length > 0;
}

/**
 * Frase completa da encomenda. Sem prazo confirmado, devolve a versão honesta.
 */
export function textoEncomenda(): string {
  return temPrazoConfirmado()
    ? `Peça sob encomenda. Prazo de ${PRAZO_ENCOMENDA} após a confirmação.`
    : "Peça sob encomenda. O prazo é confirmado no atendimento.";
}

/** Abaixo disso, a peça mostra "últimas unidades" — derivado do estoque real. */
export const LIMIAR_ESTOQUE_BAIXO = 2;

/** Itens por página no catálogo. Múltiplo de 2, 3 e 4: a grade fecha em toda largura. */
export const ITENS_POR_PAGINA = 12;

/** Teto de fotos por peça, validado no servidor. */
export const MAX_FOTOS = 8;

/** Teto de upload, alinhado ao bodySizeLimit do next.config.ts. */
export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

export const MIME_PERMITIDOS = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
] as const;

/** Bucket público de imagens da vitrine. */
export const BUCKET_IMAGENS = "pr-gold";

/**
 * Ressalva de valor. A vitrine não fecha venda: todo preço exibido é
 * referência, e o valor final sai do atendimento.
 */
export const RESSALVA_PRECO =
  "Valor de referência. O valor final é confirmado no atendimento.";

export const TEXTO_SEM_PRECO = "Valor sob consulta";

/* ── Ordenação do catálogo ────────────────────────────────────────────────── */

export const ORDENACOES = [
  { value: "destaques", label: "Destaques" },
  { value: "recentes", label: "Mais recentes" },
  { value: "menor-preco", label: "Menor preço" },
  { value: "maior-preco", label: "Maior preço" },
  { value: "nome", label: "Nome" },
] as const;

export type Ordenacao = (typeof ORDENACOES)[number]["value"];
export const ORDENACAO_PADRAO: Ordenacao = "destaques";

/* ── Vocabulário do domínio, para a busca ────────────────────────────────── */

/**
 * Sinônimos do jeito que o cliente da PR Gold realmente escreve. É isto que
 * separa uma busca "inteligente" de um `includes()`: quem procura "cordão"
 * quer corrente; quem digita "grumê" quer grumet.
 */
export const SINONIMOS: Record<string, string[]> = {
  corrente: ["cordao", "corrente", "corretne"],
  pulseira: ["pulseira", "bracelete", "braceletes"],
  anel: ["anel", "aneis"],
  alianca: ["alianca", "aliancas", "casamento", "noivado"],
  pingente: ["pingente", "pingentes", "berloque"],
  brinco: ["brinco", "brincos", "argola", "argolas"],
  colar: ["colar", "colares", "gargantilha"],
  grumet: ["grumet", "grume", "grumeta"],
  veneziana: ["veneziana"],
  piastrine: ["piastrine", "piastrini"],
  cadeado: ["cadeado", "elo cadeado"],
  riviera: ["riviera", "rivieira"],
  masculino: ["masculino", "masculina", "homem", "dele"],
  feminino: ["feminino", "feminina", "mulher", "dela"],
  personalizado: ["personalizado", "personalizada", "sob medida", "exclusivo"],
  ouro: ["ouro", "gold", "18k", "dourado"],
  fe: ["fe", "religioso", "religiosa", "cruz", "crucifixo", "santo"],
};

/**
 * Elos e modelos da faixa rotativa da home.
 *
 * Numa loja de tênis a faixa que gira é de marcas, e ela funciona porque marca
 * é termo de busca: quem vê "Nike" vê um caminho, não um enfeite. A PR Gold não
 * revende marca — o que o cliente dela pede pelo nome é o elo ("quero uma
 * grumet"). Então a faixa é de elo, e cada palavra é link.
 *
 * Os termos NÃO foram escolhidos por soarem de joalheria: saíram dos nomes das
 * peças que a própria PR Gold publicou (`data/demo/produtos.ts` é gerado das
 * legendas do @prgold_oficial). "Romana quadrada" e "lacraia" estão aqui porque
 * a loja fala assim, não porque enfeitam a faixa.
 *
 * A home ainda filtra esta lista contra o catálogo antes de exibir — termo sem
 * peça não entra. Isso é o que mantém a faixa honesta quando o Supabase assume
 * e o acervo muda: ela encolhe sozinha em vez de prometer o que não existe.
 */
export type EloVitrine = {
  /** O que vai na busca. Precisa achar peça, senão o elo não entra na faixa. */
  termo: string;
  /** Arquivo em `public/images/elos/`, sem extensão. */
  slug: string;
  /** Nome acessível da imagem — o rótulo desenhado nela não é lido por ninguém. */
  rotulo: string;
};

export const ELOS_VITRINE: EloVitrine[] = [
  { termo: "romana quadrada", slug: "romana-quadrada", rotulo: "Romana quadrada" },
  { termo: "elo cadeado", slug: "elo-cadeado", rotulo: "Elo cadeado" },
  { termo: "grumet", slug: "grumet", rotulo: "Grumet" },
  { termo: "portuguesa", slug: "portuguesa", rotulo: "Portuguesa" },
  { termo: "lacraia", slug: "lacraia", rotulo: "Lacraia" },
  { termo: "escapulário", slug: "escapulario", rotulo: "Escapulário" },
];

/** Abaixo disso a faixa não aparece: com uma ou duas palavras ela vira loop óbvio. */
export const MIN_ELOS_FAIXA = 3;
