"use client";

import { useState, useTransition } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import type { Banner } from "@/types";
import { DataTable, Etiqueta, PageHeader } from "./AdminUI";
import { ConfirmDialog } from "./ConfirmDialog";
import { toast } from "@/components/ui/Toaster";
import { excluirBanner, salvarBanner } from "@/app/admin/conteudo-actions";

const entrada =
  "min-h-12 w-full border border-onix/20 bg-transparent px-4 text-[16px] focus:border-ouro-escuro focus:outline-none";

export function BannersBoard({ banners }: { banners: Banner[] }) {
  const [editando, setEditando] = useState<Banner | null | undefined>(undefined);
  const [excluindo, setExcluindo] = useState<Banner | null>(null);
  const [pendente, iniciar] = useTransition();

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
        titulo="Banners"
        descricao="A primeira dobra da home. Sem nenhum banner ativo, o hero padrão assume."
        acao={
          <button
            type="button"
            onClick={() => setEditando(null)}
            className="tap inline-flex min-h-12 items-center gap-2 border border-onix bg-onix px-6 font-sans text-[11px] tracking-[0.14em] text-marfim uppercase"
          >
            <Plus className="size-4" aria-hidden />
            Novo banner
          </button>
        }
      />

      <DataTable
        itens={banners}
        chave={(b) => b.id}
        vazio={
          <p className="border border-dashed border-onix/20 p-10 text-center text-sm text-cinza-2">
            Nenhum banner cadastrado. A home está usando o hero padrão.
          </p>
        }
        colunas={[
          {
            titulo: "Arte",
            render: (b) => (
              <div className="flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={b.imageDesktop} alt="" className="h-12 w-20 object-cover" />
                {b.imageMobile ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={b.imageMobile} alt="" className="h-12 w-9 object-cover" />
                ) : (
                  <span className="grid h-12 w-9 place-items-center border border-dashed border-alerta/40 text-[8px] text-alerta">
                    sem
                  </span>
                )}
              </div>
            ),
          },
          {
            titulo: "Título",
            render: (b) => (
              <div>
                <p className="font-medium">{b.title || "(sem título)"}</p>
                {b.subtitle && <p className="text-xs text-cinza-2">{b.subtitle}</p>}
              </div>
            ),
          },
          { titulo: "Ordem", render: (b) => b.position },
          {
            titulo: "Situação",
            render: (b) =>
              b.active ? <Etiqueta tom="ativo">No ar</Etiqueta> : <Etiqueta>Pausado</Etiqueta>,
          },
          {
            titulo: "Ações",
            className: "text-right",
            render: (b) => (
              <div className="flex justify-end gap-1">
                <button
                  type="button"
                  onClick={() => setEditando(b)}
                  aria-label="Editar banner"
                  className="tap grid size-11 place-items-center border border-onix/15 hover:border-ouro-escuro"
                >
                  <Pencil className="size-4" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => setExcluindo(b)}
                  aria-label="Excluir banner"
                  className="tap grid size-11 place-items-center border border-alerta/30 text-alerta"
                >
                  <Trash2 className="size-4" aria-hidden />
                </button>
              </div>
            ),
          },
        ]}
        cartao={(b) => (
          <div className="space-y-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={b.imageDesktop} alt="" className="h-28 w-full object-cover" />
            <div className="flex items-center justify-between gap-3">
              <p className="font-medium">{b.title || "(sem título)"}</p>
              {b.active ? <Etiqueta tom="ativo">No ar</Etiqueta> : <Etiqueta>Pausado</Etiqueta>}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setEditando(b)}
                className="tap min-h-11 flex-1 border border-onix/20 text-sm"
              >
                Editar
              </button>
              <button
                type="button"
                onClick={() => setExcluindo(b)}
                className="tap min-h-11 border border-alerta/30 px-4 text-sm text-alerta"
              >
                Excluir
              </button>
            </div>
          </div>
        )}
      />

      {editando !== undefined && (
        <FormularioBanner
          banner={editando}
          pendente={pendente}
          aoSalvar={(dados) => executa(() => salvarBanner(dados))}
          aoFechar={() => setEditando(undefined)}
        />
      )}

      {excluindo && (
        <ConfirmDialog
          titulo="Excluir este banner?"
          descricao="A arte sai da home imediatamente. Se você só quer pausar, desmarque “no ar” em vez de excluir."
          rotuloConfirmar="Excluir"
          perigo
          ocupado={pendente}
          aoConfirmar={() => executa(() => excluirBanner(excluindo.id))}
          aoFechar={() => setExcluindo(null)}
        />
      )}
    </>
  );
}

function FormularioBanner({
  banner,
  pendente,
  aoSalvar,
  aoFechar,
}: {
  banner: Banner | null;
  pendente: boolean;
  aoSalvar: (dados: Record<string, unknown>) => void;
  aoFechar: () => void;
}) {
  const [d, setD] = useState({
    title: banner?.title ?? "",
    subtitle: banner?.subtitle ?? "",
    imageDesktop: banner?.imageDesktop ?? "",
    imageMobile: banner?.imageMobile ?? "",
    ctaLabel: banner?.ctaLabel ?? "",
    link: banner?.link ?? "",
    align: banner?.align ?? "left",
    overlay: String(banner?.overlay ?? 40),
    position: String(banner?.position ?? 0),
    active: banner?.active ?? false,
    startsAt: banner?.startsAt?.slice(0, 10) ?? "",
    endsAt: banner?.endsAt?.slice(0, 10) ?? "",
  });

  return (
    <div className="fixed inset-0 z-[70] flex flex-col bg-marfim md:items-center md:justify-center md:bg-onix/70 md:p-8">
      <div className="tone-light flex h-full w-full flex-col border border-onix/15 bg-marfim md:h-auto md:max-h-full md:max-w-2xl">
        <div className="flex items-center justify-between border-b border-onix/12 px-5 py-4">
          <h2 className="font-display text-xl">{banner ? "Editar banner" : "Novo banner"}</h2>
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
          <p className="border-l-2 border-ouro-escuro pl-4 text-sm leading-relaxed text-cinza-2">
            São duas artes diferentes, não a mesma cortada: a foto panorâmica do
            desktop fica ilegível num celular. Proporção sugerida: 3:4 no
            desktop, 4:5 no celular.
          </p>

          <Campo rotulo="Arte de desktop *">
            <input
              value={d.imageDesktop}
              onChange={(e) => setD({ ...d, imageDesktop: e.target.value })}
              placeholder="https://..."
              className={entrada}
            />
          </Campo>

          <Campo rotulo="Arte de celular">
            <input
              value={d.imageMobile}
              onChange={(e) => setD({ ...d, imageMobile: e.target.value })}
              placeholder="https://..."
              className={entrada}
            />
          </Campo>

          {(d.imageDesktop || d.imageMobile) && (
            <div className="flex gap-4">
              {d.imageDesktop && (
                <figure>
                  <figcaption className="mb-1 text-xs text-cinza-2">Desktop</figcaption>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={d.imageDesktop} alt="" className="h-32 w-52 object-cover" />
                </figure>
              )}
              {d.imageMobile && (
                <figure>
                  <figcaption className="mb-1 text-xs text-cinza-2">Celular</figcaption>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={d.imageMobile} alt="" className="h-32 w-24 object-cover" />
                </figure>
              )}
            </div>
          )}

          <Campo rotulo="Título">
            <input
              value={d.title}
              onChange={(e) => setD({ ...d, title: e.target.value })}
              className={entrada}
              maxLength={120}
            />
          </Campo>

          <Campo rotulo="Subtítulo">
            <input
              value={d.subtitle}
              onChange={(e) => setD({ ...d, subtitle: e.target.value })}
              className={entrada}
              maxLength={240}
            />
          </Campo>

          <div className="grid gap-5 sm:grid-cols-2">
            <Campo rotulo="Texto do botão">
              <input
                value={d.ctaLabel}
                onChange={(e) => setD({ ...d, ctaLabel: e.target.value })}
                className={entrada}
                maxLength={40}
              />
            </Campo>
            <Campo rotulo="Link do botão">
              <input
                value={d.link}
                onChange={(e) => setD({ ...d, link: e.target.value })}
                placeholder="/catalogo/aliancas"
                className={entrada}
                maxLength={300}
              />
            </Campo>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            <Campo rotulo="Alinhamento">
              <select
                value={d.align}
                onChange={(e) => setD({ ...d, align: e.target.value as Banner["align"] })}
                className={entrada}
              >
                <option value="left">Esquerda</option>
                <option value="center">Centro</option>
                <option value="right">Direita</option>
              </select>
            </Campo>
            <Campo rotulo="Véu escuro (%)">
              <input
                value={d.overlay}
                onChange={(e) => setD({ ...d, overlay: e.target.value.replace(/\D/g, "") })}
                inputMode="numeric"
                className={entrada}
              />
            </Campo>
            <Campo rotulo="Ordem">
              <input
                value={d.position}
                onChange={(e) => setD({ ...d, position: e.target.value.replace(/\D/g, "") })}
                inputMode="numeric"
                className={entrada}
              />
            </Campo>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Campo rotulo="Começa em (opcional)">
              <input
                type="date"
                value={d.startsAt}
                onChange={(e) => setD({ ...d, startsAt: e.target.value })}
                className={entrada}
              />
            </Campo>
            <Campo rotulo="Termina em (opcional)">
              <input
                type="date"
                value={d.endsAt}
                onChange={(e) => setD({ ...d, endsAt: e.target.value })}
                className={entrada}
              />
            </Campo>
          </div>

          <label className="flex min-h-11 items-center gap-3">
            <input
              type="checkbox"
              checked={d.active}
              onChange={(e) => setD({ ...d, active: e.target.checked })}
              className="size-4 accent-[#8F6C22]"
            />
            <span className="text-sm">No ar</span>
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
                id: banner?.id,
                title: d.title,
                subtitle: d.subtitle,
                imageDesktop: d.imageDesktop,
                imageMobile: d.imageMobile,
                ctaLabel: d.ctaLabel,
                link: d.link,
                align: d.align,
                overlay: Number(d.overlay) || 0,
                position: Number(d.position) || 0,
                active: d.active,
                startsAt: d.startsAt || null,
                endsAt: d.endsAt || null,
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

function Campo({ rotulo, children }: { rotulo: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block font-sans text-[11px] tracking-[0.14em] text-cinza-2 uppercase">
        {rotulo}
      </span>
      {children}
    </label>
  );
}
