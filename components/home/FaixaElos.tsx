import Link from "next/link";
import Image from "next/image";
import type { EloVitrine } from "@/config/catalogo";

/**
 * Faixa de elos — exposição contínua, não carrossel.
 *
 * Cada peça é um recorte com transparência real: corrente, glow, "TIPO DE ELO",
 * nome e losango já vêm desenhados no arquivo. Por isso o código não escreve
 * texto nenhum aqui — escreveria em dobro.
 *
 * Nada de moldura: sem cartão, sem borda, sem fundo próprio. A peça pousa
 * direto no marfim da página e o que a separa da vizinha é espaço.
 *
 * A lista chega já filtrada contra o catálogo (ver `app/page.tsx`): este
 * componente não decide o que a loja faz, só desenha o que existe.
 */

/**
 * Duas voltas, e só duas.
 *
 * A animação anda até -50%: com a lista escrita duas vezes, o instante em que
 * ela volta a zero é exatamente o instante em que a segunda volta ocupa o lugar
 * da primeira. O corte não existe porque não há o que cortar.
 */
const VOLTAS = 2;

/**
 * Dimensão do master em `public/images/elos/` — os seis saíram do MESMO corte,
 * que é o que garante área visual idêntica sem esticar nem aparar nada.
 *
 * A caixa é a união das seis silhuetas com folga: o escapulário é uma corrente
 * em arco com dois medalhões e ocupa quase o dobro da altura de uma corrente
 * reta. Ajustar a caixa por imagem daria seis molduras diferentes; ajustar pela
 * mais alta dá espaço transparente sobrando nas outras cinco, que é invisível.
 */
const LARGURA = 1360;
const ALTURA = 680;

/**
 * A peça ocupa toda a largura do item, então é a largura do item que manda no
 * download. Um item de 420px em tela DPR 2 precisa de 840px de imagem; o Next
 * escolhe a variante por esta conta, e o master de 1360px cobre até DPR 3.
 */
const SIZES = "(max-width: 640px) 200px, (max-width: 1024px) 248px, 280px";

export function FaixaElos({ elos }: { elos: EloVitrine[] }) {
  if (elos.length === 0) return null;

  // Só a primeira volta é conteúdo. A segunda existe para o laço fechar, e por
  // isso sai da árvore de acessibilidade: ninguém precisa ouvir a lista duas
  // vezes nem tropeçar nela duas vezes no Tab.
  const pecas = Array.from({ length: VOLTAS }, (_, volta) =>
    elos.map((elo) => ({ elo, repeticao: volta > 0 }))
  ).flat();

  // `tone-light` não é decoração: é o que faz o anel de foco usar o dourado
  // escuro, o único que enxerga sobre o marfim.
  return (
    <section
      className="tone-light bg-marfim"
      aria-label="Elos e modelos que a PR Gold faz"
      data-luz={0.7}
      data-tom="light"
    >
      <div className="faixa-elos-janela">
        <ul className="faixa-elos">
          {pecas.map(({ elo, repeticao }, i) => (
            <li key={`${elo.slug}-${i}`} aria-hidden={repeticao || undefined}>
              <Link
                href={`/catalogo?q=${encodeURIComponent(elo.termo)}`}
                className="faixa-elos__peca"
                tabIndex={repeticao ? -1 : undefined}
              >
                <Image
                  src={`/images/elos/${elo.slug}.webp`}
                  // O nome está desenhado dentro da peça, então o `alt` é a
                  // única via de quem não a vê.
                  alt={repeticao ? "" : `Corrente de elo ${elo.rotulo.toLowerCase()}`}
                  width={LARGURA}
                  height={ALTURA}
                  sizes={SIZES}
                  quality={90}
                  // A tira anda por transform: o navegador não sabe quais peças
                  // vão entrar em cena, e adiar a carga abriria buraco no laço.
                  // São seis arquivos ao todo — a segunda volta reaproveita.
                  loading="eager"
                />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
