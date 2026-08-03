import Image from "next/image";
import Link from "next/link";
import { site } from "@/config/site";

/**
 * Brasão oficial da PR Gold.
 *
 * O arquivo veio da própria marca (monograma PR, coroa de louros, diamante e
 * "SINCE 2019") e não foi redesenhado: `scripts/prepara-logo.mjs` apenas
 * recorta o fundo preto e gera os tamanhos.
 *
 * O brasão aparece sozinho, sem "PR GOLD" escrito ao lado — ele já contém as
 * iniciais, e repetir a mesma informação duas vezes só rouba largura do
 * cabeçalho.
 *
 * `tone` não muda o desenho (o dourado funciona nos dois fundos); existe para
 * a versão monocromática, usada onde o dourado competiria com a foto.
 */
export function Logo({
  tamanho = "md",
  comLink = true,
  mono = false,
}: {
  tamanho?: "sm" | "md" | "lg";
  comLink?: boolean;
  mono?: boolean;
  /** Aceito para compatibilidade com as chamadas existentes. */
  tone?: "dark" | "light";
}) {
  // O brasão é detalhado (coroa de louros, diamante, "SINCE 2019"): quanto
  // maior, mais ele lê como marca e menos como ícone. Os tamanhos andam junto
  // com a altura do cabeçalho — crescer a logo sem crescer o cabeçalho só
  // espreme o brasão contra as bordas.
  const px = { sm: 52, md: 72, lg: 128 }[tamanho];

  const conteudo = (
    <Image
      src={mono ? "/images/brand/logo-prgold-mono.png" : "/images/brand/logo-prgold-256.png"}
      alt={`${site.name} — joias em ouro`}
      // Intrínseco em 3x e exibição no tamanho real: o brasão tem coroa de
      // louros, diamante e "SINCE 2019" em traço fino. Servido em 1x, tudo
      // isso vira borrão — é detalhe demais para o tamanho em que aparece.
      width={px * 3}
      height={px * 3}
      quality={90}
      priority={tamanho === "lg"}
      className="object-contain"
      style={{ height: px, width: px }}
    />
  );

  if (!comLink) return conteudo;

  return (
    <Link
      href="/"
      aria-label={`${site.name} — página inicial`}
      className="tap inline-flex shrink-0"
    >
      {conteudo}
    </Link>
  );
}
