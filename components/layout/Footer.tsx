"use client";

import Link from "next/link";
import { MapPin, Clock, Mail, MessageCircle } from "lucide-react";
import { IconeInstagram } from "@/components/ui/Icones";
import { menuInstitucional, menuLegal } from "@/config/nav";
import { site } from "@/config/site";
import { useCategorias, useSettings } from "@/components/providers/SiteProvider";
import { mensagemAtendimento, waLink } from "@/lib/whatsapp";
import { Logo } from "./Logo";

/**
 * Rodapé completo.
 *
 * Cada linha de contato só é renderizada quando existe valor. Enquanto a
 * PR Gold não informar endereço, horário e e-mail, essas linhas simplesmente
 * não aparecem — em vez de exibir um campo vazio ou um dado inventado.
 */
export function Footer() {
  const settings = useSettings();
  const categorias = useCategorias().filter((c) => c.active);
  const ano = new Date().getFullYear();

  const contatos = [
    settings.whatsapp && {
      icone: MessageCircle,
      texto: "Atendimento pelo WhatsApp",
      href: waLink(mensagemAtendimento(settings), settings),
      externo: true,
    },
    settings.instagramUrl && {
      icone: IconeInstagram,
      texto: `@${settings.instagramHandle}`,
      href: settings.instagramUrl,
      externo: true,
    },
    settings.email && {
      icone: Mail,
      texto: settings.email,
      href: `mailto:${settings.email}`,
      externo: false,
    },
    (settings.address || settings.city) && {
      icone: MapPin,
      texto: [settings.address, settings.city].filter(Boolean).join(" - "),
      href: null,
      externo: false,
    },
    settings.businessHours && {
      icone: Clock,
      texto: settings.businessHours,
      href: null,
      externo: false,
    },
  ].filter(Boolean) as {
    icone: (props: { className?: string }) => React.ReactNode;
    texto: string;
    href: string | null;
    externo: boolean;
  }[];

  return (
    <footer className="border-t border-ouro/20 bg-onix text-marfim">
      <div className="shell py-14 md:py-20">
        {/* Duas colunas no mobile (regra da casa): Categorias e PR Gold lado a
            lado. Marca e Atendimento, que têm linhas longas, atravessam as
            duas. Em coluna única o rodapé media três telas de rolagem. */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:gap-12 lg:grid-cols-4">
          <div className="col-span-2 lg:col-span-1">
            <Logo tone="dark" tamanho="md" />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-cinza">
              {settings.footerTagline}
            </p>
          </div>

          {categorias.length > 0 && (
            <nav aria-labelledby="rodape-categorias">
              <h2 id="rodape-categorias" className="eyebrow mb-5 text-ouro">
                Categorias
              </h2>
              <ul className="space-y-3">
                {categorias.map((c) => (
                  <li key={c.slug}>
                    <Link
                      href={`/catalogo/${c.slug}`}
                      className="tap text-sm text-cinza hover:text-ouro"
                    >
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          <nav aria-labelledby="rodape-institucional">
            <h2 id="rodape-institucional" className="eyebrow mb-5 text-ouro">
              PR Gold
            </h2>
            <ul className="space-y-3">
              {menuInstitucional.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="tap text-sm text-cinza hover:text-ouro"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="col-span-2 md:col-span-1">
            <h2 className="eyebrow mb-5 text-ouro">Atendimento</h2>
            <ul className="space-y-3">
              {contatos.map((c) => {
                const Icone = c.icone;
                const conteudo = (
                  <span className="flex items-start gap-3 text-sm text-cinza">
                    <Icone className="mt-0.5 size-4 shrink-0 text-ouro/70" aria-hidden />
                    <span>{c.texto}</span>
                  </span>
                );
                return (
                  <li key={c.texto}>
                    {c.href ? (
                      <a
                        href={c.href}
                        {...(c.externo
                          ? { target: "_blank", rel: "noopener noreferrer" }
                          : {})}
                        className="tap block hover:[&_span]:text-ouro"
                      >
                        {conteudo}
                      </a>
                    ) : (
                      conteudo
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <hr className="feixe-divisor my-10" />

        {/* A frase que ficava na barra acima do cabeçalho. Desceu para cá em
            branco, e sem o link de atendimento: o WhatsApp já está no menu de
            contatos deste mesmo rodapé, no cabeçalho e no botão flutuante. */}
        {settings.topBarText && (
          <p className="mb-8 text-center font-sans text-[11px] tracking-[0.08em] text-marfim">
            {settings.topBarText}
          </p>
        )}

        <div className="flex flex-col gap-4 text-xs text-cinza/70 md:flex-row md:items-center md:justify-between">
          <p>
            © {ano} {settings.legalName || site.name}
            {settings.legalDocument ? ` · CNPJ ${settings.legalDocument}` : ""} ·{" "}
            Todos os direitos reservados.
          </p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {menuLegal.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="tap hover:text-ouro">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
