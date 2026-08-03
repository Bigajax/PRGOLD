"use client";

import { useMemo, useState, useTransition } from "react";
import { ChevronDown, ChevronUp, Trash2, Upload, X } from "lucide-react";
import { MAX_FOTOS } from "@/config/catalogo";
import { codigoSugerido } from "@/lib/slug";
import { brl } from "@/lib/format";
import type { Category, Collection, Product } from "@/types";
import { toast } from "@/components/ui/Toaster";
import { enviarFoto, salvarProduto } from "@/app/admin/produtos/actions";

/**
 * Formulário de peça.
 *
 * Quatro abas, montadas o tempo todo com `hidden` — desmontar apagaria o que
 * já foi digitado nas outras. Os erros são agrupados por aba, com contagem no
 * rótulo, e salvar salta para a primeira aba com problema: sem isso, o botão
 * "salvar" parece não fazer nada quando o erro está numa aba fechada.
 */

type Aba = "peca" | "fotos" | "ficha" | "exibicao";

const ABAS: { id: Aba; rotulo: string }[] = [
  { id: "peca", rotulo: "Peça" },
  { id: "fotos", rotulo: "Fotos" },
  { id: "ficha", rotulo: "Ficha técnica" },
  { id: "exibicao", rotulo: "Exibição" },
];

type Estado = {
  name: string;
  code: string;
  shortDescription: string;
  fullDescription: string;
  categoryId: string;
  collectionId: string;
  gender: string;
  material: string;
  goldType: string;
  karat: string;
  weightG: string;
  dimensions: string;
  stones: string;
  price: number | null;
  promoPrice: number | null;
  priceOnRequest: boolean;
  stockQuantity: string;
  lowStockThreshold: string;
  readyToShip: boolean;
  madeToOrder: boolean;
  featured: boolean;
  newArrival: boolean;
  exclusive: boolean;
  active: boolean;
  position: string;
  seoTitle: string;
  seoDescription: string;
  images: { url: string; alt: string }[];
};

function doProduto(p?: Product | null, categorias: Category[] = [], colecoes: Collection[] = []): Estado {
  return {
    name: p?.name ?? "",
    code: p?.code ?? "",
    shortDescription: p?.shortDescription ?? "",
    fullDescription: p?.fullDescription ?? "",
    categoryId: categorias.find((c) => c.slug === p?.categorySlug)?.id ?? "",
    collectionId: colecoes.find((c) => c.slug === p?.collectionSlug)?.id ?? "",
    gender: p?.gender ?? "",
    material: p?.material ?? "",
    goldType: p?.goldType ?? "",
    karat: p?.karat != null ? String(p.karat) : "",
    weightG: p?.weightG != null ? String(p.weightG) : "",
    dimensions: p?.dimensions ?? "",
    stones: p?.stones ?? "",
    price: p?.price ?? null,
    promoPrice: p?.promoPrice ?? null,
    priceOnRequest: p?.priceOnRequest ?? true,
    stockQuantity: p?.stockQuantity != null ? String(p.stockQuantity) : "",
    lowStockThreshold: p?.lowStockThreshold != null ? String(p.lowStockThreshold) : "",
    readyToShip: p?.readyToShip ?? false,
    madeToOrder: p?.madeToOrder ?? false,
    featured: p?.featured ?? false,
    newArrival: p?.newArrival ?? false,
    exclusive: p?.exclusive ?? false,
    active: p?.active ?? false,
    position: p?.position != null ? String(p.position) : "0",
    seoTitle: p?.seoTitle ?? "",
    seoDescription: p?.seoDescription ?? "",
    images: (p?.images ?? []).map((i) => ({ url: i.url, alt: i.alt ?? "" })),
  };
}

export function ProductForm({
  produto,
  categorias,
  colecoes,
  aoFechar,
}: {
  produto?: Product | null;
  categorias: Category[];
  colecoes: Collection[];
  aoFechar: () => void;
}) {
  const [aba, setAba] = useState<Aba>("peca");
  const [d, setD] = useState<Estado>(() => doProduto(produto, categorias, colecoes));
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, iniciar] = useTransition();
  const [subindo, setSubindo] = useState(false);

  const set = <K extends keyof Estado>(campo: K, valor: Estado[K]) => {
    setD((atual) => ({ ...atual, [campo]: valor }));
    setErro(null);
  };

  /** Erros por aba, para o rótulo mostrar a contagem. */
  const errosPorAba = useMemo(() => {
    const e: Record<Aba, string[]> = { peca: [], fotos: [], ficha: [], exibicao: [] };
    if (d.name.trim().length < 3) e.peca.push("Nome com pelo menos 3 caracteres.");
    if (d.code.trim().length < 2) e.peca.push("Informe um código.");
    if (!d.priceOnRequest && d.price === null)
      e.peca.push("Informe o preço ou marque “valor sob consulta”.");
    if (d.promoPrice !== null && d.price !== null && d.promoPrice >= d.price)
      e.peca.push("O preço promocional precisa ser menor que o cheio.");
    if (d.images.length > MAX_FOTOS) e.fotos.push(`No máximo ${MAX_FOTOS} fotos.`);
    return e;
  }, [d]);

  const totalErros = Object.values(errosPorAba).flat().length;

  function salvar() {
    if (totalErros > 0) {
      const primeira = ABAS.find((a) => errosPorAba[a.id].length > 0);
      if (primeira) setAba(primeira.id);
      setErro(errosPorAba[primeira?.id ?? "peca"][0] ?? "Confira os campos.");
      return;
    }

    iniciar(async () => {
      const numero = (v: string) => {
        const n = Number(v.replace(",", "."));
        return v.trim() && Number.isFinite(n) ? n : null;
      };

      const r = await salvarProduto({
        id: produto?.id,
        name: d.name,
        code: d.code,
        shortDescription: d.shortDescription,
        fullDescription: d.fullDescription,
        categoryId: d.categoryId,
        collectionId: d.collectionId,
        gender: d.gender,
        material: d.material,
        goldType: d.goldType,
        karat: numero(d.karat),
        weightG: numero(d.weightG),
        dimensions: d.dimensions,
        stones: d.stones,
        price: d.priceOnRequest ? null : d.price,
        promoPrice: d.priceOnRequest ? null : d.promoPrice,
        priceOnRequest: d.priceOnRequest,
        stockQuantity: numero(d.stockQuantity),
        lowStockThreshold: numero(d.lowStockThreshold),
        readyToShip: d.readyToShip,
        madeToOrder: d.madeToOrder,
        featured: d.featured,
        newArrival: d.newArrival,
        exclusive: d.exclusive,
        active: d.active,
        position: numero(d.position),
        seoTitle: d.seoTitle,
        seoDescription: d.seoDescription,
        images: d.images.map((i) => ({ url: i.url, alt: i.alt })),
      });

      if (!r.ok) {
        setErro(r.error);
        return;
      }
      toast(produto ? "Peça atualizada" : "Peça criada");
      aoFechar();
    });
  }

  async function subir(arquivo: File) {
    if (d.images.length >= MAX_FOTOS) {
      toast(`No máximo ${MAX_FOTOS} fotos por peça.`, "erro");
      return;
    }
    setSubindo(true);
    const fd = new FormData();
    fd.append("arquivo", arquivo);
    fd.append("slug", d.name || "peca");
    const r = await enviarFoto(fd);
    setSubindo(false);
    if (r.ok) {
      set("images", [...d.images, { url: r.url, alt: "" }]);
      toast("Foto adicionada");
    } else {
      toast(r.error, "erro");
    }
  }

  function moverFoto(i: number, direcao: -1 | 1) {
    const alvo = i + direcao;
    if (alvo < 0 || alvo >= d.images.length) return;
    const copia = [...d.images];
    [copia[i], copia[alvo]] = [copia[alvo], copia[i]];
    set("images", copia);
  }

  return (
    <div className="fixed inset-0 z-[70] flex flex-col bg-marfim md:items-center md:justify-center md:bg-onix/70 md:p-8">
      <div className="tone-light flex h-full w-full flex-col border border-onix/15 bg-marfim md:h-auto md:max-h-full md:max-w-3xl">
        {/* Cabeçalho fixo */}
        <div className="flex items-center justify-between gap-4 border-b border-onix/12 px-5 py-4">
          <h2 className="font-display text-xl">
            {produto ? "Editar peça" : "Nova peça"}
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

        {/* Abas */}
        <div className="no-scrollbar flex overflow-x-auto border-b border-onix/12">
          {ABAS.map((a) => {
            const n = errosPorAba[a.id].length;
            const ativo = aba === a.id;
            return (
              <button
                key={a.id}
                type="button"
                onClick={() => setAba(a.id)}
                aria-current={ativo ? "true" : undefined}
                className={`tap flex min-h-12 shrink-0 items-center gap-2 border-b-2 px-4 font-sans text-[11px] tracking-[0.12em] uppercase ${
                  ativo
                    ? "border-ouro-escuro text-ouro-escuro"
                    : "border-transparent text-cinza-2"
                }`}
              >
                {a.rotulo}
                {n > 0 && (
                  <span className="grid size-4 place-items-center bg-alerta text-[9px] font-semibold text-marfim">
                    {n}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Corpo rolável */}
        <div className="flex-1 overflow-y-auto px-5 py-6">
          <div hidden={aba !== "peca"} className="space-y-5">
            <Campo rotulo="Nome da peça" obrigatorio>
              <input
                value={d.name}
                onChange={(e) => set("name", e.target.value)}
                onBlur={() => {
                  if (!d.code && d.name) set("code", codigoSugerido(d.name));
                }}
                className={entrada}
                maxLength={120}
              />
            </Campo>

            <Campo
              rotulo="Código"
              obrigatorio
              dica="Sugerido automaticamente. Use o seu próprio se a loja já tiver numeração."
            >
              <input
                value={d.code}
                onChange={(e) => set("code", e.target.value)}
                className={entrada}
                maxLength={40}
              />
            </Campo>

            <div className="grid gap-5 sm:grid-cols-2">
              <Campo rotulo="Categoria">
                <select
                  value={d.categoryId}
                  onChange={(e) => set("categoryId", e.target.value)}
                  className={entrada}
                >
                  <option value="">Sem categoria</option>
                  {categorias.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Campo>

              <Campo rotulo="Coleção">
                <select
                  value={d.collectionId}
                  onChange={(e) => set("collectionId", e.target.value)}
                  className={entrada}
                >
                  <option value="">Sem coleção</option>
                  {colecoes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Campo>
            </div>

            <Campo rotulo="Para quem">
              <select
                value={d.gender}
                onChange={(e) => set("gender", e.target.value)}
                className={entrada}
              >
                <option value="">Não informar</option>
                <option value="feminino">Feminino</option>
                <option value="masculino">Masculino</option>
                <option value="unissex">Unissex</option>
              </select>
            </Campo>

            <Campo rotulo="Descrição curta" dica="Uma frase. Aparece na página da peça.">
              <input
                value={d.shortDescription}
                onChange={(e) => set("shortDescription", e.target.value)}
                className={entrada}
                maxLength={240}
              />
            </Campo>

            <Campo rotulo="Descrição completa">
              <textarea
                value={d.fullDescription}
                onChange={(e) => set("fullDescription", e.target.value)}
                rows={4}
                className={entrada}
                maxLength={2000}
              />
            </Campo>

            <fieldset className="border border-onix/12 p-4">
              <legend className="px-2 font-sans text-[11px] tracking-[0.14em] text-cinza-2 uppercase">
                Preço
              </legend>

              <Checkbox
                marcado={d.priceOnRequest}
                onChange={(v) => set("priceOnRequest", v)}
                rotulo="Valor sob consulta"
                dica="A vitrine mostra “Valor sob consulta” e o preço não aparece."
              />

              {!d.priceOnRequest && (
                <div className="mt-4 grid gap-5 sm:grid-cols-2">
                  <Campo rotulo="Preço">
                    <MoneyInput valor={d.price} onChange={(v) => set("price", v)} />
                  </Campo>
                  <Campo rotulo="Preço promocional" dica="Precisa ser menor que o preço cheio.">
                    <MoneyInput valor={d.promoPrice} onChange={(v) => set("promoPrice", v)} />
                  </Campo>
                </div>
              )}
            </fieldset>

            <fieldset className="border border-onix/12 p-4">
              <legend className="px-2 font-sans text-[11px] tracking-[0.14em] text-cinza-2 uppercase">
                Disponibilidade
              </legend>
              <p className="mb-4 text-xs leading-relaxed text-cinza-2">
                O selo da vitrine é calculado sozinho: com estoque maior que zero
                vira “Pronta entrega”; sem estoque mas aceitando encomenda, vira
                “Sob encomenda”; sem nenhum dos dois, “Consulte disponibilidade”.
                Não existe campo de status.
              </p>

              <div className="grid gap-5 sm:grid-cols-2">
                <Campo rotulo="Quantidade em estoque" dica="Deixe vazio se não controla estoque.">
                  <input
                    value={d.stockQuantity}
                    onChange={(e) => set("stockQuantity", e.target.value.replace(/\D/g, ""))}
                    inputMode="numeric"
                    className={entrada}
                  />
                </Campo>
                <Campo rotulo="Avisar quando restar" dica="Padrão: 2 unidades.">
                  <input
                    value={d.lowStockThreshold}
                    onChange={(e) => set("lowStockThreshold", e.target.value.replace(/\D/g, ""))}
                    inputMode="numeric"
                    className={entrada}
                  />
                </Campo>
              </div>

              <div className="mt-4 space-y-3">
                <Checkbox
                  marcado={d.readyToShip}
                  onChange={(v) => set("readyToShip", v)}
                  rotulo="Tenho esta peça em mãos"
                  dica="Use quando a peça existe mas você não controla a quantidade."
                />
                <Checkbox
                  marcado={d.madeToOrder}
                  onChange={(v) => set("madeToOrder", v)}
                  rotulo="Aceita encomenda"
                  dica="Se o estoque zerar, a peça continua vendável como encomenda."
                />
              </div>
            </fieldset>
          </div>

          <div hidden={aba !== "fotos"} className="space-y-5">
            <p className="text-sm text-cinza-2">
              A primeira foto é a capa: ela aparece no catálogo e no
              compartilhamento. Até {MAX_FOTOS} fotos, de 8 MB cada.
            </p>

            <div className="flex flex-wrap gap-3">
              <label className="tap inline-flex min-h-12 cursor-pointer items-center gap-3 border border-onix/25 px-5 text-sm hover:border-ouro-escuro">
                <Upload className="size-4" aria-hidden />
                {subindo ? "Enviando..." : "Enviar foto"}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  className="sr-only"
                  disabled={subindo}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void subir(f);
                    e.target.value = "";
                  }}
                />
              </label>

              <button
                type="button"
                onClick={() => {
                  const url = window.prompt("Cole o endereço da imagem (https://...)");
                  if (!url) return;
                  if (!/^https?:\/\//i.test(url)) {
                    toast("O endereço precisa começar com https://", "erro");
                    return;
                  }
                  set("images", [...d.images, { url, alt: "" }]);
                }}
                className="tap inline-flex min-h-12 items-center border border-onix/25 px-5 text-sm hover:border-ouro-escuro"
              >
                Colar endereço
              </button>
            </div>

            {d.images.length === 0 ? (
              <p className="border border-dashed border-onix/20 p-8 text-center text-sm text-cinza-2">
                Nenhuma foto ainda. Uma peça sem foto não deveria ir ao ar.
              </p>
            ) : (
              <ul className="space-y-3">
                {d.images.map((img, i) => (
                  <li key={`${img.url}-${i}`} className="flex gap-3 border border-onix/12 p-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.url}
                      alt=""
                      className="size-20 shrink-0 object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      {i === 0 && (
                        <span className="inline-flex border border-ouro-escuro px-2 py-0.5 font-sans text-[10px] tracking-widest text-ouro-escuro uppercase">
                          Capa
                        </span>
                      )}
                      <input
                        value={img.alt}
                        onChange={(e) => {
                          const copia = [...d.images];
                          copia[i] = { ...copia[i], alt: e.target.value };
                          set("images", copia);
                        }}
                        placeholder="Descreva a foto (acessibilidade)"
                        maxLength={160}
                        className="mt-2 min-h-11 w-full border border-onix/20 bg-transparent px-3 text-sm"
                      />
                    </div>
                    <div className="flex shrink-0 flex-col gap-1">
                      <button
                        type="button"
                        onClick={() => moverFoto(i, -1)}
                        disabled={i === 0}
                        aria-label="Mover para cima"
                        className="tap grid size-9 place-items-center border border-onix/20 disabled:opacity-30"
                      >
                        <ChevronUp className="size-4" aria-hidden />
                      </button>
                      <button
                        type="button"
                        onClick={() => moverFoto(i, 1)}
                        disabled={i === d.images.length - 1}
                        aria-label="Mover para baixo"
                        className="tap grid size-9 place-items-center border border-onix/20 disabled:opacity-30"
                      >
                        <ChevronDown className="size-4" aria-hidden />
                      </button>
                      <button
                        type="button"
                        onClick={() => set("images", d.images.filter((_, k) => k !== i))}
                        aria-label="Remover foto"
                        className="tap grid size-9 place-items-center border border-alerta/40 text-alerta"
                      >
                        <Trash2 className="size-4" aria-hidden />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div hidden={aba !== "ficha"} className="space-y-5">
            <p className="text-sm text-cinza-2">
              Preencha só o que você sabe. Campo vazio simplesmente não aparece
              na página — a ficha nunca mostra um traço no lugar do dado.
            </p>

            <div className="grid gap-5 sm:grid-cols-2">
              <Campo rotulo="Material">
                <input
                  value={d.material}
                  onChange={(e) => set("material", e.target.value)}
                  placeholder="Ouro 18K"
                  className={entrada}
                  maxLength={80}
                />
              </Campo>
              <Campo rotulo="Tipo de ouro">
                <select
                  value={d.goldType}
                  onChange={(e) => set("goldType", e.target.value)}
                  className={entrada}
                >
                  <option value="">Não informar</option>
                  <option value="amarelo">Ouro amarelo</option>
                  <option value="branco">Ouro branco</option>
                  <option value="rose">Ouro rosé</option>
                </select>
              </Campo>
              <Campo rotulo="Quilates">
                <input
                  value={d.karat}
                  onChange={(e) => set("karat", e.target.value.replace(/\D/g, ""))}
                  inputMode="numeric"
                  placeholder="18"
                  className={entrada}
                />
              </Campo>
              <Campo rotulo="Peso (gramas)">
                <input
                  value={d.weightG}
                  onChange={(e) => set("weightG", e.target.value.replace(/[^\d.,]/g, ""))}
                  inputMode="decimal"
                  className={entrada}
                />
              </Campo>
            </div>

            <Campo rotulo="Dimensões" dica="Ex.: 60 cm de comprimento, 6 mm de largura.">
              <input
                value={d.dimensions}
                onChange={(e) => set("dimensions", e.target.value)}
                className={entrada}
                maxLength={120}
              />
            </Campo>

            <Campo rotulo="Pedras">
              <input
                value={d.stones}
                onChange={(e) => set("stones", e.target.value)}
                className={entrada}
                maxLength={120}
              />
            </Campo>
          </div>

          <div hidden={aba !== "exibicao"} className="space-y-5">
            <Checkbox
              marcado={d.active}
              onChange={(v) => set("active", v)}
              rotulo="Publicada na vitrine"
              dica="Desmarque para tirar do ar sem apagar nada."
            />
            <Checkbox
              marcado={d.featured}
              onChange={(v) => set("featured", v)}
              rotulo="Em destaque na página inicial"
              dica="Se tudo é destaque, nada é."
            />
            <Checkbox
              marcado={d.newArrival}
              onChange={(v) => set("newArrival", v)}
              rotulo="Novidade"
            />
            <Checkbox
              marcado={d.exclusive}
              onChange={(v) => set("exclusive", v)}
              rotulo="Peça exclusiva"
              dica="Só um selo aparece por card. Exclusivo tem prioridade sobre novidade."
            />

            <Campo rotulo="Ordem" dica="Menor primeiro, dentro dos destaques.">
              <input
                value={d.position}
                onChange={(e) => set("position", e.target.value.replace(/\D/g, ""))}
                inputMode="numeric"
                className={entrada}
              />
            </Campo>

            <Campo rotulo="Título para buscadores" dica="Deixe vazio para usar o nome da peça.">
              <input
                value={d.seoTitle}
                onChange={(e) => set("seoTitle", e.target.value)}
                className={entrada}
                maxLength={70}
              />
            </Campo>

            <Campo rotulo="Descrição para buscadores">
              <textarea
                value={d.seoDescription}
                onChange={(e) => set("seoDescription", e.target.value)}
                rows={3}
                className={entrada}
                maxLength={180}
              />
            </Campo>
          </div>
        </div>

        {/* Rodapé fixo: salvar sempre visível, inclusive no celular. */}
        <div className="border-t border-onix/12 px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          {erro && (
            <p role="alert" className="mb-3 border-l-2 border-alerta pl-3 text-sm text-alerta">
              {erro}
            </p>
          )}
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={aoFechar}
              className="tap min-h-12 px-5 text-sm text-cinza-2"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={salvar}
              disabled={salvando}
              className="tap min-h-12 border border-onix bg-onix px-7 font-sans text-[11px] tracking-[0.14em] text-marfim uppercase disabled:opacity-50"
            >
              {salvando ? "Salvando..." : "Salvar peça"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const entrada =
  "min-h-12 w-full border border-onix/20 bg-transparent px-4 text-[16px] focus:border-ouro-escuro focus:outline-none";

function Campo({
  rotulo,
  dica,
  obrigatorio,
  children,
}: {
  rotulo: string;
  dica?: string;
  obrigatorio?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block font-sans text-[11px] tracking-[0.14em] text-cinza-2 uppercase">
        {rotulo}
        {obrigatorio && <span className="text-alerta"> *</span>}
      </span>
      {children}
      {dica && <span className="mt-1 block text-xs text-cinza-2">{dica}</span>}
    </label>
  );
}

function Checkbox({
  marcado,
  onChange,
  rotulo,
  dica,
}: {
  marcado: boolean;
  onChange: (v: boolean) => void;
  rotulo: string;
  dica?: string;
}) {
  return (
    <label className="flex min-h-11 items-start gap-3">
      <input
        type="checkbox"
        checked={marcado}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 size-4 shrink-0 accent-[#8F6C22]"
      />
      <span>
        <span className="block text-sm">{rotulo}</span>
        {dica && <span className="mt-0.5 block text-xs text-cinza-2">{dica}</span>}
      </span>
    </label>
  );
}

/**
 * Entrada de dinheiro por centavos.
 *
 * A pessoa digita "18990" e vê "R$ 189,90". Devolve `number | null`, nunca
 * string — é o que elimina a família inteira de bugs de vírgula, ponto e
 * parse que aparece quando o preço trafega como texto.
 */
function MoneyInput({
  valor,
  onChange,
}: {
  valor: number | null;
  onChange: (v: number | null) => void;
}) {
  return (
    <input
      inputMode="numeric"
      value={valor === null ? "" : brl(valor)}
      onChange={(e) => {
        const digitos = e.target.value.replace(/\D/g, "");
        onChange(digitos ? Number(digitos) / 100 : null);
      }}
      placeholder="R$ 0,00"
      className={entrada}
    />
  );
}
