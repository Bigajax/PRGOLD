import type { Metadata } from "next";
import { FavoritosView } from "./FavoritosView";

export const metadata: Metadata = {
  title: "Favoritos",
  description: "As peças que você salvou na vitrine da PR Gold.",
  alternates: { canonical: "/favoritos" },
  // A lista é do aparelho de quem navega: não há nada aqui para indexar.
  robots: { index: false, follow: true },
};

export default function FavoritosPage() {
  return <FavoritosView />;
}
