/**
 * Leitura tolerante das variáveis do Supabase.
 *
 * Este arquivo é importado tanto pelo `proxy.ts` quanto pelo navegador, então
 * NÃO pode ser `server-only` e NÃO pode ler nada além de `NEXT_PUBLIC_*`.
 *
 * Duas normalizações que nascem de erros reais de configuração:
 * 1. A URL costuma ser colada com barra final ou já com `/rest/v1` grudado —
 *    as duas formas quebram o cliente com uma mensagem incompreensível.
 * 2. A chave costuma vir do dashboard com um espaço invisível na ponta.
 */

function clean(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export function supabaseUrl(): string | undefined {
  const raw = clean(process.env.NEXT_PUBLIC_SUPABASE_URL);
  if (!raw) return undefined;
  return raw.replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");
}

export function supabaseAnonKey(): string | undefined {
  return clean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

/**
 * Fonte única da verdade sobre "existe banco?".
 *
 * Quando devolve `false`, os serviços de dados caem para `data/demo/` e o
 * painel mostra a faixa de modo demonstração. É proposital: o site inteiro
 * pode ser revisado antes de o projeto Supabase existir.
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl() && supabaseAnonKey());
}

/**
 * Mensagem única para quando falta configuração. Nunca vaza valor de variável,
 * só diz o que fazer.
 */
export const SUPABASE_SETUP_HINT =
  "Banco não configurado. Copie .env.example para .env.local e preencha NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.";
