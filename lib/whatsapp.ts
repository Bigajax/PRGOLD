import { site } from "@/config/site";
import { textoEncomenda } from "@/config/catalogo";
import { precoTexto } from "@/lib/format";
import {
  AVAILABILITY_LABEL,
  deriveAvailability,
  type CustomRequest,
  type Product,
  type SiteSettings,
} from "@/types";

/**
 * ÚNICO ponto do projeto que monta link de WhatsApp.
 *
 * Nenhum `wa.me` pode existir fora deste arquivo — sanitização espalhada é
 * sanitização esquecida.
 *
 * Anatomia fixa das mensagens, em quatro partes:
 *   1. saudação contextual
 *   2. blocos "*RÓTULO*" + valor, um dado por bloco
 *   3. campos vazios OMITIDOS por completo (nunca "rótulo: não informado")
 *   4. fecho com pergunta, que puxa a primeira resposta do atendente
 */

const DIVISOR = "----------------";

/**
 * Sanitização obrigatória.
 *
 * O WhatsApp Desktop no Windows corrompe travessão, meia-risca, espaço
 * inquebrável e emoji quando chegam por `?text=` — o atendente recebe "&#65533;"
 * no lugar. Toda a formatação se apoia no *negrito* nativo, e não em símbolo.
 */
function sanitiza(mensagem: string): string {
  return mensagem
    .replace(/[—–]/g, "-") // travessão e meia-risca -> hífen ASCII
    .replace(/ /g, " ") // espaço inquebrável -> espaço comum
    .replace(/ | /g, " "); // espaços finos usados por Intl
}

const bloco = (rotulo: string, valor?: string | null): string | null =>
  valor ? `*${rotulo}*\n${valor}` : null;

const compoe = (...partes: (string | null | undefined)[]): string =>
  partes.filter(Boolean).join("\n\n");

/**
 * Monta o link final. `encodeURIComponent` roda UMA vez, sobre a mensagem
 * inteira — concatenar pedaços já codificados quebra as quebras de linha.
 */
export function waLink(mensagem: string, settings?: Pick<SiteSettings, "whatsapp">) {
  const numero = settings?.whatsapp || site.whatsapp;
  return `https://wa.me/${numero}?text=${encodeURIComponent(sanitiza(mensagem))}`;
}

/** Disponibilidade em texto, já com a regra de prazo da loja. */
function disponibilidadeTexto(p: Product): string {
  const status = deriveAvailability(p);
  if (status === "sob-encomenda") return textoEncomenda();
  return AVAILABILITY_LABEL[status];
}

function saudacao(p: Product): string {
  const status = deriveAvailability(p);
  if (status === "sob-encomenda") {
    return `Olá, ${site.name}! Gostaria de encomendar esta joia:`;
  }
  return `Olá, ${site.name}! Gostaria de consultar esta joia:`;
}

function fecho(p: Product): string {
  const status = deriveAvailability(p);
  if (status === "pronta-entrega") {
    return "Pode me passar as formas de pagamento e entrega?";
  }
  if (status === "sob-encomenda") {
    return "Pode confirmar o valor e o prazo para mim?";
  }
  return "Pode confirmar o valor e a disponibilidade?";
}

/* ========================================================================== */
/* 1. Consulta de uma peça                                                    */
/* ========================================================================== */

export function mensagemProduto(p: Product, url?: string): string {
  return compoe(
    saudacao(p),
    bloco("PRODUTO", p.name),
    bloco("CÓDIGO", p.code),
    bloco("VALOR", precoTexto(p)),
    bloco("DISPONIBILIDADE", disponibilidadeTexto(p)),
    bloco("LINK", url ?? null),
    fecho(p)
  );
}

/* ========================================================================== */
/* 2. Consulta dos favoritos                                                  */
/* ========================================================================== */

export function mensagemFavoritos(
  itens: Product[],
  urlBase?: string
): string {
  const lista = itens
    .map((p, i) =>
      [
        `${i + 1}. ${p.name}`,
        `Código: ${p.code}`,
        `Valor: ${precoTexto(p)}`,
        urlBase ? `Link: ${urlBase}/produto/${p.slug}` : null,
      ]
        .filter(Boolean)
        .join("\n")
    )
    .join(`\n${DIVISOR}\n`);

  return compoe(
    `Olá, ${site.name}! Separei algumas joias que gostei:`,
    lista,
    "Pode me ajudar a escolher?"
  );
}

/* ========================================================================== */
/* 3. Solicitação de peça personalizada                                       */
/* ========================================================================== */

const OURO_LABEL: Record<string, string> = {
  amarelo: "Ouro amarelo",
  branco: "Ouro branco",
  rose: "Ouro rosé",
};

export function mensagemPersonalizada(
  pedido: Pick<
    CustomRequest,
    | "pieceType"
    | "style"
    | "goldType"
    | "stones"
    | "engraving"
    | "size"
    | "notes"
    | "name"
    | "city"
  >
): string {
  return compoe(
    `Olá, ${site.name}! Gostaria de solicitar uma joia personalizada.`,
    bloco("NOME", pedido.name),
    bloco("CIDADE", pedido.city),
    bloco("TIPO DE PEÇA", pedido.pieceType),
    bloco("ESTILO", pedido.style),
    bloco("TIPO DE OURO", pedido.goldType ? OURO_LABEL[pedido.goldType] : null),
    bloco("PEDRAS", pedido.stones),
    bloco("GRAVAÇÃO", pedido.engraving),
    bloco("TAMANHO", pedido.size),
    bloco("OBSERVAÇÕES", pedido.notes),
    "Podem me ajudar a desenvolver essa peça?"
  );
}

/* ========================================================================== */
/* 4. Atendimento geral                                                       */
/* ========================================================================== */

export function mensagemAtendimento(settings?: Pick<SiteSettings, "whatsappDefaultMessage">) {
  return settings?.whatsappDefaultMessage || site.whatsappDefaultMessage;
}

/** Beco sem saída da busca: o termo procurado vira a mensagem. */
export function mensagemBuscaVazia(termo: string): string {
  return compoe(
    `Olá, ${site.name}! Procurei por "${termo}" no site e não encontrei.`,
    "Vocês têm alguma peça assim?"
  );
}

/** Plano B quando o catálogo não carrega: a falha técnica vira atendimento. */
export function mensagemErro(): string {
  return compoe(
    `Olá, ${site.name}! O site não está carregando agora.`,
    "Podem me atender por aqui?"
  );
}
