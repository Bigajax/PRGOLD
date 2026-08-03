import type { Metadata } from "next";
import Image from "next/image";
import { site } from "@/config/site";
import { textos } from "@/config/textos";
import { editorial } from "@/data/demo/editorial";
import { getSettingsSeguro } from "@/services/conteudo";
import { Section, SectionInner } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Sobre",
  description:
    "A PR Gold é uma joalheria com confecção própria, que trabalha somente com joias em ouro.",
  alternates: { canonical: "/sobre" },
};

/**
 * Página institucional.
 *
 * Só afirma o que a própria PR Gold já comunica publicamente: desde 2019,
 * confecção própria, somente joias em ouro, Maringá-PR. Nenhum número de
 * clientes, prêmio, certificação ou garantia — nada disso foi confirmado, e
 * texto institucional inventado é o tipo de mentira que ninguém percebe até o
 * dia em que alguém cobra.
 */
export default async function SobrePage() {
  const settings = await getSettingsSeguro();

  return (
    <>
      <Section tone="dark">
        <div className="grid lg:grid-cols-2">
          <div className="relative aspect-[4/3] w-full overflow-hidden border-b border-ouro/25 lg:aspect-auto lg:min-h-[34rem] lg:border-r lg:border-b-0">
            <Image
              src={editorial["atelie-fundicao"].url}
              alt={editorial["atelie-fundicao"].alt}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>

          <div className="flex items-center">
            <div className="shell py-14 md:py-20">
              <SectionHeading
                etiqueta={textos.sobre.etiqueta}
                titulo={settings.aboutTitle}
                destaque="joias"
                tone="dark"
                nivel={1}
              />
              <p className="mt-6 max-w-lg text-base leading-relaxed text-cinza">
                {settings.aboutText}
              </p>
              <dl className="mt-10 grid grid-cols-2 gap-6">
                <div>
                  <dt className="eyebrow text-ouro">Desde</dt>
                  <dd className="mt-2 font-display text-3xl">{site.foundedYear}</dd>
                </div>
                {settings.city && (
                  <div>
                    <dt className="eyebrow text-ouro">Onde</dt>
                    <dd className="mt-2 font-display-sm text-xl">{settings.city}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>
      </Section>

      <Section tone="light">
        <SectionInner>
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <SectionHeading
                etiqueta="Como trabalhamos"
                titulo="Confecção própria, do desenho à entrega."
                destaque="Confecção própria"
                tone="light"
              />
            </div>
            <div className="space-y-5 text-base leading-relaxed text-cinza-2">
              <p>
                Trabalhamos somente com joias em ouro. Cada peça passa pelo nosso
                ateliê, e é isso que permite criar uma joia a partir de uma ideia
                — não apenas escolher entre o que já existe pronto.
              </p>
              <p>
                O atendimento acontece pelo WhatsApp, com uma pessoa do outro
                lado. É lá que confirmamos disponibilidade, valores e a forma de
                receber a sua peça.
              </p>
            </div>
          </div>

          <div className="mt-12 flex flex-wrap gap-3">
            <ButtonLink href="/catalogo" variante="primario" tone="light" tamanho="lg">
              Ver catálogo
            </ButtonLink>
            <ButtonLink href="/monte-sua-peca" variante="secundario" tone="light" tamanho="lg">
              Monte sua peça
            </ButtonLink>
          </div>
        </SectionInner>
      </Section>

      <Section tone="light">
        <SectionInner className="pt-0">
          <div className="vitrine grid-cols-1 sm:grid-cols-3">
            {[
              editorial["atelie-fundicao"],
              editorial["pesagem"],
              editorial["embalagem"],
            ].map((img) => (
              <div
                key={img.url}
                className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-lg)] bg-onix"
              >
                <Image
                  src={img.url}
                  alt={img.alt}
                  fill
                  sizes="(max-width: 640px) 100vw, 33vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </SectionInner>
      </Section>
    </>
  );
}
