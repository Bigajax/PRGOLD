import type { Metadata } from "next";
import { supabaseServer } from "@/lib/supabase/server";
import { DEMO_MODE } from "@/services/supabase";
import { AdminShell } from "@/components/admin/AdminUI";
import { sair } from "./actions";

export const metadata: Metadata = {
  title: "Painel",
  // O painel fica fora do índice. A proteção real são as quatro camadas
  // (proxy, layout, action, RLS) — isto só evita que ele apareça no Google.
  robots: { index: false, follow: false },
};

// O painel mostra o estado real do banco, sempre. Cache aqui faria o lojista
// editar um produto e continuar vendo o valor antigo.
export const dynamic = "force-dynamic";

/** Lê a sessão sem deixar erro escapar. Falha de rede ou de configuração é
 *  tratada como "sem sessão" — nunca como 500. */
async function emailDaSessao(): Promise<string | null> {
  if (DEMO_MODE) return "modo demonstração";
  try {
    const db = await supabaseServer();
    const {
      data: { user },
    } = await db.auth.getUser();
    return user ? (user.email ?? "") : null;
  } catch {
    return null;
  }
}

/**
 * Segunda camada de defesa.
 *
 * O `proxy.ts` já barra quem não tem sessão, mas ele roda na borda do
 * roteamento e pode ser contornado por uma configuração errada. Aqui a sessão
 * é verificada de novo, no servidor: sem usuário, os filhos renderizam SEM o
 * chrome do painel — nenhuma informação vaza no HTML.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const email = await emailDaSessao();

  if (email === null) return <>{children}</>;

  return (
    <AdminShell email={email} demoMode={DEMO_MODE} aoSair={sair}>
      {children}
    </AdminShell>
  );
}
