"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { Copy, Pencil, Plus, Trash2, Archive, Eye, EyeOff, RotateCcw } from "lucide-react";
import { LIMIAR_ESTOQUE_BAIXO } from "@/config/catalogo";
import { precoTexto } from "@/lib/format";
import { AVAILABILITY_LABEL, deriveAvailability, isLowStock } from "@/types";
import type { Category, Collection, Product } from "@/types";
import { DataTable, Etiqueta, PageHeader } from "./AdminUI";
import { ProductForm } from "./ProductForm";
import { ConfirmDialog } from "./ConfirmDialog";
import { toast } from "@/components/ui/Toaster";
import {
  alternarAtivo,
  arquivarProduto,
  duplicarProduto,
  excluirProduto,
  restaurarProduto,
} from "@/app/admin/produtos/actions";

type Filtro = "todos" | "ativos" | "ocultos" | "estoque-baixo" | "sem-foto" | "arquivados";

const FILTROS: { id: Filtro; rotulo: string }[] = [
  { id: "todos", rotulo: "Todos" },
  { id: "ativos", rotulo: "Publicados" },
  { id: "ocultos", rotulo: "Ocultos" },
  { id: "estoque-baixo", rotulo: "Estoque baixo" },
  { id: "sem-foto", rotulo: "Sem foto" },
  { id: "arquivados", rotulo: "Arquivados" },
];

export function ProductsBoard({
  produtos,
  categorias,
  colecoes,
  filtroInicial = "todos",
}: {
  produtos: Product[];
  categorias: Category[];
  colecoes: Collection[];
  filtroInicial?: Filtro;
}) {
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<Filtro>(filtroInicial);
  const [editando, setEditando] = useState<Product | null | undefined>(undefined);
  const [confirmando, setConfirmando] = useState<
    | { tipo: "excluir" | "arquivar"; produto: Product }
    | null
  >(null);
  const [pendente, iniciar] = useTransition();

  const visiveis = useMemo(() => {
    const termo = busca
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();

    return produtos.filter((p) => {
      // Arquivados só aparecem no filtro dedicado — e ficam fora de todas as
      // outras contagens, senão o painel mente sobre o tamanho do catálogo.
      const arquivado = Boolean(p.archivedAt);
      if (filtro === "arquivados") {
        if (!arquivado) return false;
      } else if (arquivado) {
        return false;
      }

      if (filtro === "ativos" && !p.active) return false;
      if (filtro === "ocultos" && p.active) return false;
      if (filtro === "estoque-baixo" && !isLowStock(p, LIMIAR_ESTOQUE_BAIXO)) return false;
      if (filtro === "sem-foto" && p.images.length > 0) return false;

      if (termo) {
        const feno = `${p.name} ${p.code} ${p.categoryName ?? ""}`
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "");
        if (!feno.includes(termo)) return false;
      }
      return true;
    });
  }, [produtos, busca, filtro]);

  function executa(acao: () => Promise<{ ok: boolean; error?: string; warnings?: string[] }>) {
    iniciar(async () => {
      const r = await acao();
      if (!r.ok) {
        toast(r.error ?? "Não foi possível concluir.", "erro");
        return;
      }
      (r.warnings ?? []).forEach((a) => toast(a));
      if (!r.warnings?.length) toast("Pronto");
      setConfirmando(null);
    });
  }

  return (
    <>
      <PageHeader
        titulo="Produtos"
        descricao="Cadastre, publique e organize as peças da vitrine."
        acao={
          <button
            type="button"
            onClick={() => setEditando(null)}
            className="tap inline-flex min-h-12 items-center gap-2 border border-onix bg-onix px-6 font-sans text-[11px] tracking-[0.14em] text-marfim uppercase"
          >
            <Plus className="size-4" aria-hidden />
            Nova peça
          </button>
        }
      />

      <div className="mb-6 flex flex-col gap-4">
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por nome, código ou categoria"
          aria-label="Buscar peças"
          className="min-h-12 w-full border border-onix/20 bg-transparent px-4 text-[16px] focus:border-ouro-escuro focus:outline-none"
        />

        <ul className="no-scrollbar flex gap-2 overflow-x-auto">
          {FILTROS.map((f) => (
            <li key={f.id}>
              <button
                type="button"
                onClick={() => setFiltro(f.id)}
                aria-pressed={filtro === f.id}
                className={`tap min-h-11 border px-4 text-sm whitespace-nowrap ${
                  filtro === f.id
                    ? "border-onix bg-onix text-marfim"
                    : "border-onix/20 hover:border-ouro-escuro"
                }`}
              >
                {f.rotulo}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <p className="mb-4 text-sm text-cinza-2">
        {visiveis.length} {visiveis.length === 1 ? "peça" : "peças"}
      </p>

      <DataTable
        itens={visiveis}
        chave={(p) => p.id}
        vazio={
          <p className="border border-dashed border-onix/20 p-10 text-center text-sm text-cinza-2">
            Nenhuma peça com esse recorte.
          </p>
        }
        colunas={[
          {
            titulo: "Peça",
            render: (p) => (
              <div className="flex items-center gap-3">
                {p.images[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.images[0].url} alt="" className="size-12 shrink-0 object-cover" />
                ) : (
                  <span className="grid size-12 shrink-0 place-items-center border border-dashed border-onix/25 text-[9px] text-cinza-2">
                    sem foto
                  </span>
                )}
                <div className="min-w-0">
                  <p className="truncate font-medium">{p.name}</p>
                  <p className="text-xs text-cinza-2">{p.code}</p>
                </div>
              </div>
            ),
          },
          {
            titulo: "Categoria",
            render: (p) => <span className="text-cinza-2">{p.categoryName ?? "—"}</span>,
          },
          { titulo: "Preço", render: (p) => precoTexto(p) },
          {
            titulo: "Disponibilidade",
            render: (p) => (
              <Etiqueta
                tom={
                  deriveAvailability(p) === "pronta-entrega"
                    ? "ativo"
                    : deriveAvailability(p) === "sob-encomenda"
                      ? "ouro"
                      : "neutro"
                }
              >
                {AVAILABILITY_LABEL[deriveAvailability(p)]}
              </Etiqueta>
            ),
          },
          {
            titulo: "Situação",
            render: (p) =>
              p.archivedAt ? (
                <Etiqueta tom="alerta">Arquivada</Etiqueta>
              ) : p.active ? (
                <Etiqueta tom="ativo">Publicada</Etiqueta>
              ) : (
                <Etiqueta>Oculta</Etiqueta>
              ),
          },
          {
            titulo: "Ações",
            className: "w-px text-right whitespace-nowrap",
            render: (p) => <Acoes produto={p} />,
          },
        ]}
        cartao={(p) => (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              {p.images[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.images[0].url} alt="" className="size-16 shrink-0 object-cover" />
              ) : (
                <span className="grid size-16 shrink-0 place-items-center border border-dashed border-onix/25 text-[9px] text-cinza-2">
                  sem foto
                </span>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{p.name}</p>
                <p className="text-xs text-cinza-2">
                  {p.code} · {precoTexto(p)}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {p.archivedAt ? (
                <Etiqueta tom="alerta">Arquivada</Etiqueta>
              ) : p.active ? (
                <Etiqueta tom="ativo">Publicada</Etiqueta>
              ) : (
                <Etiqueta>Oculta</Etiqueta>
              )}
              <Etiqueta tom="neutro">{AVAILABILITY_LABEL[deriveAvailability(p)]}</Etiqueta>
            </div>
            <Acoes produto={p} />
          </div>
        )}
      />

      {editando !== undefined && (
        <ProductForm
          produto={editando}
          categorias={categorias}
          colecoes={colecoes}
          aoFechar={() => setEditando(undefined)}
        />
      )}

      {confirmando && (
        <ConfirmDialog
          titulo={
            confirmando.tipo === "excluir"
              ? "Excluir esta peça definitivamente?"
              : "Arquivar esta peça?"
          }
          descricao={
            confirmando.tipo === "excluir"
              ? `“${confirmando.produto.name}” e todas as suas fotos serão apagadas para sempre. Prefira arquivar: a peça sai da vitrine mas continua aqui.`
              : `“${confirmando.produto.name}” sai da vitrine e das contagens, mas continua no painel e pode voltar quando você quiser.`
          }
          rotuloConfirmar={confirmando.tipo === "excluir" ? "Excluir para sempre" : "Arquivar"}
          perigo={confirmando.tipo === "excluir"}
          ocupado={pendente}
          aoConfirmar={() =>
            executa(() =>
              confirmando.tipo === "excluir"
                ? excluirProduto(confirmando.produto.id)
                : arquivarProduto(confirmando.produto.id)
            )
          }
          aoFechar={() => setConfirmando(null)}
        />
      )}
    </>
  );

  function Acoes({ produto }: { produto: Product }) {
    return (
      // No cartão do celular as ações podem quebrar em duas linhas; na tabela,
      // não: a tabela já rola na horizontal, e uma linha de ações com altura
      // diferente das outras desalinha a grade inteira.
      <div className="flex flex-wrap items-center justify-end gap-1 md:flex-nowrap">
        {!produto.archivedAt && (
          <>
            <BotaoIcone
              rotulo="Editar"
              onClick={() => setEditando(produto)}
              icone={<Pencil className="size-4" />}
            />
            <BotaoIcone
              rotulo={produto.active ? "Ocultar da vitrine" : "Publicar na vitrine"}
              onClick={() => executa(() => alternarAtivo(produto.id, !produto.active))}
              icone={produto.active ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            />
            <BotaoIcone
              rotulo="Duplicar"
              onClick={() => executa(() => duplicarProduto(produto.id))}
              icone={<Copy className="size-4" />}
            />
            <BotaoIcone
              rotulo="Arquivar"
              onClick={() => setConfirmando({ tipo: "arquivar", produto })}
              icone={<Archive className="size-4" />}
            />
          </>
        )}

        {produto.archivedAt && (
          <BotaoIcone
            rotulo="Restaurar"
            onClick={() => executa(() => restaurarProduto(produto.id))}
            icone={<RotateCcw className="size-4" />}
          />
        )}

        <BotaoIcone
          rotulo="Excluir"
          perigo
          onClick={() => setConfirmando({ tipo: "excluir", produto })}
          icone={<Trash2 className="size-4" />}
        />

        {!produto.archivedAt && produto.active && (
          <Link
            href={`/produto/${produto.slug}`}
            target="_blank"
            className="tap ml-1 text-xs text-cinza-2 underline-offset-4 hover:text-ouro-escuro hover:underline"
          >
            ver
          </Link>
        )}
      </div>
    );
  }
}

function BotaoIcone({
  rotulo,
  icone,
  onClick,
  perigo,
}: {
  rotulo: string;
  icone: React.ReactNode;
  onClick: () => void;
  perigo?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={rotulo}
      aria-label={rotulo}
      className={`tap grid size-11 place-items-center border ${
        perigo
          ? "border-alerta/30 text-alerta hover:border-alerta"
          : "border-onix/15 hover:border-ouro-escuro"
      }`}
    >
      {icone}
    </button>
  );
}
