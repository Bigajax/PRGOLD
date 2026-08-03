"use client";

import { useMemo, useState, useTransition } from "react";
import { formataDataHora } from "@/lib/format";
import { waLink } from "@/lib/whatsapp";
import {
  CUSTOM_REQUEST_STATUSES,
  CUSTOM_REQUEST_STATUS_LABEL,
  type CustomRequest,
  type CustomRequestStatus,
} from "@/types";
import { DataTable, Etiqueta, PageHeader } from "./AdminUI";
import { toast } from "@/components/ui/Toaster";
import { IconeWhatsApp } from "@/components/ui/Icones";
import { mudarStatusPedido } from "@/app/admin/conteudo-actions";

/**
 * Solicitações de peça personalizada.
 *
 * Cada linha traz o botão que abre a conversa já endereçada ao cliente — o
 * atendimento começa daqui, não de copiar o número na mão.
 */
export function PedidosBoard({ pedidos }: { pedidos: CustomRequest[] }) {
  const [filtro, setFiltro] = useState<CustomRequestStatus | "todos">("todos");
  const [aberto, setAberto] = useState<string | null>(null);
  const [pendente, iniciar] = useTransition();

  const visiveis = useMemo(
    () => (filtro === "todos" ? pedidos : pedidos.filter((p) => p.status === filtro)),
    [pedidos, filtro]
  );

  const contagem = (s: CustomRequestStatus) =>
    pedidos.filter((p) => p.status === s).length;

  function mudar(id: string, status: CustomRequestStatus) {
    iniciar(async () => {
      const r = await mudarStatusPedido(id, status);
      toast(r.ok ? "Situação atualizada" : (r.error ?? "Falhou"), r.ok ? "sucesso" : "erro");
    });
  }

  const tomDoStatus = (s: CustomRequestStatus) =>
    s === "nova"
      ? "ouro"
      : s === "finalizada"
        ? "ativo"
        : s === "cancelada"
          ? "alerta"
          : "neutro";

  return (
    <>
      <PageHeader
        titulo="Peças personalizadas"
        descricao="As solicitações enviadas pelo formulário “Monte sua peça”."
      />

      <ul className="no-scrollbar mb-6 flex gap-2 overflow-x-auto">
        <li>
          <button
            type="button"
            onClick={() => setFiltro("todos")}
            aria-pressed={filtro === "todos"}
            className={`tap min-h-11 border px-4 text-sm whitespace-nowrap ${
              filtro === "todos" ? "border-onix bg-onix text-marfim" : "border-onix/20"
            }`}
          >
            Todas ({pedidos.length})
          </button>
        </li>
        {CUSTOM_REQUEST_STATUSES.map((s) => (
          <li key={s}>
            <button
              type="button"
              onClick={() => setFiltro(s)}
              aria-pressed={filtro === s}
              className={`tap min-h-11 border px-4 text-sm whitespace-nowrap ${
                filtro === s ? "border-onix bg-onix text-marfim" : "border-onix/20"
              }`}
            >
              {CUSTOM_REQUEST_STATUS_LABEL[s]} ({contagem(s)})
            </button>
          </li>
        ))}
      </ul>

      <DataTable
        itens={visiveis}
        chave={(p) => p.id}
        vazio={
          <p className="border border-dashed border-onix/20 p-10 text-center text-sm text-cinza-2">
            Nenhuma solicitação com esse recorte.
          </p>
        }
        colunas={[
          {
            titulo: "Cliente",
            render: (p) => (
              <div>
                <p className="font-medium">{p.name}</p>
                <p className="text-xs text-cinza-2">
                  {p.whatsapp}
                  {p.city ? ` · ${p.city}` : ""}
                </p>
              </div>
            ),
          },
          {
            titulo: "Peça",
            render: (p) => (
              <div>
                <p>{p.pieceType}</p>
                {p.style && <p className="text-xs text-cinza-2">{p.style}</p>}
              </div>
            ),
          },
          { titulo: "Recebida", render: (p) => formataDataHora(p.createdAt) },
          {
            titulo: "Situação",
            render: (p) => (
              <select
                value={p.status}
                disabled={pendente}
                onChange={(e) => mudar(p.id, e.target.value as CustomRequestStatus)}
                className="min-h-11 border border-onix/20 bg-transparent px-2 text-sm"
              >
                {CUSTOM_REQUEST_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {CUSTOM_REQUEST_STATUS_LABEL[s]}
                  </option>
                ))}
              </select>
            ),
          },
          {
            titulo: "Ações",
            className: "text-right",
            render: (p) => (
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAberto(aberto === p.id ? null : p.id)}
                  className="tap min-h-11 border border-onix/15 px-3 text-xs"
                >
                  {aberto === p.id ? "Fechar" : "Detalhes"}
                </button>
                <a
                  href={waLink(
                    `Olá, ${p.name}! Aqui é da PR Gold. Recebemos a sua solicitação de ${p.pieceType.toLowerCase()} e queremos entender melhor os detalhes.`,
                    { whatsapp: p.whatsapp }
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Falar com ${p.name} no WhatsApp`}
                  className="tap grid size-11 place-items-center border border-whats text-whats"
                >
                  <IconeWhatsApp className="size-4" />
                </a>
              </div>
            ),
          },
        ]}
        cartao={(p) => (
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-medium">{p.name}</p>
                <p className="text-xs text-cinza-2">{p.whatsapp}</p>
              </div>
              <Etiqueta tom={tomDoStatus(p.status)}>
                {CUSTOM_REQUEST_STATUS_LABEL[p.status]}
              </Etiqueta>
            </div>
            <p className="text-sm">
              {p.pieceType}
              {p.style ? ` · ${p.style}` : ""}
            </p>
            <p className="text-xs text-cinza-2">{formataDataHora(p.createdAt)}</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setAberto(aberto === p.id ? null : p.id)}
                className="tap min-h-11 flex-1 border border-onix/20 text-sm"
              >
                {aberto === p.id ? "Fechar" : "Detalhes"}
              </button>
              <a
                href={waLink(
                  `Olá, ${p.name}! Aqui é da PR Gold sobre a sua solicitação.`,
                  { whatsapp: p.whatsapp }
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="tap grid min-h-11 place-items-center border border-whats px-4 text-sm text-whats"
              >
                WhatsApp
              </a>
            </div>
          </div>
        )}
      />

      {aberto && (
        <Detalhes pedido={visiveis.find((p) => p.id === aberto)!} />
      )}
    </>
  );
}

function Detalhes({ pedido }: { pedido: CustomRequest }) {
  const linhas: [string, string | null][] = [
    ["Tipo de peça", pedido.pieceType],
    ["Estilo", pedido.style],
    [
      "Tipo de ouro",
      pedido.goldType
        ? { amarelo: "Ouro amarelo", branco: "Ouro branco", rose: "Ouro rosé" }[pedido.goldType]
        : null,
    ],
    ["Pedras", pedido.stones],
    ["Gravação", pedido.engraving],
    ["Acabamento", pedido.finish],
    ["Tamanho", pedido.size],
    ["Observações", pedido.notes],
    ["Cidade", pedido.city],
    ["E-mail", pedido.email],
    ["Mensagem", pedido.message],
    ["Origem", pedido.origin],
  ];

  const preenchidas = linhas.filter(([, v]) => Boolean(v)) as [string, string][];

  return (
    <section className="mt-6 border border-onix/12 p-5">
      <h2 className="font-display text-xl">Solicitação de {pedido.name}</h2>

      <dl className="mt-4 border-t border-onix/12">
        {preenchidas.map(([rotulo, valor]) => (
          <div
            key={rotulo}
            className="flex items-baseline justify-between gap-6 border-b border-onix/10 py-3"
          >
            <dt className="font-sans text-[11px] tracking-[0.14em] text-cinza-2 uppercase">
              {rotulo}
            </dt>
            <dd className="max-w-md text-right text-sm">{valor}</dd>
          </div>
        ))}
      </dl>

      {pedido.referenceImage && (
        <div className="mt-5">
          <p className="mb-2 font-sans text-[11px] tracking-[0.14em] text-cinza-2 uppercase">
            Referência enviada
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={pedido.referenceImage} alt="" className="max-h-72 object-contain" />
        </div>
      )}
    </section>
  );
}
