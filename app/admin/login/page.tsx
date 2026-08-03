import type { Metadata } from "next";
import { DEMO_MODE } from "@/services/supabase";
import { Logo } from "@/components/layout/Logo";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Entrar no painel",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-onix px-5 py-16">
      <span className="feixe-vertical" aria-hidden />

      <div className="relative w-full max-w-sm">
        <div className="mb-10 flex justify-center">
          <Logo tone="dark" tamanho="lg" comLink={false} />
        </div>

        {DEMO_MODE ? (
          <div className="border border-ouro/30 p-6 text-sm leading-relaxed text-cinza">
            <h1 className="mb-3 font-display-sm text-xl text-marfim">
              Banco de dados não configurado
            </h1>
            <p>
              O painel precisa do Supabase para autenticar e salvar. Enquanto isso
              não estiver pronto, o site funciona com um catálogo de demonstração.
            </p>
            <ol className="mt-4 list-decimal space-y-2 pl-5">
              <li>
                Rode as migrations de <code className="text-marfim">supabase/migrations</code> na
                ordem, no SQL Editor.
              </li>
              <li>Desative o cadastro público em Authentication.</li>
              <li>Crie o usuário e autorize-o em `admin_profiles`.</li>
              <li>
                Preencha <code className="text-marfim">.env.local</code> a partir de{" "}
                <code className="text-marfim">.env.example</code>.
              </li>
            </ol>
            <p className="mt-4">
              O passo a passo completo está em{" "}
              <code className="text-marfim">supabase/README.md</code>.
            </p>
          </div>
        ) : (
          <LoginForm />
        )}
      </div>
    </div>
  );
}
