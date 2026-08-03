import Link from "next/link";
import { textos } from "@/config/textos";
import { Section } from "@/components/ui/Section";

/**
 * 404 com saída.
 *
 * Não basta dizer que a página não existe: quem chegou aqui queria uma peça.
 * O caminho de volta é o catálogo.
 */
export default function NaoEncontrado() {
  return (
    <Section tone="dark" className="relative overflow-hidden">
      <span className="feixe-vertical" aria-hidden />
      <div className="relative shell flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
        <p className="eyebrow text-ouro">Erro 404</p>
        <h1 className="mt-6 max-w-xl font-display text-[clamp(2rem,5vw,3.5rem)] leading-[1.06]">
          {textos.naoEncontrado.titulo}
        </h1>
        <p className="mt-5 max-w-md text-base leading-relaxed text-cinza">
          {textos.naoEncontrado.texto}
        </p>
        <Link
          href="/catalogo"
          className="tap mt-9 inline-flex min-h-12 items-center border border-ouro bg-ouro px-7 font-sans text-xs tracking-[0.14em] text-onix uppercase hover:bg-ouro-claro"
        >
          {textos.naoEncontrado.cta}
        </Link>
      </div>
    </Section>
  );
}
