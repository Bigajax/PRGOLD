"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { ArrowLeft, ArrowRight, CircleCheck, ImagePlus, X } from "lucide-react";
import { textos } from "@/config/textos";
import {
  ESTILOS,
  OPCOES_PEDRAS,
  TIPOS_DE_OURO,
  TIPOS_DE_PECA,
  etapa1Schema,
  etapa2Schema,
  etapa3Schema,
  etapa5Schema,
} from "@/lib/validation/pedido-personalizado";
import { mensagemPersonalizada, waLink } from "@/lib/whatsapp";
import { useSettings } from "@/components/providers/SiteProvider";
import { Button, ButtonExterno } from "@/components/ui/Button";
import { IconeWhatsApp } from "@/components/ui/Icones";
import { toast } from "@/components/ui/Toaster";
import { enviarImagemReferencia, salvarPedidoPersonalizado } from "./actions";

type Estado = {
  pieceType: string;
  style: string;
  goldType: string;
  stones: string;
  engraving: string;
  finish: string;
  size: string;
  notes: string;
  referenceImage: string;
  name: string;
  whatsapp: string;
  city: string;
  email: string;
  message: string;
};

const VAZIO: Estado = {
  pieceType: "",
  style: "",
  goldType: "",
  stones: "",
  engraving: "",
  finish: "",
  size: "",
  notes: "",
  referenceImage: "",
  name: "",
  whatsapp: "",
  city: "",
  email: "",
  message: "",
};

/**
 * Rótulo curto e rótulo longo.
 *
 * O trilho de progresso mostra o CURTO: "Material e detalhes" quebrava em duas
 * linhas e desalinhava a fileira inteira, e um rótulo de progresso existe para
 * ser lido de relance, não para descrever a etapa. O longo é o que aparece no
 * resumo e nas mensagens.
 */
const ETAPAS = [
  { curto: "Peça", longo: "Tipo de peça" },
  { curto: "Estilo", longo: "Estilo" },
  { curto: "Detalhes", longo: "Material e detalhes" },
  { curto: "Referência", longo: "Referência" },
  { curto: "Contato", longo: "Contato" },
] as const;

/**
 * Formulário em cinco etapas.
 *
 * Cada etapa valida antes de avançar, com o MESMO schema que o servidor usa —
 * a validação do cliente é conveniência, a do servidor é a que vale.
 *
 * Ao concluir: grava a solicitação, mostra o resumo e só então oferece o
 * botão do WhatsApp. O link nunca abre sozinho.
 */
export function MontarPecaForm({
  /**
   * Dentro do modal a altura é emprestada da tela, não da página: as etapas
   * perdem a altura mínima fixa, para o painel não abrir com um vazio embaixo
   * na etapa que tem poucos campos.
   */
  compacto = false,
}: {
  compacto?: boolean;
} = {}) {
  const settings = useSettings();
  const [etapa, setEtapa] = useState(0);
  const [dados, setDados] = useState<Estado>(VAZIO);
  const [erro, setErro] = useState<string | null>(null);
  const [concluido, setConcluido] = useState(false);
  const [avisos, setAvisos] = useState<string[]>([]);
  const [enviando, iniciarEnvio] = useTransition();
  const [subindo, setSubindo] = useState(false);
  /**
   * Miniatura da referência.
   *
   * Vem de `URL.createObjectURL` no próprio arquivo escolhido, e não da URL
   * devolvida pelo Storage: aparece no instante do clique, não depende do
   * upload ter terminado e não exige liberar domínio remoto de imagem.
   */
  const [anexo, setAnexo] = useState<{ url: string; nome: string } | null>(null);

  const set = (campo: keyof Estado, valor: string) => {
    setDados((d) => ({ ...d, [campo]: valor }));
    setErro(null);
  };

  /* Ao trocar de etapa, o formulário volta ao próprio topo. Sem isto, quem
     avança a partir do fim de uma etapa longa (a de detalhes, no celular) cai
     no MEIO da etapa seguinte e precisa rolar para cima para entender onde
     está. Vale para o modal (rola o painel) e para a página (rola a janela). */
  const topoRef = useRef<HTMLDivElement>(null);
  const primeiraRenderizacao = useRef(true);

  useEffect(() => {
    if (primeiraRenderizacao.current) {
      primeiraRenderizacao.current = false;
      return;
    }
    const suave = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    topoRef.current?.scrollIntoView({
      behavior: suave ? "smooth" : "auto",
      block: "start",
    });
  }, [etapa]);

  function validaEtapa(n: number): boolean {
    const checa = (r: { success: boolean; error?: { issues: { message: string }[] } }) => {
      if (r.success) return true;
      setErro(r.error?.issues[0]?.message ?? "Confira os campos.");
      return false;
    };

    if (n === 0) return checa(etapa1Schema.safeParse({ pieceType: dados.pieceType }));
    if (n === 1) return checa(etapa2Schema.safeParse({ style: dados.style }));
    if (n === 2)
      return checa(
        etapa3Schema.safeParse({
          goldType: dados.goldType || undefined,
          stones: dados.stones || undefined,
          engraving: dados.engraving || undefined,
          finish: dados.finish || undefined,
          size: dados.size || undefined,
          notes: dados.notes || undefined,
        })
      );
    if (n === 4)
      return checa(
        etapa5Schema.safeParse({
          name: dados.name,
          whatsapp: dados.whatsapp,
          city: dados.city || undefined,
          email: dados.email || undefined,
          message: dados.message || undefined,
        })
      );
    return true;
  }

  function avancar() {
    if (!validaEtapa(etapa)) return;
    setEtapa((e) => Math.min(e + 1, ETAPAS.length - 1));
  }

  function voltar() {
    setErro(null);
    setEtapa((e) => Math.max(e - 1, 0));
  }

  function finalizar() {
    if (!validaEtapa(4)) return;

    iniciarEnvio(async () => {
      const resultado = await salvarPedidoPersonalizado({
        pieceType: dados.pieceType,
        style: dados.style,
        goldType: dados.goldType || undefined,
        stones: dados.stones || undefined,
        engraving: dados.engraving || undefined,
        finish: dados.finish || undefined,
        size: dados.size || undefined,
        notes: dados.notes || undefined,
        referenceImage: dados.referenceImage || undefined,
        name: dados.name,
        whatsapp: dados.whatsapp,
        city: dados.city || undefined,
        email: dados.email || undefined,
        message: dados.message || undefined,
        origin: "monte-sua-peca",
      });

      if (!resultado.ok) {
        setErro(resultado.error);
        return;
      }
      setAvisos(resultado.warnings ?? []);
      setConcluido(true);
    });
  }

  async function subirImagem(arquivo: File) {
    setAnexo((anterior) => {
      if (anterior) URL.revokeObjectURL(anterior.url);
      return { url: URL.createObjectURL(arquivo), nome: arquivo.name };
    });

    setSubindo(true);
    const fd = new FormData();
    fd.append("arquivo", arquivo);
    const r = await enviarImagemReferencia(fd);
    setSubindo(false);

    if (r.ok) {
      set("referenceImage", r.url);
      toast("Imagem anexada");
    } else {
      // A miniatura fica: a pessoa escolheu o arquivo certo, o que falhou foi o
      // envio. Quem trata isso é o aviso embaixo da miniatura, que oferece o
      // plano B em vez de apagar o trabalho dela.
      set("referenceImage", "");
      toast(r.error, "erro");
    }
  }

  function removerAnexo() {
    if (anexo) URL.revokeObjectURL(anexo.url);
    setAnexo(null);
    set("referenceImage", "");
  }

  const mensagem = mensagemPersonalizada({
    pieceType: dados.pieceType,
    style: dados.style || null,
    goldType: (dados.goldType || null) as "amarelo" | "branco" | "rose" | null,
    stones: dados.stones || null,
    engraving: dados.engraving || null,
    size: dados.size || null,
    notes: dados.notes || null,
    name: dados.name,
    city: dados.city || null,
  });

  if (concluido) {
    const resumo = [
      ["Tipo de peça", dados.pieceType],
      ["Estilo", dados.style],
      ["Tipo de ouro", TIPOS_DE_OURO.find((o) => o.value === dados.goldType)?.label],
      ["Pedras", dados.stones],
      ["Gravação", dados.engraving],
      ["Acabamento", dados.finish],
      ["Tamanho", dados.size],
      ["Observações", dados.notes],
    ].filter(([, v]) => Boolean(v)) as [string, string][];

    return (
      <div className="rounded-[var(--radius-xl)] border border-onix/10 bg-onix/[0.02] p-6 md:p-10">
        <CircleCheck className="size-8 text-ouro-escuro" aria-hidden />
        <h2 className="mt-4 font-display text-2xl">Solicitação registrada</h2>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-cinza-2">
          {textos.monteSuaPeca.avisoFinal}
        </p>

        {avisos.map((a) => (
          <p key={a} className="mt-3 border-l-2 border-ouro-escuro pl-3 text-xs text-cinza-2">
            {a}
          </p>
        ))}

        <dl className="mt-8 border-t border-onix/12">
          {resumo.map(([rotulo, valor]) => (
            <div
              key={rotulo}
              className="flex items-baseline justify-between gap-6 border-b border-onix/12 py-3"
            >
              <dt className="font-sans text-[11px] tracking-[0.14em] text-cinza-2 uppercase">
                {rotulo}
              </dt>
              <dd className="text-right text-sm">{valor}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-8">
          <ButtonExterno
            href={waLink(mensagem, settings)}
            variante="whatsapp"
            tamanho="lg"
          >
            <IconeWhatsApp className="size-5" />
            Continuar no WhatsApp
          </ButtonExterno>
        </div>
      </div>
    );
  }

  return (
    <div ref={topoRef} className="scroll-mt-24">
      {/* Progresso: fios que se acendem, na mesma gramática da vitrine. */}
      <ol className="flex items-center gap-2" aria-label="Etapas">
        {ETAPAS.map((nome, i) => (
          <li key={nome.longo} className="flex-1">
            <span
              className={`block h-[3px] rounded-full ${
                i <= etapa ? "bg-ouro-escuro" : "bg-onix/12"
              }`}
              aria-hidden
            />
            <span
              className={`mt-2 hidden truncate font-sans text-[10px] tracking-[0.12em] uppercase sm:block ${
                i === etapa ? "text-ouro-escuro" : "text-cinza-2"
              }`}
            >
              {nome.curto}
            </span>
            {i === etapa && <span className="sr-only">Etapa atual</span>}
          </li>
        ))}
      </ol>

      {/* No celular não cabe um rótulo sob cada fio — e "1 2 3 4 5" não diz
          onde a pessoa está. Uma linha só: a contagem e o nome da etapa. */}
      <p className="mt-2 flex items-baseline justify-between sm:hidden" aria-hidden>
        <span className="font-sans text-[10px] tracking-[0.12em] text-cinza-2 uppercase">
          Etapa {etapa + 1} de {ETAPAS.length}
        </span>
        <span className="font-sans text-[10px] tracking-[0.12em] text-ouro-escuro uppercase">
          {ETAPAS[etapa].curto}
        </span>
      </p>

      <div className={`mt-8 ${compacto ? "" : "min-h-[22rem]"}`}>
        {etapa === 0 && (
          <Grupo titulo="Que peça você imagina?">
            <Opcoes
              valores={[...TIPOS_DE_PECA]}
              selecionado={dados.pieceType}
              onSelect={(v) => set("pieceType", v)}
            />
          </Grupo>
        )}

        {etapa === 1 && (
          <Grupo titulo="Qual estilo combina com ela?">
            <Opcoes
              valores={[...ESTILOS]}
              selecionado={dados.style}
              onSelect={(v) => set("style", v)}
            />
          </Grupo>
        )}

        {etapa === 2 && (
          <Grupo titulo="Material e detalhes">
            <div className="space-y-6">
              <div>
                <Rotulo>Tipo de ouro</Rotulo>
                <Opcoes
                  valores={TIPOS_DE_OURO.map((o) => o.label)}
                  selecionado={TIPOS_DE_OURO.find((o) => o.value === dados.goldType)?.label ?? ""}
                  onSelect={(label) =>
                    set("goldType", TIPOS_DE_OURO.find((o) => o.label === label)?.value ?? "")
                  }
                />
              </div>

              <div>
                <Rotulo>Pedras</Rotulo>
                <Opcoes
                  valores={[...OPCOES_PEDRAS]}
                  selecionado={dados.stones}
                  onSelect={(v) => set("stones", v)}
                />
              </div>

              <Campo
                id="engraving"
                rotulo="Gravação (opcional)"
                valor={dados.engraving}
                onChange={(v) => set("engraving", v)}
                placeholder="Nome, data ou frase"
                maxLength={120}
              />
              <Campo
                id="finish"
                rotulo="Acabamento (opcional)"
                valor={dados.finish}
                onChange={(v) => set("finish", v)}
                placeholder="Polido, fosco, diamantado..."
                maxLength={60}
              />
              <Campo
                id="size"
                rotulo="Tamanho (opcional)"
                valor={dados.size}
                onChange={(v) => set("size", v)}
                placeholder="Aro 18, 60 cm, 5 mm..."
                maxLength={60}
              />
              <Campo
                id="notes"
                rotulo="Observações (opcional)"
                valor={dados.notes}
                onChange={(v) => set("notes", v)}
                placeholder="Conte o que essa peça precisa representar."
                maxLength={800}
                multilinha
              />
            </div>
          </Grupo>
        )}

        {etapa === 3 && (
          <Grupo titulo="Tem uma referência?">
            <p className="mb-5 max-w-xl text-sm leading-relaxed text-cinza-2">
              Se você viu uma peça parecida, anexe a foto. É opcional — também dá
              para mandar depois, na conversa.
            </p>

            {anexo ? (
              <div className="flex items-center gap-4 rounded-[var(--radius-lg)] border border-onix/10 bg-onix/[0.03] p-4">
                {/* eslint-disable-next-line @next/next/no-img-element -- blob local
                    do arquivo escolhido; next/image só serve URL conhecida. */}
                <img
                  src={anexo.url}
                  alt=""
                  className="size-20 shrink-0 rounded-[var(--radius-md)] object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{anexo.nome}</p>
                  <p className="mt-1 text-xs leading-relaxed text-cinza-2">
                    {subindo
                      ? "Enviando..."
                      : dados.referenceImage
                        ? "Anexada à solicitação."
                        : "Não conseguimos anexar agora. Você pode mandar esta foto na conversa do WhatsApp."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={removerAnexo}
                  aria-label="Remover imagem"
                  className="tap grid size-11 shrink-0 place-items-center rounded-full text-cinza-2 hover:bg-onix/[0.06] hover:text-onix"
                >
                  <X className="size-4" aria-hidden />
                </button>
              </div>
            ) : (
              <label className="tap flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[var(--radius-lg)] border border-dashed border-onix/20 bg-onix/[0.02] px-6 py-10 text-center hover:border-ouro-escuro/60 hover:bg-onix/[0.04]">
                <ImagePlus className="size-6 text-ouro-escuro" strokeWidth={1.5} aria-hidden />
                <span className="mt-1 text-sm font-medium">
                  {subindo ? "Enviando..." : "Escolher imagem"}
                </span>
                <span className="text-xs text-cinza-2">JPG, PNG ou WebP, até 8 MB</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  className="sr-only"
                  disabled={subindo}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void subirImagem(f);
                  }}
                />
              </label>
            )}
          </Grupo>
        )}

        {etapa === 4 && (
          <Grupo titulo="Como falamos com você?">
            <div className="space-y-6">
              <Campo
                id="name"
                rotulo="Nome"
                valor={dados.name}
                onChange={(v) => set("name", v)}
                obrigatorio
                maxLength={120}
                autoComplete="name"
              />
              <Campo
                id="whatsapp"
                rotulo="WhatsApp"
                valor={dados.whatsapp}
                onChange={(v) => set("whatsapp", v)}
                obrigatorio
                placeholder="(44) 90000-0000"
                inputMode="tel"
                autoComplete="tel"
                maxLength={20}
              />
              <Campo
                id="city"
                rotulo="Cidade (opcional)"
                valor={dados.city}
                onChange={(v) => set("city", v)}
                maxLength={120}
                autoComplete="address-level2"
              />
              <Campo
                id="email"
                rotulo="E-mail (opcional)"
                valor={dados.email}
                onChange={(v) => set("email", v)}
                inputMode="email"
                autoComplete="email"
                maxLength={160}
              />
              <Campo
                id="message"
                rotulo="Mensagem (opcional)"
                valor={dados.message}
                onChange={(v) => set("message", v)}
                multilinha
                maxLength={800}
              />
            </div>
          </Grupo>
        )}
      </div>

      {erro && (
        <p role="alert" className="mt-4 border-l-2 border-alerta pl-3 text-sm text-alerta">
          {erro}
        </p>
      )}

      {/* Em 320px os dois botões não cabem lado a lado; em vez de estourar a
          página para o lado, o botão principal desce e ocupa a linha inteira. */}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-onix/12 pt-6">
        <Button
          variante="texto"
          tone="light"
          onClick={voltar}
          disabled={etapa === 0 || enviando}
          className={etapa === 0 ? "invisible" : ""}
        >
          <ArrowLeft className="size-4" aria-hidden />
          Voltar
        </Button>

        {etapa < ETAPAS.length - 1 ? (
          <Button
            variante="primario"
            tone="light"
            tamanho="lg"
            onClick={avancar}
            className="w-full sm:w-auto"
          >
            Continuar
            <ArrowRight className="size-4" aria-hidden />
          </Button>
        ) : (
          <Button
            variante="primario"
            tone="light"
            tamanho="lg"
            onClick={finalizar}
            disabled={enviando}
            className="w-full sm:w-auto"
          >
            {enviando ? "Enviando..." : "Enviar solicitação"}
          </Button>
        )}
      </div>
    </div>
  );
}

/* ── Peças do formulário ────────────────────────────────────────────────── */

function Grupo({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-2xl">{titulo}</h2>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function Rotulo({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 font-sans text-[11px] tracking-[0.14em] text-cinza-2 uppercase">
      {children}
    </p>
  );
}

function Opcoes({
  valores,
  selecionado,
  onSelect,
}: {
  valores: string[];
  selecionado: string;
  onSelect: (v: string) => void;
}) {
  return (
    <ul className="flex flex-wrap gap-2">
      {valores.map((v) => {
        const ativo = selecionado === v;
        return (
          <li key={v}>
            <button
              type="button"
              onClick={() => onSelect(v)}
              aria-pressed={ativo}
              className={`tap inline-flex min-h-12 items-center rounded-full border px-5 text-sm ${
                ativo
                  ? "border-transparent bg-onix text-marfim shadow-[0_2px_10px_rgba(8,8,8,0.16)]"
                  : "border-onix/15 bg-onix/[0.03] hover:border-ouro-escuro/50 hover:bg-onix/[0.06]"
              }`}
            >
              {v}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function Campo({
  id,
  rotulo,
  valor,
  onChange,
  placeholder,
  obrigatorio,
  multilinha,
  maxLength,
  inputMode,
  autoComplete,
}: {
  id: string;
  rotulo: string;
  valor: string;
  onChange: (v: string) => void;
  placeholder?: string;
  obrigatorio?: boolean;
  multilinha?: boolean;
  maxLength?: number;
  inputMode?: "tel" | "email" | "numeric" | "text";
  autoComplete?: string;
}) {
  const classes =
    "min-h-12 w-full rounded-[var(--radius-md)] border border-onix/15 bg-onix/[0.02] px-4 py-3 text-[16px] focus:border-ouro-escuro focus:bg-transparent focus:outline-none";

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block font-sans text-[11px] tracking-[0.14em] text-cinza-2 uppercase"
      >
        {rotulo}
        {obrigatorio && <span className="text-alerta"> *</span>}
      </label>
      {multilinha ? (
        <textarea
          id={id}
          value={valor}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          rows={4}
          className={classes}
        />
      ) : (
        <input
          id={id}
          type="text"
          value={valor}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          inputMode={inputMode}
          autoComplete={autoComplete}
          required={obrigatorio}
          className={classes}
        />
      )}
    </div>
  );
}
