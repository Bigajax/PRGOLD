import { PageHeader } from "./AdminUI";

/**
 * Aviso de falha de carga de uma tela do painel.
 *
 * Fica num componente próprio porque construir JSX dentro de `try/catch` não
 * captura erro nenhum: o React não renderiza no momento em que o JSX é criado.
 * A página faz o `try/catch` só em volta da BUSCA DE DADOS e decide qual
 * componente renderizar depois.
 */
export function AvisoCarga({
  titulo,
  migracao,
  arquivo,
}: {
  titulo: string;
  /** true quando a tabela ainda não existe: o painel se autodiagnostica. */
  migracao: boolean;
  arquivo?: string;
}) {
  return (
    <>
      <PageHeader titulo={titulo} />
      <div className="border-l-2 border-alerta bg-marfim-2 p-5 text-sm leading-relaxed">
        {migracao ? (
          <>
            <p className="font-medium">Atualização do banco pendente</p>
            <p className="mt-2 text-cinza-2">
              As tabelas desta tela ainda não existem. Rode{" "}
              <code>{arquivo ?? "supabase/migrations"}</code> no SQL Editor do
              Supabase, na ordem indicada em <code>supabase/README.md</code>.
            </p>
          </>
        ) : (
          <>
            <p className="font-medium">Não foi possível carregar os dados</p>
            <p className="mt-2 text-cinza-2">
              Verifique a conexão com o banco e recarregue a página.
            </p>
          </>
        )}
      </div>
    </>
  );
}
