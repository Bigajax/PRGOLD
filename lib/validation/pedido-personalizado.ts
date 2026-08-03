import { z } from "zod";

/**
 * Contrato do formulário "Monte sua peça".
 *
 * As mensagens estão em português e prontas para exibir: o erro do Zod É o
 * texto que a pessoa lê. Os limites espelham os CHECKs da migration 0003 —
 * banco e aplicação nunca discordam sobre o que cabe num campo.
 */

export const TIPOS_DE_PECA = [
  "Anel",
  "Aliança",
  "Corrente",
  "Colar",
  "Pulseira",
  "Pingente",
  "Brinco",
  "Outra",
] as const;

export const ESTILOS = [
  "Clássico",
  "Minimalista",
  "Moderno",
  "Religioso",
  "Romântico",
  "Masculino",
  "Personalizado",
] as const;

export const TIPOS_DE_OURO = [
  { value: "amarelo", label: "Ouro amarelo" },
  { value: "branco", label: "Ouro branco" },
  { value: "rose", label: "Ouro rosé" },
] as const;

export const OPCOES_PEDRAS = ["Com pedras", "Sem pedras", "A definir"] as const;

const textoOpcional = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Use no máximo ${max} caracteres.`)
    .optional()
    .transform((v) => (v ? v : undefined));

export const etapa1Schema = z.object({
  pieceType: z.enum(TIPOS_DE_PECA, {
    message: "Escolha o tipo de peça.",
  }),
});

export const etapa2Schema = z.object({
  style: z.enum(ESTILOS, { message: "Escolha um estilo." }),
});

export const etapa3Schema = z.object({
  goldType: z.enum(["amarelo", "branco", "rose"]).optional(),
  stones: textoOpcional(120),
  engraving: textoOpcional(120),
  finish: textoOpcional(60),
  size: textoOpcional(60),
  notes: textoOpcional(800),
});

export const etapa5Schema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Informe seu nome.")
    .max(120, "Use no máximo 120 caracteres."),
  whatsapp: z
    .string()
    .trim()
    .refine((v) => v.replace(/\D/g, "").length >= 10, {
      message: "Informe um WhatsApp com DDD.",
    })
    .refine((v) => v.replace(/\D/g, "").length <= 13, {
      message: "Número muito longo. Confira os dígitos.",
    }),
  city: textoOpcional(120),
  email: z
    .union([z.literal(""), z.email("E-mail inválido.")])
    .optional()
    .transform((v) => (v ? v : undefined)),
  message: textoOpcional(800),
});

/**
 * Schema da Server Action — o que constitui uma solicitação VÁLIDA.
 *
 * `style` é opcional aqui, embora `etapa2Schema` o exija. Não é
 * inconsistência: são duas perguntas diferentes. A etapa é a regra da
 * INTERFACE, que guia a pessoa e não deixa avançar sem escolher; este schema é
 * a regra do DADO — uma solicitação com tipo de peça e contato já é atendível,
 * e recusá-la por falta de estilo seria perder um pedido por formalidade.
 */
export const pedidoSchema = etapa1Schema
  .extend(etapa3Schema.shape)
  .extend(etapa5Schema.shape)
  .extend({
    style: z.enum(ESTILOS).optional(),
    referenceImage: z.string().url().optional(),
    origin: z.string().max(60).optional(),
  });

export type PedidoPersonalizado = z.infer<typeof pedidoSchema>;
