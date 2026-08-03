import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { supabaseAnonKey, supabaseUrl } from "@/lib/supabase/env";

/**
 * Primeira das quatro camadas de proteção do painel.
 *
 * No Next 16 este arquivo se chama `proxy.ts` (era `middleware.ts`) e a
 * função exportada se chama `proxy`. O runtime é sempre nodejs.
 *
 * Além de barrar quem não tem sessão, renova o token a cada request — é o
 * padrão do @supabase/ssr, e sem isso a sessão do lojista morre sozinha.
 *
 * À prova de falhas: variável ausente, rede fora ou token corrompido NUNCA
 * derrubam a página com 500. O pior caso é ser tratado como "sem sessão".
 */
export async function proxy(request: NextRequest) {
  const isLogin = request.nextUrl.pathname === "/admin/login";

  const toLogin = () => {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = "";
    return NextResponse.redirect(url);
  };

  const url = supabaseUrl();
  const key = supabaseAnonKey();

  // Sem banco configurado, o painel roda em modo demonstração: não existe
  // sessão para validar nem dado real para proteger, e toda escrita é recusada
  // pelas próprias actions. Bloquear aqui deixaria o painel impossível de
  // revisar antes de existir projeto Supabase.
  //
  // O painel avisa isso em faixa vermelha, e "faixa vermelha em produção" é um
  // item do checklist de publicação.
  if (!url || !key) {
    return NextResponse.next({ request });
  }

  try {
    let response = NextResponse.next({ request });

    const supabase = createServerClient(url, key, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user && !isLogin) return toLogin();

    if (user && isLogin) {
      const painel = request.nextUrl.clone();
      painel.pathname = "/admin";
      painel.search = "";
      return NextResponse.redirect(painel);
    }

    return response;
  } catch {
    return isLogin ? NextResponse.next({ request }) : toLogin();
  }
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
