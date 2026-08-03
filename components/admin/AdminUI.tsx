"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Menu, TriangleAlert, X } from "lucide-react";
import { menuAdmin } from "@/config/nav";
import { Logo } from "@/components/layout/Logo";

/**
 * Chrome do painel.
 *
 * Sidebar no desktop, gaveta no mobile. O lojista opera do celular com muito
 * mais frequência do que se imagina — é por isso que o hambúrguer tem 44px e
 * toda tabela deste painel vira cartão abaixo de `md`.
 */
export function AdminShell({
  email,
  demoMode,
  children,
  aoSair,
}: {
  email: string;
  demoMode: boolean;
  children: ReactNode;
  /** Server Action de logout, passada do layout. */
  aoSair: () => void | Promise<void>;
}) {
  const [aberto, setAberto] = useState(false);
  const pathname = usePathname();

  const nav = (
    <nav aria-label="Painel">
      <ul className="space-y-1">
        {menuAdmin.map((item) => {
          const ativo =
            item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={() => setAberto(false)}
                aria-current={ativo ? "page" : undefined}
                className={`tap flex min-h-11 items-center border-l-2 px-4 text-sm ${
                  ativo
                    ? "border-ouro bg-grafite text-ouro"
                    : "border-transparent text-cinza hover:border-ouro/40 hover:text-marfim"
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );

  return (
    <div className="min-h-screen bg-marfim">
      {/* Topo */}
      <header className="sticky top-0 z-40 border-b border-ouro/20 bg-onix">
        <div className="flex h-16 items-center gap-3 px-4">
          <button
            type="button"
            onClick={() => setAberto(true)}
            aria-label="Abrir menu do painel"
            className="tap grid size-11 place-items-center text-marfim lg:hidden"
          >
            <Menu className="size-5" aria-hidden />
          </button>

          <Logo tone="dark" tamanho="sm" />
          <span className="hidden font-sans text-[10px] tracking-[0.2em] text-cinza uppercase sm:inline">
            Painel
          </span>

          <div className="ml-auto flex items-center gap-3">
            <span className="hidden max-w-[16rem] truncate text-xs text-cinza sm:inline">
              {email}
            </span>
            <button
              type="button"
              onClick={() => void aoSair()}
              className="tap inline-flex min-h-11 items-center gap-2 border border-ouro/40 px-4 font-sans text-[11px] tracking-[0.12em] text-marfim uppercase hover:border-ouro hover:text-ouro"
            >
              <LogOut className="size-4" aria-hidden />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </header>

      <div className="lg:flex">
        <aside className="hidden w-60 shrink-0 border-r border-onix/10 bg-onix py-6 lg:block lg:min-h-[calc(100vh-4rem)]">
          {nav}
        </aside>

        {aberto && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              aria-label="Fechar menu"
              onClick={() => setAberto(false)}
              className="absolute inset-0 bg-onix/70"
            />
            <div className="absolute inset-y-0 left-0 flex w-[86%] max-w-xs flex-col bg-onix py-4">
              <div className="mb-4 flex items-center justify-between px-4">
                <Logo tone="dark" tamanho="sm" />
                <button
                  type="button"
                  onClick={() => setAberto(false)}
                  aria-label="Fechar menu"
                  className="tap grid size-11 place-items-center text-marfim"
                >
                  <X className="size-5" aria-hidden />
                </button>
              </div>
              {nav}
            </div>
          </div>
        )}

        <main className="tone-light min-w-0 flex-1 px-4 py-8 md:px-8">
          {demoMode && <AvisoDemo />}
          {children}
        </main>
      </div>
    </div>
  );
}

/**
 * Faixa de modo demonstração.
 *
 * Existe para que ninguém confunda o catálogo de demonstração com o catálogo
 * real. É também um item do checklist de publicação: se esta faixa aparece em
 * produção, o site não deveria estar no ar.
 */
export function AvisoDemo() {
  return (
    <div
      role="status"
      className="mb-8 flex items-start gap-3 border-l-2 border-alerta bg-marfim-2 p-4"
    >
      <TriangleAlert className="mt-0.5 size-5 shrink-0 text-alerta" aria-hidden />
      <div className="text-sm leading-relaxed">
        <p className="font-medium">Modo demonstração</p>
        <p className="mt-1 text-cinza-2">
          O banco de dados ainda não está configurado. A vitrine está sendo servida
          por um catálogo de demonstração e nada salvo aqui será gravado. Siga o
          passo a passo em <code className="text-onix">supabase/README.md</code> para
          conectar o projeto.
        </p>
      </div>
    </div>
  );
}

/* ── Peças reutilizadas nas telas do painel ─────────────────────────────── */

export function PageHeader({
  titulo,
  descricao,
  acao,
}: {
  titulo: string;
  descricao?: string;
  acao?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 border-b border-onix/12 pb-6 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 className="font-display text-3xl">{titulo}</h1>
        {descricao && <p className="mt-2 text-sm text-cinza-2">{descricao}</p>}
      </div>
      {acao && <div className="shrink-0">{acao}</div>}
    </div>
  );
}

export function StatCard({
  rotulo,
  valor,
  href,
  destaque,
}: {
  rotulo: string;
  valor: number | string;
  href?: string;
  destaque?: boolean;
}) {
  const conteudo = (
    <>
      <p className="font-sans text-[11px] tracking-[0.14em] text-cinza-2 uppercase">
        {rotulo}
      </p>
      <p
        className={`mt-3 font-display text-4xl ${destaque ? "text-ouro-escuro" : "text-onix"}`}
      >
        {valor}
      </p>
    </>
  );

  if (href) {
    return (
      <Link href={href} className="tap block p-5 hover:bg-marfim-2">
        {conteudo}
      </Link>
    );
  }
  return <div className="p-5">{conteudo}</div>;
}

/**
 * Tabela que vira cartões abaixo de `md`.
 *
 * Não é enfeite: uma tabela espremida em 375px é inutilizável, e o celular é
 * onde o lojista realmente abre o painel.
 */
export function DataTable<T>({
  itens,
  colunas,
  chave,
  cartao,
  vazio,
}: {
  itens: T[];
  colunas: { titulo: string; render: (item: T) => ReactNode; className?: string }[];
  chave: (item: T) => string;
  cartao: (item: T) => ReactNode;
  vazio: ReactNode;
}) {
  if (itens.length === 0) return <>{vazio}</>;

  return (
    <>
      <div className="hidden overflow-x-auto border border-onix/12 md:block">
        <table className="w-full min-w-[48rem] text-left text-sm">
          <thead className="border-b border-onix/12 bg-marfim-2">
            <tr>
              {colunas.map((c) => (
                <th
                  key={c.titulo}
                  className={`px-4 py-3 font-sans text-[11px] tracking-[0.12em] text-cinza-2 uppercase ${c.className ?? ""}`}
                >
                  {c.titulo}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-onix/10">
            {itens.map((item) => (
              <tr key={chave(item)} className="align-middle">
                {colunas.map((c) => (
                  <td key={c.titulo} className={`px-4 py-3 ${c.className ?? ""}`}>
                    {c.render(item)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="space-y-3 md:hidden">
        {itens.map((item) => (
          <li key={chave(item)} className="border border-onix/12 p-4">
            {cartao(item)}
          </li>
        ))}
      </ul>
    </>
  );
}

export function Etiqueta({
  children,
  tom = "neutro",
}: {
  children: ReactNode;
  tom?: "neutro" | "ativo" | "alerta" | "ouro";
}) {
  const cores = {
    neutro: "border-onix/25 text-cinza-2",
    ativo: "border-sucesso text-sucesso",
    alerta: "border-alerta text-alerta",
    ouro: "border-ouro-escuro text-ouro-escuro",
  }[tom];

  return (
    <span
      className={`inline-flex min-h-6 items-center border px-2 font-sans text-[10px] tracking-[0.12em] uppercase ${cores}`}
    >
      {children}
    </span>
  );
}
