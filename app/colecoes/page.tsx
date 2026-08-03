import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { textos } from "@/config/textos";
import { getColecoesSeguro } from "@/services/catalogo";
import { Section, SectionInner } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { EmptyState } from "@/components/ui/Estados";
import { ButtonLink } from "@/components/ui/Button";
import { PlaceholderJoia } from "@/components/catalog/ProductImage";

export const metadata: Metadata = {
  title: "Coleções",
  description: "Recortes do catálogo da PR Gold: alianças, fé, personalizados e presentes.",
  alternates: { canonical: "/colecoes" },
};

export default async function ColecoesPage() {
  const colecoes = (await getColecoesSeguro()).filter((c) => c.active);

  return (
    <Section tone="dark">
      <SectionInner>
        <SectionHeading
          etiqueta={textos.colecoes.etiqueta}
          titulo={textos.colecoes.titulo}
          subtitulo={textos.colecoes.subtitulo}
          tone="dark"
          nivel={1}
        />

        {colecoes.length > 0 ? (
          <div className="vitrine mt-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {colecoes.map((c) => (
              <Link key={c.slug} href={`/colecoes/${c.slug}`} className="cartao group block">
                <span className="relative m-1.5 block aspect-[4/5] overflow-hidden rounded-[0.875rem] bg-grafite">
                  {c.image ? (
                    <Image
                      src={c.image}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="img-zoom object-cover"
                    />
                  ) : (
                    <PlaceholderJoia />
                  )}
                  <span className="feixe-varre" aria-hidden />
                </span>
                <span className="block p-4 pt-2.5">
                  <span className="block font-display-sm text-lg text-marfim">{c.name}</span>
                  {c.description && (
                    <span className="mt-1 block text-sm leading-relaxed text-cinza">
                      {c.description}
                    </span>
                  )}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="mt-10">
            <EmptyState
              tone="dark"
              titulo="Nenhuma coleção publicada"
              texto="As coleções aparecem aqui assim que forem cadastradas no painel."
              acao={
                <ButtonLink href="/catalogo" variante="primario" tone="dark">
                  Ver catálogo
                </ButtonLink>
              }
            />
          </div>
        )}
      </SectionInner>
    </Section>
  );
}
