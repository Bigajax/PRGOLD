/**
 * PR Gold — todo texto institucional do site.
 *
 * Existe porque a lição mais cara do guia mestre é esta: quando os textos
 * ficam espalhados pelos componentes, cada ajuste de copy vira caça ao tesouro
 * e a loja nova estreia com a frase da loja anterior. Se um texto aparece na
 * tela e não é dado de produto, ele mora aqui.
 *
 * O que está marcado TODO_CONFIRMAR é copy provisória: soa como a marca, mas
 * ainda não foi validada pela PR Gold. Nada aqui afirma número, prazo,
 * garantia, certificação ou qualquer fato não confirmado.
 */

export const textos = {
  /* ── 1. Barra superior ────────────────────────────────────────────────── */
  barraTopo: {
    texto: "Joias em ouro com atendimento personalizado.",
    ctaLabel: "Falar com um especialista",
  },

  /* ── 3. Hero ──────────────────────────────────────────────────────────── */
  // Copy enxuta de propósito: quatro elementos e nada mais — etiqueta, título,
  // uma linha de apoio e dois botões. A primeira dobra não precisa explicar a
  // marca, precisa deixar claro o que é e para onde ir.
  hero: {
    // O ano NÃO é escrito aqui: sai de `site.foundedYear`, que é a fonte única.
    // Repetido à mão, viraria o segundo lugar a corrigir no dia em que a loja
    // resolver a contradição entre "DESDE 2019" da bio e "SINCE 2015" da
    // marca-d'água (ver docs/materiais-pendentes.md).
    etiquetaSufixo: "Ouro 18K",
    titulo: "Joias únicas, feitas para contar a sua história.",
    /** A palavra do título que recebe o dourado. Precisa existir no título. */
    destaque: "história",
    descricao: "Confecção própria em ouro 18K, com exclusividade em cada detalhe.",
    ctaPrimario: "Ver catálogo",
    // O segundo caminho da primeira dobra é a confecção própria, não o
    // atendimento: o WhatsApp já está no topo, na barra fixa e no botão
    // flutuante. O rótulo é o mesmo do menu e da barra inferior — um destino
    // com dois nomes vira dois destinos na cabeça de quem lê.
    ctaSecundario: "Monte sua peça",
  },

  /* ── 4. Categorias ────────────────────────────────────────────────────── */
  categorias: {
    etiqueta: "Catálogo",
    titulo: "Navegue por categoria",
    verTudo: "Ver tudo",
  },

  /* ── 5. Produtos em destaque ──────────────────────────────────────────── */
  destaques: {
    etiqueta: "Curadoria",
    titulo: "Seleção PR Gold",
    subtitulo: "Peças escolhidas para momentos que merecem ser lembrados.",
    ctaLabel: "Ver catálogo completo",
  },

  /* ── 6. Monte sua peça ────────────────────────────────────────────────── */
  montePeca: {
    etiqueta: "Sob medida",
    titulo: "Uma joia criada para ser somente sua.",
    // A descrição não repete as quatro etapas — os cartões ao lado já as
    // listam. Ela responde ao "por quê" que os cartões não respondem.
    descricao:
      "A peça começa na sua ideia e é feita para uma pessoa só. Conte como você imagina — a conversa segue no WhatsApp.",
    ctaLabel: "Começar minha peça",
    ctaSecundario: "Abrir formulário completo",
    // `icone` é nome de ícone do lucide, na mesma convenção de `beneficiosPadrao`.
    etapas: [
      {
        icone: "Gem",
        titulo: "Escolha a peça",
        texto: "Anel, aliança, corrente, pingente — o formato da sua ideia.",
      },
      {
        icone: "PenLine",
        titulo: "Defina o estilo",
        texto: "Do clássico ao minimalista, o que combina com quem vai usar.",
      },
      {
        icone: "Diamond",
        titulo: "Selecione os detalhes",
        texto: "Tipo de ouro, pedras, gravação e acabamento.",
      },
      {
        icone: "MessageCircle",
        titulo: "Fale com um especialista",
        texto: "Recebemos sua ideia e continuamos a conversa pelo WhatsApp.",
      },
    ],
    /**
     * Faixa de garantias da seção.
     *
     * Nenhum item aqui é promessa nova. Os dois primeiros descrevem o que este
     * formulário faz — enviar não cria pedido, e a resposta vem por WhatsApp;
     * os dois últimos são o que a própria PR Gold já declara no perfil oficial.
     *
     * O que NÃO entra, por não estar confirmado pela loja: certificação,
     * garantia, prazo, frete e política de ajuste. Ver
     * `docs/materiais-pendentes.md`.
     */
    garantias: [
      {
        icone: "Handshake",
        titulo: "Sem compromisso",
        texto: "Enviar não gera pedido.",
      },
      {
        icone: "MessageCircle",
        titulo: "Resposta no WhatsApp",
        texto: "Com uma pessoa do outro lado.",
      },
      {
        icone: "Hammer",
        titulo: "Confecção própria",
        texto: "A peça nasce no nosso ateliê.",
      },
      {
        icone: "Gem",
        titulo: "Somente ouro 18K",
        texto: "Em todas as peças da vitrine.",
      },
    ],
  },

  /* ── 7. Coleções ──────────────────────────────────────────────────────── */
  colecoes: {
    etiqueta: "Coleções",
    titulo: "Coleções PR Gold",
    subtitulo: "Recortes do catálogo para encontrar mais rápido o que procura.",
  },

  /* ── 8. Momentos ──────────────────────────────────────────────────────── */
  momentos: {
    etiqueta: "Ocasiões",
    titulo: "Para momentos que permanecem",
    subtitulo: "Comece pela ocasião e nós mostramos as peças que combinam.",
  },

  /* ── 9. Experiência PR Gold ───────────────────────────────────────────── */
  experiencia: {
    etiqueta: "Experiência",
    titulo: "A experiência PR Gold",
    subtitulo:
      "Do primeiro contato à entrega da peça, com acompanhamento em cada etapa.",
  },

  /* ── 10. Sobre a marca ────────────────────────────────────────────────── */
  sobre: {
    etiqueta: "A marca",
    // "Desde 2019" e "confecção própria" vêm da própria bio oficial da PR Gold.
    titulo: "Desde 2019, histórias transformadas em joias.",
    // TODO_CONFIRMAR — texto-base provisório, a ser validado pela PR Gold.
    texto:
      "A PR Gold nasceu com o propósito de apresentar joias que representem momentos importantes. Cada escolha é acompanhada por um atendimento próximo, cuidadoso e personalizado.",
    ctaPrimario: "Conheça a PR Gold",
    ctaSecundario: "Falar com a equipe",
  },

  /* ── 11. Instagram ────────────────────────────────────────────────────── */
  instagram: {
    etiqueta: "Bastidores",
    titulo: "Acompanhe a PR Gold",
    subtitulo: "As peças que saem do nosso ateliê, no perfil oficial.",
    ctaLabel: "Seguir no Instagram",
  },

  /* ── 12. CTA final ────────────────────────────────────────────────────── */
  ctaFinal: {
    titulo: "Encontre a joia que representa o seu momento.",
    descricao:
      "Nossa equipe está pronta para ajudar você a escolher ou criar uma peça especial.",
    ctaPrimario: "Falar pelo WhatsApp",
    ctaSecundario: "Ver catálogo",
  },

  /* ── 13. Rodapé ───────────────────────────────────────────────────────── */
  rodape: {
    frase: "Joias em ouro, criadas para durar mais que o momento que celebram.",
    direitos: "Todos os direitos reservados.",
  },

  /* ── Páginas internas ─────────────────────────────────────────────────── */
  catalogo: {
    titulo: "Catálogo",
    subtitulo: "Todas as peças disponíveis na vitrine da PR Gold.",
  },

  favoritos: {
    titulo: "Seus favoritos",
    subtitulo:
      "As peças que você salvou. A lista fica guardada apenas neste aparelho.",
    vazioTitulo: "Sua lista ainda está vazia",
    vazioTexto:
      "Toque no coração de qualquer peça para guardá-la aqui e consultar tudo de uma vez no WhatsApp.",
    ctaConsultar: "Consultar favoritos no WhatsApp",
    ctaLimpar: "Limpar lista",
  },

  monteSuaPeca: {
    etiqueta: "Monte sua peça",
    titulo: "Conte como seria a joia ideal.",
    descricao:
      "São cinco passos rápidos. Ao final, sua solicitação chega até nós e a conversa continua pelo WhatsApp.",
    // Sem promessa de orçamento automático, valor ou prazo — é o que o
    // formulário realmente faz.
    avisoFinal:
      "Recebemos sua solicitação. Um especialista vai retomar a conversa pelo WhatsApp para entender os detalhes.",
  },

  contato: {
    etiqueta: "Atendimento",
    titulo: "Fale com a PR Gold",
    subtitulo:
      "O atendimento acontece pelo WhatsApp, com uma pessoa do outro lado.",
  },

  erro: {
    titulo: "Fora do ar temporariamente",
    texto:
      "Não conseguimos carregar o catálogo agora. Você pode tentar de novo ou falar direto com a nossa equipe.",
    ctaRecarregar: "Recarregar página",
    ctaWhatsApp: "Falar pelo WhatsApp",
  },

  naoEncontrado: {
    titulo: "Esta peça não está na vitrine",
    texto:
      "O endereço pode ter mudado ou a peça pode ter saído do catálogo. Veja o que está disponível agora.",
    cta: "Ver catálogo",
  },
} as const;

/**
 * Benefícios da seção "Experiência PR Gold".
 *
 * Ficam aqui como padrão e são sobrepostos pelo painel quando a tabela
 * `benefits` tiver registros. Nenhum deles afirma certificação, garantia,
 * prazo, cobertura nacional ou assistência — só o que a própria PR Gold já
 * comunica no perfil oficial.
 */
export const beneficiosPadrao = [
  {
    icon: "MessageCircle",
    title: "Atendimento personalizado",
    description:
      "Uma pessoa acompanha sua escolha do primeiro contato até a entrega.",
  },
  {
    icon: "Gem",
    title: "Somente joias em ouro",
    description: "Toda a vitrine é de peças em ouro, sem exceção.",
  },
  {
    icon: "Hammer",
    title: "Confecção própria",
    description: "Peças criadas no nosso ateliê, inclusive sob encomenda.",
  },
  {
    icon: "Sparkles",
    title: "Personalização",
    description:
      "Conte a ideia e desenvolvemos uma peça pensada para a sua história.",
  },
] as const;
