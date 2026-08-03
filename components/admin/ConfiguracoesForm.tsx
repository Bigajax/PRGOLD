"use client";

import { useState, useTransition } from "react";
import type { SiteSettings } from "@/types";
import { PageHeader } from "./AdminUI";
import { toast } from "@/components/ui/Toaster";
import { salvarConfiguracoes } from "@/app/admin/conteudo-actions";
import { trocarSenha } from "@/app/admin/actions";

const entrada =
  "min-h-12 w-full border border-onix/20 bg-transparent px-4 text-[16px] focus:border-ouro-escuro focus:outline-none";

type Campo = {
  chave: keyof SiteSettings;
  banco: string;
  rotulo: string;
  dica?: string;
  longo?: boolean;
};

const GRUPOS: { titulo: string; descricao?: string; campos: Campo[] }[] = [
  {
    titulo: "Atendimento",
    descricao:
      "O WhatsApp é o campo mais crítico do site. Um dígito errado desvia todos os clientes sem que ninguém perceba.",
    campos: [
      {
        chave: "whatsapp",
        banco: "whatsapp",
        rotulo: "WhatsApp",
        dica: "Pode digitar com máscara: salvamos como DDI + DDD + número.",
      },
      {
        chave: "whatsappDefaultMessage",
        banco: "whatsapp_default_message",
        rotulo: "Mensagem padrão",
        longo: true,
      },
      { chave: "instagramHandle", banco: "instagram_handle", rotulo: "Instagram (sem @)" },
      { chave: "instagramUrl", banco: "instagram_url", rotulo: "Endereço do Instagram" },
      { chave: "email", banco: "email", rotulo: "E-mail" },
    ],
  },
  {
    titulo: "Onde e quando",
    descricao: "Campo vazio simplesmente não aparece no site — nada é inventado.",
    campos: [
      { chave: "address", banco: "address", rotulo: "Endereço" },
      { chave: "city", banco: "city", rotulo: "Cidade" },
      { chave: "businessHours", banco: "business_hours", rotulo: "Horário de atendimento" },
    ],
  },
  {
    titulo: "Textos do site",
    campos: [
      { chave: "topBarText", banco: "top_bar_text", rotulo: "Barra do topo" },
      { chave: "topBarCtaLabel", banco: "top_bar_cta_label", rotulo: "Link da barra do topo" },
      { chave: "aboutTitle", banco: "about_title", rotulo: "Título da seção Sobre" },
      { chave: "aboutText", banco: "about_text", rotulo: "Texto da seção Sobre", longo: true },
      { chave: "footerTagline", banco: "footer_tagline", rotulo: "Frase do rodapé", longo: true },
    ],
  },
  {
    titulo: "Dados legais e buscadores",
    campos: [
      { chave: "legalName", banco: "legal_name", rotulo: "Razão social" },
      { chave: "legalDocument", banco: "legal_document", rotulo: "CNPJ" },
      { chave: "seoTitle", banco: "seo_title", rotulo: "Título para buscadores" },
      {
        chave: "seoDescription",
        banco: "seo_description",
        rotulo: "Descrição para buscadores",
        longo: true,
      },
    ],
  },
];

export function ConfiguracoesForm({ settings }: { settings: SiteSettings }) {
  const [d, setD] = useState<Record<string, string>>(() => {
    const inicial: Record<string, string> = {};
    GRUPOS.flatMap((g) => g.campos).forEach((c) => {
      inicial[c.banco] = String(settings[c.chave] ?? "");
    });
    return inicial;
  });
  const [pendente, iniciar] = useTransition();

  function salvar() {
    iniciar(async () => {
      const r = await salvarConfiguracoes(d);
      toast(r.ok ? "Configurações salvas" : r.error, r.ok ? "sucesso" : "erro");
    });
  }

  const numeroLimpo = (d.whatsapp || "").replace(/\D/g, "");
  const previa = numeroLimpo
    ? `https://wa.me/${numeroLimpo.length === 10 || numeroLimpo.length === 11 ? `55${numeroLimpo}` : numeroLimpo}`
    : null;

  return (
    <>
      <PageHeader
        titulo="Configurações"
        descricao="Os dados da loja que aparecem no site inteiro. Salvar aqui atualiza tudo de uma vez."
      />

      <div className="max-w-2xl space-y-10">
        {GRUPOS.map((g) => (
          <section key={g.titulo}>
            <h2 className="font-display text-xl">{g.titulo}</h2>
            {g.descricao && (
              <p className="mt-2 mb-5 text-sm leading-relaxed text-cinza-2">{g.descricao}</p>
            )}
            <div className={g.descricao ? "space-y-5" : "mt-5 space-y-5"}>
              {g.campos.map((c) => (
                <label key={c.banco} className="block">
                  <span className="mb-2 block font-sans text-[11px] tracking-[0.14em] text-cinza-2 uppercase">
                    {c.rotulo}
                  </span>
                  {c.longo ? (
                    <textarea
                      value={d[c.banco] ?? ""}
                      onChange={(e) => setD({ ...d, [c.banco]: e.target.value })}
                      rows={3}
                      maxLength={800}
                      className={entrada}
                    />
                  ) : (
                    <input
                      value={d[c.banco] ?? ""}
                      onChange={(e) => setD({ ...d, [c.banco]: e.target.value })}
                      maxLength={300}
                      className={entrada}
                    />
                  )}
                  {c.dica && <span className="mt-1 block text-xs text-cinza-2">{c.dica}</span>}

                  {/* Prévia do link: é a forma de conferir o número ANTES de
                      publicar, sem depender de alguém lembrar de testar. */}
                  {c.banco === "whatsapp" && previa && (
                    <a
                      href={previa}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-block text-xs text-ouro-escuro underline underline-offset-4"
                    >
                      Testar: {previa}
                    </a>
                  )}
                </label>
              ))}
            </div>
          </section>
        ))}

        <div className="sticky bottom-0 border-t border-onix/12 bg-marfim py-4">
          <button
            type="button"
            onClick={salvar}
            disabled={pendente}
            className="tap min-h-12 border border-onix bg-onix px-7 font-sans text-[11px] tracking-[0.14em] text-marfim uppercase disabled:opacity-50"
          >
            {pendente ? "Salvando..." : "Salvar configurações"}
          </button>
        </div>

        <TrocarSenha />
      </div>
    </>
  );
}

function TrocarSenha() {
  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [pendente, iniciar] = useTransition();

  return (
    <section className="border border-onix/12 p-5">
      <h2 className="font-display text-xl">Trocar a senha do painel</h2>
      <p className="mt-2 mb-5 text-sm leading-relaxed text-cinza-2">
        Use pelo menos 10 caracteres. Não existe recuperação por e-mail: se a
        senha se perder, é preciso falar com o responsável técnico.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block font-sans text-[11px] tracking-[0.14em] text-cinza-2 uppercase">
            Nova senha
          </span>
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            autoComplete="new-password"
            className={entrada}
          />
        </label>
        <label className="block">
          <span className="mb-2 block font-sans text-[11px] tracking-[0.14em] text-cinza-2 uppercase">
            Repita a nova senha
          </span>
          <input
            type="password"
            value={confirmacao}
            onChange={(e) => setConfirmacao(e.target.value)}
            autoComplete="new-password"
            className={entrada}
          />
        </label>
      </div>

      <button
        type="button"
        disabled={pendente || !senha}
        onClick={() =>
          iniciar(async () => {
            const r = await trocarSenha({ senha, confirmacao });
            if (r.ok) {
              (r.warnings ?? ["Senha alterada"]).forEach((a) => toast(a));
              setSenha("");
              setConfirmacao("");
            } else {
              toast(r.error, "erro");
            }
          })
        }
        className="tap mt-5 min-h-12 border border-onix/25 px-6 font-sans text-[11px] tracking-[0.14em] uppercase disabled:opacity-50"
      >
        {pendente ? "Trocando..." : "Trocar senha"}
      </button>
    </section>
  );
}
