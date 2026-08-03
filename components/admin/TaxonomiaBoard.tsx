"use client";

import { useState, useTransition } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import type { Category, Collection } from "@/types";
import { DataTable, Etiqueta, PageHeader } from "./AdminUI";
import { ConfirmDialog } from "./ConfirmDialog";
import { toast } from "@/components/ui/Toaster";
import { excluirTaxonomia, salvarTaxonomia } from "@/app/admin/conteudo-actions";

type Item = Category | Collection;

/**
 * CRUD de categorias e coleções.
 *
 * As duas telas são a mesma coisa com rótulos diferentes — duplicar o código
 * só criaria duas versões da mesma correção de bug no futuro. A única
 * diferença real é que coleção tem banner próprio.
 */
export function TaxonomiaBoard({
  itens,
  tabela,
  titulo,
  descricao,
  singular,
}: {
  itens: Item[];
  tabela: "categories" | "collections";
  titulo: string;
  descricao: string;
  singular: string;
}) {
  const [editando, setEditando] = useState<Item | null | undefined>(undefined);
  const [excluindo, setExcluindo] = useState<Item | null>(null);
  const [pendente, iniciar] = useTransition();

  const ehColecao = tabela === "collections";

  function executa(acao: () => Promise<{ ok: boolean; error?: string }>) {
    iniciar(async () => {
      const r = await acao();
      if (!r.ok) {
        toast(r.error ?? "Não foi possível concluir.", "erro");
        return;
      }
      toast("Pronto");
      setExcluindo(null);
      setEditando(undefined);
    });
  }

  return (
    <>
      <PageHeader
        titulo={titulo}
        descricao={descricao}
        acao={
          <button
            type="button"
            onClick={() => setEditando(null)}
            className="tap inline-flex min-h-12 items-center gap-2 border border-onix bg-onix px-6 font-sans text-[11px] tracking-[0.14em] text-marfim uppercase"
          >
            <Plus className="size-4" aria-hidden />
            {singular}
          </button>
        }
      />

      <DataTable
        itens={itens}
        chave={(i) => i.id}
        vazio={
          <p className="border border-dashed border-onix/20 p-10 text-center text-sm text-cinza-2">
            Nada cadastrado ainda.
          </p>
        }
        colunas={[
          {
            titulo: "Nome",
            render: (i) => (
              <div className="flex items-center gap-3">
                {i.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={i.image} alt="" className="size-12 shrink-0 object-cover" />
                ) : (
                  <span className="grid size-12 shrink-0 place-items-center border border-dashed border-onix/25 text-[9px] text-cinza-2">
                    sem capa
                  </span>
                )}
                <div>
                  <p className="font-medium">{i.name}</p>
                  <p className="text-xs text-cinza-2">/{i.slug}</p>
                </div>
              </div>
            ),
          },
          {
            titulo: "Descrição",
            render: (i) => (
              <span className="text-cinza-2">{i.description ?? "—"}</span>
            ),
          },
          { titulo: "Ordem", render: (i) => i.position },
          {
            titulo: "Situação",
            render: (i) =>
              i.active ? (
                <Etiqueta tom="ativo">Visível</Etiqueta>
              ) : (
                <Etiqueta>Oculta</Etiqueta>
              ),
          },
          {
            titulo: "Ações",
            className: "text-right",
            render: (i) => (
              <div className="flex justify-end gap-1">
                <button
                  type="button"
                  onClick={() => setEditando(i)}
                  aria-label={`Editar ${i.name}`}
                  className="tap grid size-11 place-items-center border border-onix/15 hover:border-ouro-escuro"
                >
                  <Pencil className="size-4" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => setExcluindo(i)}
                  aria-label={`Excluir ${i.name}`}
                  className="tap grid size-11 place-items-center border border-alerta/30 text-alerta"
                >
                  <Trash2 className="size-4" aria-hidden />
                </button>
              </div>
            ),
          },
        ]}
        cartao={(i) => (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              {i.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={i.image} alt="" className="size-16 shrink-0 object-cover" />
              ) : (
                <span className="grid size-16 shrink-0 place-items-center border border-dashed border-onix/25 text-[9px] text-cinza-2">
                  sem capa
                </span>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{i.name}</p>
                <p className="text-xs text-cinza-2">/{i.slug}</p>
              </div>
              {i.active ? <Etiqueta tom="ativo">Visível</Etiqueta> : <Etiqueta>Oculta</Etiqueta>}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setEditando(i)}
                className="tap min-h-11 flex-1 border border-onix/20 text-sm"
              >
                Editar
              </button>
              <button
                type="button"
                onClick={() => setExcluindo(i)}
                className="tap min-h-11 border border-alerta/30 px-4 text-sm text-alerta"
              >
                Excluir
              </button>
            </div>
          </div>
        )}
      />

      {editando !== undefined && (
        <Formulario
          item={editando}
          ehColecao={ehColecao}
          singular={singular}
          pendente={pendente}
          aoSalvar={(dados) => executa(() => salvarTaxonomia(tabela, dados))}
          aoFechar={() => setEditando(undefined)}
        />
      )}

      {excluindo && (
        <ConfirmDialog
          titulo={`Excluir “${excluindo.name}”?`}
          descricao="Se houver peças usando este item, a exclusão é bloqueada. Para tirar da navegação sem apagar, desative em vez de excluir."
          rotuloConfirmar="Excluir"
          perigo
          ocupado={pendente}
          aoConfirmar={() => executa(() => excluirTaxonomia(tabela, excluindo.id))}
          aoFechar={() => setExcluindo(null)}
        />
      )}
    </>
  );
}

const entrada =
  "min-h-12 w-full border border-onix/20 bg-transparent px-4 text-[16px] focus:border-ouro-escuro focus:outline-none";

function Formulario({
  item,
  ehColecao,
  singular,
  pendente,
  aoSalvar,
  aoFechar,
}: {
  item: Item | null;
  ehColecao: boolean;
  singular: string;
  pendente: boolean;
  aoSalvar: (dados: Record<string, unknown>) => void;
  aoFechar: () => void;
}) {
  const colecao = item as Collection | null;
  const [d, setD] = useState({
    name: item?.name ?? "",
    description: item?.description ?? "",
    image: item?.image ?? "",
    bannerDesktop: colecao?.bannerDesktop ?? "",
    bannerMobile: colecao?.bannerMobile ?? "",
    position: String(item?.position ?? 0),
    active: item?.active ?? true,
  });

  return (
    <div className="fixed inset-0 z-[70] flex flex-col bg-marfim md:items-center md:justify-center md:bg-onix/70 md:p-8">
      <div className="tone-light flex h-full w-full flex-col border border-onix/15 bg-marfim md:h-auto md:max-h-full md:max-w-xl">
        <div className="flex items-center justify-between border-b border-onix/12 px-5 py-4">
          <h2 className="font-display text-xl">
            {item ? `Editar ${singular.toLowerCase()}` : `Nova ${singular.toLowerCase()}`}
          </h2>
          <button
            type="button"
            onClick={aoFechar}
            aria-label="Fechar"
            className="tap grid size-11 place-items-center"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-6">
          <label className="block">
            <span className="mb-2 block font-sans text-[11px] tracking-[0.14em] text-cinza-2 uppercase">
              Nome *
            </span>
            <input
              value={d.name}
              onChange={(e) => setD({ ...d, name: e.target.value })}
              className={entrada}
              maxLength={80}
            />
            {item && (
              <span className="mt-1 block text-xs text-cinza-2">
                O endereço continua <code>/{item.slug}</code> mesmo se você mudar o
                nome — trocar o endereço quebraria links já divulgados.
              </span>
            )}
          </label>

          <label className="block">
            <span className="mb-2 block font-sans text-[11px] tracking-[0.14em] text-cinza-2 uppercase">
              Descrição
            </span>
            <input
              value={d.description}
              onChange={(e) => setD({ ...d, description: e.target.value })}
              className={entrada}
              maxLength={240}
            />
          </label>

          <label className="block">
            <span className="mb-2 block font-sans text-[11px] tracking-[0.14em] text-cinza-2 uppercase">
              Endereço da imagem de capa
            </span>
            <input
              value={d.image}
              onChange={(e) => setD({ ...d, image: e.target.value })}
              placeholder="https://..."
              className={entrada}
              maxLength={500}
            />
          </label>

          {ehColecao && (
            <>
              <label className="block">
                <span className="mb-2 block font-sans text-[11px] tracking-[0.14em] text-cinza-2 uppercase">
                  Banner (desktop)
                </span>
                <input
                  value={d.bannerDesktop}
                  onChange={(e) => setD({ ...d, bannerDesktop: e.target.value })}
                  placeholder="https://..."
                  className={entrada}
                  maxLength={500}
                />
              </label>
              <label className="block">
                <span className="mb-2 block font-sans text-[11px] tracking-[0.14em] text-cinza-2 uppercase">
                  Banner (celular)
                </span>
                <input
                  value={d.bannerMobile}
                  onChange={(e) => setD({ ...d, bannerMobile: e.target.value })}
                  placeholder="https://..."
                  className={entrada}
                  maxLength={500}
                />
              </label>
            </>
          )}

          <label className="block">
            <span className="mb-2 block font-sans text-[11px] tracking-[0.14em] text-cinza-2 uppercase">
              Ordem
            </span>
            <input
              value={d.position}
              onChange={(e) => setD({ ...d, position: e.target.value.replace(/\D/g, "") })}
              inputMode="numeric"
              className={entrada}
            />
          </label>

          <label className="flex min-h-11 items-center gap-3">
            <input
              type="checkbox"
              checked={d.active}
              onChange={(e) => setD({ ...d, active: e.target.checked })}
              className="size-4 accent-[#8F6C22]"
            />
            <span className="text-sm">Visível no site</span>
          </label>
        </div>

        <div className="flex justify-end gap-3 border-t border-onix/12 px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <button type="button" onClick={aoFechar} className="tap min-h-12 px-5 text-sm text-cinza-2">
            Cancelar
          </button>
          <button
            type="button"
            disabled={pendente}
            onClick={() =>
              aoSalvar({
                id: item?.id,
                name: d.name,
                description: d.description,
                image: d.image,
                bannerDesktop: d.bannerDesktop,
                bannerMobile: d.bannerMobile,
                position: Number(d.position) || 0,
                active: d.active,
              })
            }
            className="tap min-h-12 border border-onix bg-onix px-7 font-sans text-[11px] tracking-[0.14em] text-marfim uppercase disabled:opacity-50"
          >
            {pendente ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}
