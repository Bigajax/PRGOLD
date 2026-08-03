import "server-only";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { SUPABASE_SETUP_HINT, supabaseAnonKey, supabaseUrl } from "./env";

/**
 * Cliente do PAINEL: server-side, com a sessão do administrador nos cookies.
 *
 * Nunca importar isto na vitrine pública. O motivo não é estilo, é técnico:
 * ler `cookies()` dentro de uma função cacheada é proibido, então um cliente
 * com cookies quebraria o cache do catálogo inteiro. A vitrine usa
 * `anonClient()` em `services/supabase.ts`, que não toca em cookies.
 */
export async function supabaseServer() {
  const url = supabaseUrl();
  const key = supabaseAnonKey();
  if (!url || !key) throw new Error(SUPABASE_SETUP_HINT);

  const cookieStore = await cookies();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Chamado de dentro de um Server Component, onde escrever cookie não
          // é permitido. O `proxy.ts` já renova a sessão a cada request, então
          // ignorar aqui é seguro — é o padrão recomendado pelo @supabase/ssr.
        }
      },
    },
  });
}

export type RequireUserResult = Awaited<ReturnType<typeof requireUser>>;

/**
 * Primeira linha de TODA Server Action do painel.
 *
 * A tela nunca é a única proteção: esconder um botão não impede ninguém de
 * invocar a action direto. Sem sessão, esta função lança — e o `catch` padrão
 * das actions transforma isso na mensagem em português que o lojista entende.
 */
export async function requireUser() {
  const db = await supabaseServer();
  const {
    data: { user },
  } = await db.auth.getUser();

  if (!user) throw new Error("Sessão expirada. Entre novamente no painel.");

  return { db, user };
}
