"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/client";

/**
 * Login do painel.
 *
 * Erros do Supabase chegam em inglês e sem contexto. Traduzir aqui não é
 * capricho: "Invalid login credentials" na tela faz o lojista achar que o
 * sistema quebrou, em vez de conferir a senha.
 *
 * A mensagem também não revela se o e-mail existe — isso entregaria a
 * metade da credencial para quem estivesse tentando adivinhar.
 */
function traduz(mensagem: string): string {
  if (/invalid login credentials/i.test(mensagem)) return "E-mail ou senha incorretos.";
  if (/email not confirmed/i.test(mensagem))
    return "Este acesso ainda não foi confirmado. Fale com o responsável técnico.";
  if (/rate limit|too many/i.test(mensagem))
    return "Muitas tentativas seguidas. Aguarde um minuto e tente de novo.";
  if (/network|fetch/i.test(mensagem))
    return "Sem conexão com o servidor. Confira a internet e tente de novo.";
  return `Não foi possível entrar. (${mensagem})`;
}

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [manter, setManter] = useState(true);
  const [mostrar, setMostrar] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setEnviando(true);

    try {
      const db = supabaseBrowser(manter);
      const { error } = await db.auth.signInWithPassword({ email, password: senha });
      if (error) {
        setErro(traduz(error.message));
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch (erro) {
      setErro(traduz(erro instanceof Error ? erro.message : "erro desconhecido"));
    } finally {
      setEnviando(false);
    }
  }

  const campo =
    "min-h-12 w-full border border-ouro/30 bg-transparent px-4 text-[16px] text-marfim placeholder:text-cinza/40 focus:border-ouro focus:outline-none";

  return (
    <form onSubmit={entrar} className="space-y-5">
      <div>
        <label
          htmlFor="email"
          className="mb-2 block font-sans text-[11px] tracking-[0.14em] text-cinza uppercase"
        >
          E-mail
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="username"
          required
          className={campo}
        />
      </div>

      <div>
        <label
          htmlFor="senha"
          className="mb-2 block font-sans text-[11px] tracking-[0.14em] text-cinza uppercase"
        >
          Senha
        </label>
        <div className="relative">
          <input
            id="senha"
            type={mostrar ? "text" : "password"}
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            autoComplete="current-password"
            required
            className={`${campo} pr-12`}
          />
          <button
            type="button"
            onClick={() => setMostrar((v) => !v)}
            aria-label={mostrar ? "Ocultar senha" : "Mostrar senha"}
            className="tap absolute top-0 right-0 grid h-12 w-12 place-items-center text-cinza hover:text-ouro"
          >
            {mostrar ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
          </button>
        </div>
      </div>

      <label className="flex min-h-11 items-center gap-3 text-sm text-cinza">
        <input
          type="checkbox"
          checked={manter}
          onChange={(e) => setManter(e.target.checked)}
          className="size-4 accent-[#D4AF37]"
        />
        Manter conectado neste aparelho
      </label>

      {erro && (
        <p role="alert" className="border-l-2 border-alerta pl-3 text-sm text-alerta">
          {erro}
        </p>
      )}

      <button
        type="submit"
        disabled={enviando}
        className="tap w-full min-h-12 border border-ouro bg-ouro font-sans text-xs tracking-[0.14em] text-onix uppercase hover:bg-ouro-claro disabled:opacity-50"
      >
        {enviando ? "Entrando..." : "Entrar"}
      </button>

      <p className="text-center text-xs text-cinza/60">
        Esqueceu a senha? Fale com o responsável técnico do site.
      </p>
    </form>
  );
}
