import type { Product, Tone } from "@/types";
import { ProductCard } from "./ProductCard";

/**
 * Grade da vitrine.
 *
 * DUAS COLUNAS NO MOBILE, sempre. Uma coluna mostra uma peça e meia por tela e
 * transforma o catálogo em rolagem infinita; duas dobram a densidade sem
 * comprometer o alvo de toque.
 *
 * A classe `vitrine` (globals.css) cuida do respiro entre os cartões, que
 * cresce com a tela: 12px no celular, 24px no desktop.
 */
export function ProductGrid({
  produtos,
  tone,
  prioridadeAte = 0,
  colunas = "padrao",
}: {
  produtos: Product[];
  tone: Tone;
  /** Quantas primeiras imagens recebem `priority` (só o que está na primeira dobra). */
  prioridadeAte?: number;
  colunas?: "padrao" | "tres";
}) {
  if (produtos.length === 0) return null;

  const grade =
    colunas === "tres"
      ? "grid-cols-2 lg:grid-cols-3"
      : "grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";

  return (
    <div className={`vitrine ${grade}`}>
      {produtos.map((produto, i) => (
        <ProductCard
          key={produto.id}
          produto={produto}
          tone={tone}
          prioridade={i < prioridadeAte}
        />
      ))}
    </div>
  );
}
