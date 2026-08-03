import { listarColecoesAdmin } from "@/services/admin";
import { TaxonomiaBoard } from "@/components/admin/TaxonomiaBoard";

export default async function ColecoesAdminPage() {
  const colecoes = await listarColecoesAdmin().catch(() => []);

  return (
    <TaxonomiaBoard
      itens={colecoes}
      tabela="collections"
      titulo="Coleções"
      descricao="Recortes editoriais do catálogo. Uma peça pode pertencer a uma coleção."
      singular="Nova coleção"
    />
  );
}
