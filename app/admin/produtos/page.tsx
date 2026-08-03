import {
  listarCategoriasAdmin,
  listarColecoesAdmin,
  listarProdutosAdmin,
  migrationPendente,
} from "@/services/admin";
import type { Category, Collection, Product } from "@/types";
import { ProductsBoard } from "@/components/admin/ProductsBoard";
import { AvisoCarga } from "@/components/admin/AvisoCarga";

const FILTROS_VALIDOS = [
  "todos",
  "ativos",
  "ocultos",
  "estoque-baixo",
  "sem-foto",
  "arquivados",
] as const;

type FiltroValido = (typeof FILTROS_VALIDOS)[number];

export default async function ProdutosPage(props: PageProps<"/admin/produtos">) {
  const params = await props.searchParams;
  const bruto = Array.isArray(params.filtro) ? params.filtro[0] : params.filtro;
  const filtro: FiltroValido = FILTROS_VALIDOS.includes(bruto as FiltroValido)
    ? (bruto as FiltroValido)
    : "todos";

  // O try/catch envolve SÓ a busca de dados. Construir JSX aqui dentro não
  // capturaria erro de render — o React só renderiza depois.
  let dados: { produtos: Product[]; categorias: Category[]; colecoes: Collection[] } | null =
    null;
  let falha: unknown = null;

  try {
    const [produtos, categorias, colecoes] = await Promise.all([
      listarProdutosAdmin(),
      listarCategoriasAdmin(),
      listarColecoesAdmin(),
    ]);
    dados = { produtos, categorias, colecoes };
  } catch (erro) {
    falha = erro;
  }

  if (!dados) {
    return <AvisoCarga titulo="Produtos" migracao={migrationPendente(falha)} />;
  }

  return (
    <ProductsBoard
      produtos={dados.produtos}
      categorias={dados.categorias}
      colecoes={dados.colecoes}
      filtroInicial={filtro}
    />
  );
}
