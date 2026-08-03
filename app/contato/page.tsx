import type { Metadata } from "next";
import { Clock, Mail, MapPin } from "lucide-react";
import { textos } from "@/config/textos";
import { getSettingsSeguro } from "@/services/conteudo";
import { mensagemAtendimento, waLink } from "@/lib/whatsapp";
import { Section, SectionInner } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ButtonExterno, ButtonLink } from "@/components/ui/Button";
import { IconeInstagram, IconeWhatsApp } from "@/components/ui/Icones";

export const metadata: Metadata = {
  title: "Contato",
  description: "Fale com a PR Gold pelo WhatsApp e conheça os canais de atendimento.",
  alternates: { canonical: "/contato" },
};

export default async function ContatoPage() {
  const settings = await getSettingsSeguro();

  // Cada canal só entra quando existe. Um cartão de contato com campo vazio é
  // pior do que um cartão a menos.
  const canais = [
    settings.address || settings.city
      ? {
          Icone: MapPin,
          titulo: "Onde estamos",
          texto: [settings.address, settings.city].filter(Boolean).join(" - "),
        }
      : null,
    settings.businessHours
      ? { Icone: Clock, titulo: "Horário", texto: settings.businessHours }
      : null,
    settings.email
      ? { Icone: Mail, titulo: "E-mail", texto: settings.email }
      : null,
  ].filter(Boolean) as { Icone: typeof MapPin; titulo: string; texto: string }[];

  return (
    <>
      <Section tone="dark">
        <SectionInner>
          <SectionHeading
            etiqueta={textos.contato.etiqueta}
            titulo={textos.contato.titulo}
            destaque="PR Gold"
            subtitulo={textos.contato.subtitulo}
            tone="dark"
            nivel={1}
          />

          <div className="mt-10 flex flex-wrap gap-3">
            <ButtonExterno
              href={waLink(mensagemAtendimento(settings), settings)}
              variante="whatsapp"
              tamanho="lg"
            >
              <IconeWhatsApp className="size-5" />
              Falar pelo WhatsApp
            </ButtonExterno>

            {settings.instagramUrl && (
              <ButtonExterno
                href={settings.instagramUrl}
                variante="secundario"
                tone="dark"
                tamanho="lg"
              >
                <IconeInstagram className="size-4" />
                @{settings.instagramHandle}
              </ButtonExterno>
            )}
          </div>

          {canais.length > 0 && (
            <ul className="vitrine mt-14 grid-cols-1 sm:grid-cols-3">
              {canais.map(({ Icone, titulo, texto }) => (
                <li key={titulo} className="cartao cartao--estatico p-6">
                  <Icone className="size-5 text-ouro" aria-hidden />
                  <h2 className="mt-4 font-sans text-[11px] tracking-[0.16em] text-cinza uppercase">
                    {titulo}
                  </h2>
                  <p className="mt-2 text-base">{texto}</p>
                </li>
              ))}
            </ul>
          )}
        </SectionInner>
      </Section>

      <Section tone="light">
        <SectionInner>
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-16">
            <SectionHeading
              etiqueta="Antes de perguntar"
              titulo="Como funciona a compra"
              tone="light"
            />
            <ol className="space-y-6">
              {[
                {
                  t: "Escolha a peça",
                  d: "Navegue pelo catálogo e abra a joia que te interessou.",
                },
                {
                  t: "Toque em consultar",
                  d: "O WhatsApp abre com o nome, o código e a disponibilidade já preenchidos.",
                },
                {
                  t: "Converse com um especialista",
                  d: "Valor, formas de pagamento e entrega são combinados no atendimento.",
                },
              ].map((passo) => (
                <li key={passo.t} className="border-l-2 border-ouro-escuro pl-5">
                  <h3 className="font-display-sm text-lg">{passo.t}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-cinza-2">{passo.d}</p>
                </li>
              ))}
            </ol>
          </div>

          <p className="mt-12 text-sm text-cinza-2">
            Este site é uma vitrine: ele apresenta as peças e abre a conversa, mas
            não processa pagamento.
          </p>

          <div className="mt-6">
            <ButtonLink href="/catalogo" variante="primario" tone="light">
              Ver catálogo
            </ButtonLink>
          </div>
        </SectionInner>
      </Section>
    </>
  );
}
