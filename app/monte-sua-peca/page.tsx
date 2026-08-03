import type { Metadata } from "next";
import { textos } from "@/config/textos";
import { MontarPecaForm } from "./MontarPecaForm";

export const metadata: Metadata = {
  title: "Monte sua peça",
  description:
    "Conte como seria a joia ideal e a PR Gold desenvolve uma peça em ouro pensada para a sua história.",
  alternates: { canonical: "/monte-sua-peca" },
};

export default function MonteSuaPecaPage() {
  return (
    <div className="tone-light bg-marfim">
      {/* `min-w-0` nos filhos: item de grid tem `min-width: auto` por padrão e
          se recusa a encolher abaixo do conteúdo, esticando a coluna inteira e
          criando rolagem horizontal em telas estreitas. */}
      <div className="shell grid gap-10 py-12 md:py-20 lg:grid-cols-[22rem_1fr] lg:gap-16">
        <header className="min-w-0 lg:sticky lg:top-28 lg:self-start">
          <p className="eyebrow text-ouro-escuro">{textos.monteSuaPeca.etiqueta}</p>
          <h1 className="mt-5 font-display text-[clamp(2rem,4vw,3rem)] leading-[1.06]">
            Conte como seria a joia <span className="text-ouro-escuro">ideal</span>.
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-cinza-2">
            {textos.monteSuaPeca.descricao}
          </p>
          {/* Nenhuma promessa de valor ou prazo: quem define isso é o
              atendimento, depois de entender a peça. */}
          <p className="mt-6 border-l-2 border-ouro-escuro pl-4 text-sm leading-relaxed text-cinza-2">
            Este formulário não gera orçamento automático. Ele leva a sua ideia
            até um especialista, que continua a conversa com você.
          </p>
        </header>

        <div className="min-w-0">
          <MontarPecaForm />
        </div>
      </div>
    </div>
  );
}
