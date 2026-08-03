/**
 * Curadoria do acervo fotográfico da PR Gold.
 *
 * De onde vem cada informação:
 * - as FOTOS são as originais publicadas pela própria PR Gold (@prgold_oficial);
 * - a FICHA TÉCNICA (peso, comprimento, largura, tipo de elo, pedras) sai das
 *   LEGENDAS escritas pela própria marca nos posts. Nada foi inventado aqui.
 * - o material "Ouro 18K" vem da bio oficial ("JÓIAS EM OURO 18K").
 * - PREÇO nunca aparece: a PR Gold não publica preço, e o site diz
 *   "Valor sob consulta".
 *
 * ---------------------------------------------------------------------------
 * DUAS REGRAS DE EXCLUSÃO APLICADAS
 * ---------------------------------------------------------------------------
 * 1. Marca de terceiro. As legendas da PR Gold citam Cartier, Tiffany,
 *    Van Cleef e Hermès como referência de estilo. Nenhum desses nomes entra
 *    no site. Onde a legenda usava a marca como nome do elo, o nome foi
 *    trocado pelo termo corrente da joalheria brasileira (elo cadeado).
 *
 * 2. Design registrado visível. Peças cuja FOTO exibe um elemento de desenho
 *    reconhecidamente registrado por outra maison ficaram fora do catálogo de
 *    demonstração. A decisão de exibi-las ou não é da PR Gold, e está
 *    registrada em docs/materiais-pendentes.md.
 *
 * Também foi excluída a imagem #56 (traz "Inspiração Cartier" gravado na
 * própria foto) e a #106 (traz etiqueta de preço manuscrita).
 */

export const MATERIAL = "Ouro 18K";
export const KARAT = 18;

/** Grupos descartados e o motivo — vira relatório em docs/. */
export const descartes = [
  { fotos: [38, 39, 40], motivo: "design registrado visível (bracelete com parafusos)" },
  { fotos: [50, 51], motivo: "design registrado visível (bracelete com aplique em T)" },
  { fotos: [55, 56], motivo: "design registrado visível (aplique floral) e marca gravada na foto" },
  { fotos: [94, 95], motivo: "design registrado visível (fecho em H)" },
  { fotos: [106], motivo: "etiqueta de preço manuscrita visível na foto" },
  { fotos: [10, 15], motivo: "foto sem leitura clara da peça / conteúdo não confirmado" },
];

/**
 * Produtos de demonstração.
 *
 * `fotos` são índices do manifesto `_fotos-ig/prgold_manifest.json`.
 * A primeira foto de cada peça é a capa.
 */
export const produtos = [
  /* ── Correntes ──────────────────────────────────────────────────────── */
  {
    slug: "corrente-romana-quadrada-25g",
    nome: "Corrente romana quadrada 25 g",
    categoria: "correntes",
    genero: "masculino",
    fotos: [2, 3, 4],
    peso: 25,
    destaque: true,
    novidade: true,
  },
  {
    slug: "corrente-romana-quadrada",
    nome: "Corrente romana quadrada",
    categoria: "correntes",
    genero: "masculino",
    fotos: [8, 9, 23, 24],
    destaque: true,
  },
  {
    slug: "corrente-elo-cadeado-10g",
    nome: "Corrente elo cadeado 10 g",
    categoria: "correntes",
    genero: "unissex",
    fotos: [35, 36],
    peso: 10,
    novidade: true,
  },
  {
    slug: "corrente-elo-cadeado-fecho-canhao-55g",
    nome: "Corrente elo cadeado com fecho canhão 55 g",
    categoria: "correntes",
    genero: "masculino",
    fotos: [41, 42],
    peso: 55,
    destaque: true,
    exclusivo: true,
  },
  {
    slug: "corrente-grumet-oca-30g",
    nome: "Corrente grumet oca 30 g",
    categoria: "correntes",
    genero: "masculino",
    fotos: [109, 110],
    peso: 30,
    dimensoes: "60 cm de comprimento, 8 mm de largura",
    destaque: true,
  },
  {
    slug: "corrente-romana-quadrada-com-crucifixo",
    nome: "Corrente romana quadrada com crucifixo",
    categoria: "correntes",
    colecao: "fe",
    genero: "masculino",
    fotos: [74, 75],
  },
  {
    slug: "corrente-elo-cadeado-com-crucifixo",
    nome: "Corrente elo cadeado com crucifixo",
    categoria: "correntes",
    colecao: "fe",
    genero: "masculino",
    fotos: [78, 79],
  },
  {
    slug: "corrente-elo-cadeado-com-crucifixo-3d",
    nome: "Corrente elo cadeado com crucifixo 3D",
    categoria: "correntes",
    colecao: "fe",
    genero: "masculino",
    fotos: [59, 60],
    destaque: true,
  },
  {
    slug: "corrente-romana-quadrada-com-pingente-25g",
    nome: "Corrente romana quadrada com pingente 25 g",
    categoria: "correntes",
    genero: "masculino",
    fotos: [105],
    peso: 25,
    dimensoes: "60 cm de comprimento, 6 mm de largura",
  },
  {
    slug: "corrente-elo-cadeado-com-pingente-cravejado",
    nome: "Corrente elo cadeado com pingente cravejado",
    categoria: "correntes",
    colecao: "fe",
    genero: "masculino",
    fotos: [91, 92, 93],
    pedras: "Pingente com diamante",
    exclusivo: true,
  },

  /* ── Colares ────────────────────────────────────────────────────────── */
  {
    slug: "corrente-lacraia",
    nome: "Corrente lacraia",
    categoria: "colares",
    genero: "feminino",
    fotos: [100, 101],
    dimensoes: "45 cm de comprimento, 5 mm de largura",
    exclusivo: true,
    destaque: true,
  },
  {
    slug: "corrente-portuguesa-com-pingente-15g",
    nome: "Corrente portuguesa com pingente 15 g",
    categoria: "colares",
    genero: "feminino",
    fotos: [102, 103],
    peso: 15,
    dimensoes: "45 cm de comprimento, 5 mm de largura",
    destaque: true,
  },
  {
    slug: "corrente-com-pingente-cravejado-44g",
    nome: "Corrente com pingente cravejado 44 g",
    categoria: "colares",
    colecao: "fe",
    genero: "feminino",
    fotos: [104],
    peso: 44,
  },
  {
    slug: "escapulario-15g",
    nome: "Escapulário 15 g",
    categoria: "colares",
    colecao: "fe",
    genero: "unissex",
    fotos: [107, 108],
    peso: 15,
    dimensoes: "65 cm de comprimento, 4 mm de largura",
  },
  {
    slug: "colar-com-pingente-personalizado",
    nome: "Colar com pingente personalizado",
    categoria: "colares",
    colecao: "personalizados",
    genero: "feminino",
    fotos: [98, 99],
    novidade: true,
  },
  {
    slug: "colar-exclusivo-sob-pedido",
    nome: "Colar exclusivo sob pedido",
    categoria: "colares",
    colecao: "personalizados",
    genero: "feminino",
    fotos: [96, 97],
    exclusivo: true,
    soEncomenda: true,
  },

  /* ── Pulseiras ──────────────────────────────────────────────────────── */
  {
    slug: "pulseira-elo-cadeado",
    nome: "Pulseira elo cadeado",
    categoria: "pulseiras",
    genero: "unissex",
    fotos: [0, 1],
    destaque: true,
  },
  {
    slug: "pulseira-romana-quadrada",
    nome: "Pulseira romana quadrada",
    categoria: "pulseiras",
    genero: "masculino",
    fotos: [11, 12, 43, 44],
    destaque: true,
  },
  {
    slug: "pulseira-romana-quadrada-30g",
    nome: "Pulseira romana quadrada 30 g",
    categoria: "pulseiras",
    genero: "masculino",
    fotos: [57, 58],
    peso: 30,
  },
  {
    slug: "pulseira-romana-quadrada-oca",
    nome: "Pulseira romana quadrada oca",
    categoria: "pulseiras",
    genero: "masculino",
    fotos: [76, 77],
  },
  {
    slug: "pulseira-grumet-oca",
    nome: "Pulseira grumet oca",
    categoria: "pulseiras",
    genero: "masculino",
    fotos: [61, 62],
  },
  {
    slug: "pulseira-elo-cadeado-tradicional",
    nome: "Pulseira elo cadeado tradicional",
    categoria: "pulseiras",
    genero: "unissex",
    fotos: [48, 49],
  },
  {
    slug: "bracelete-rigido",
    nome: "Bracelete rígido",
    categoria: "pulseiras",
    genero: "feminino",
    fotos: [18, 19],
  },

  /* ── Alianças ───────────────────────────────────────────────────────── */
  {
    slug: "alianca-abaulada",
    nome: "Aliança abaulada",
    categoria: "aliancas",
    colecao: "aliancas",
    genero: "unissex",
    fotos: [21, 22],
    destaque: true,
  },
  {
    slug: "alianca-abaulada-5mm",
    nome: "Aliança abaulada 5 mm",
    categoria: "aliancas",
    colecao: "aliancas",
    genero: "unissex",
    fotos: [29, 30, 31],
    dimensoes: "5 mm de largura",
    destaque: true,
  },
  {
    slug: "alianca-quadrada-com-friso-e-diamante",
    nome: "Aliança quadrada com friso e diamante",
    categoria: "aliancas",
    colecao: "aliancas",
    genero: "unissex",
    fotos: [45, 46, 47],
    pedras: "Diamante de 1 ct",
    exclusivo: true,
  },
  {
    slug: "meia-alianca-com-granada-e-diamantes",
    nome: "Meia aliança com granada e diamantes",
    categoria: "aliancas",
    colecao: "aliancas",
    genero: "feminino",
    fotos: [16, 17],
    pedras: "Granadas e diamantes",
    exclusivo: true,
    destaque: true,
  },
  {
    slug: "par-de-aliancas-com-friso",
    nome: "Par de alianças com friso",
    categoria: "aliancas",
    colecao: "aliancas",
    genero: "unissex",
    fotos: [52, 53, 54],
  },
  {
    slug: "conjunto-alianca-e-solitario",
    nome: "Conjunto aliança e solitário",
    categoria: "aliancas",
    colecao: "aliancas",
    genero: "feminino",
    fotos: [111, 112],
    destaque: true,
  },

  /* ── Anéis ──────────────────────────────────────────────────────────── */
  {
    slug: "anel-feminino-com-pedraria-natural",
    nome: "Anel feminino com pedraria natural",
    categoria: "aneis",
    genero: "feminino",
    fotos: [13, 14],
    pedras: "Pedraria natural",
    destaque: true,
  },
  {
    slug: "anel-solitario-tradicional",
    nome: "Anel solitário tradicional",
    categoria: "aneis",
    genero: "feminino",
    fotos: [63, 64],
    destaque: true,
  },
  {
    slug: "anel-quadrado-com-pedrarias",
    nome: "Anel quadrado com pedrarias",
    categoria: "aneis",
    colecao: "personalizados",
    genero: "feminino",
    fotos: [65, 66],
  },
  {
    slug: "anel-feminino-macico-personalizado",
    nome: "Anel feminino maciço personalizado",
    categoria: "aneis",
    colecao: "personalizados",
    genero: "feminino",
    fotos: [67, 68],
  },
  {
    slug: "anel-feminino-com-diamantes",
    nome: "Anel feminino com diamantes",
    categoria: "aneis",
    genero: "feminino",
    fotos: [69, 70, 71],
    pedras: "Diamantes",
    exclusivo: true,
  },
  {
    slug: "anel-feminino-personalizado",
    nome: "Anel feminino personalizado",
    categoria: "aneis",
    colecao: "personalizados",
    genero: "feminino",
    fotos: [33, 34],
    novidade: true,
  },
  {
    slug: "anel-masculino-personalizado",
    nome: "Anel masculino personalizado",
    categoria: "aneis",
    colecao: "personalizados",
    genero: "masculino",
    fotos: [80, 81, 82, 83],
    destaque: true,
    novidade: true,
  },
  {
    slug: "anel-masculino-em-alto-relevo",
    nome: "Anel masculino em alto relevo",
    categoria: "aneis",
    colecao: "personalizados",
    genero: "masculino",
    fotos: [84, 85],
  },

  /* ── Pingentes ──────────────────────────────────────────────────────── */
  {
    slug: "pingente-personalizado-macico",
    nome: "Pingente personalizado maciço",
    categoria: "pingentes",
    colecao: "personalizados",
    genero: "unissex",
    fotos: [72, 73],
    destaque: true,
  },
  {
    slug: "pingente-personalizado-em-alto-relevo",
    nome: "Pingente personalizado em alto relevo",
    categoria: "pingentes",
    colecao: "personalizados",
    genero: "unissex",
    fotos: [89, 90],
  },

  /* ── Conjuntos ──────────────────────────────────────────────────────── */
  {
    slug: "kit-pulseira-e-corrente",
    nome: "Kit pulseira e corrente",
    categoria: "correntes",
    colecao: "presentes",
    genero: "masculino",
    fotos: [26, 27, 28],
    destaque: true,
  },
  {
    slug: "conjunto-pulseira-corrente-e-pingente",
    nome: "Conjunto pulseira, corrente e pingente",
    categoria: "correntes",
    colecao: "presentes",
    genero: "masculino",
    fotos: [86, 87, 88],
  },
  {
    slug: "kit-corrente-elo-cadeado-e-par-de-aliancas",
    nome: "Kit corrente elo cadeado e par de alianças",
    categoria: "correntes",
    colecao: "presentes",
    genero: "unissex",
    fotos: [6, 7],
    pedras: "Alianças com pedrarias",
  },
];

/** Fotos editoriais e institucionais, com o papel que cada uma cumpre. */
export const editoriais = [
  { foto: 37, arquivo: "atelie-fundicao", pasta: "editorial", alt: "Ouro fundido no ateliê da PR Gold durante a confecção de uma peça" },
  { foto: 25, arquivo: "pesagem", pasta: "editorial", alt: "Corrente de ouro sobre balança de precisão na PR Gold" },
  { foto: 26, arquivo: "embalagem", pasta: "editorial", alt: "Embalagem oficial da PR Gold com corrente e pingente" },
  { foto: 36, arquivo: "certificado", pasta: "editorial", alt: "Corrente de ouro apresentada sobre o certificado da PR Gold" },
  { foto: 20, arquivo: "aneis-selecao", pasta: "editorial", alt: "Anéis de ouro com pedras apresentados em estojo" },
  { foto: 32, arquivo: "envio", pasta: "institutional", alt: "Encomenda da PR Gold sendo despachada para envio" },
  { foto: 5, arquivo: "atendimento", pasta: "institutional", alt: "Peça da PR Gold entregue a um cliente" },
];

/**
 * Hero da home. Duas artes separadas: a panorâmica do desktop e o recorte
 * vertical do mobile. Reaproveitar a mesma foto cortada é o erro clássico.
 */
export const hero = {
  desktop: 109,
  // Mesma peça e mesma foto: a #110 é a mesma corrente sob luz do dia, sobre
  // mesa de madeira — não tem o feixe nem o contraste que definem a marca.
  // O mobile recebe um recorte 4:5 próprio da mesma imagem.
  mobile: 109,
  alt: "Corrente grumet em ouro apresentada em expositor preto sob luz dourada",
};

/** Grade do Instagram da home — oito recortes quadrados. */
export const galeriaInstagram = [59, 100, 45, 84, 13, 74, 21, 61];
