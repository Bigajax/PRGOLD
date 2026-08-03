import { listarCategoriasAdmin } from "@/services/admin";
import { TaxonomiaBoard } from "@/components/admin/TaxonomiaBoard";

export default async function CategoriasPage() {
  const categorias = await listarCategoriasAdmin().catch(() => []);

  return (
    <TaxonomiaBoard
      itens={categorias}
      tabela="categories"
      titulo="Categorias"
      descricao="A navegação do catálogo. A ordem daqui é a ordem que aparece na home."
      singular="Nova categoria"
    />
  );
}
