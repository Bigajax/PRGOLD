import type { Metadata, Viewport } from "next";
import { Archivo, Fraunces } from "next/font/google";
import { site } from "@/config/site";
import { getCatalogoSeguro, getCategoriasSeguro, getColecoesSeguro } from "@/services/catalogo";
import { getSettingsSeguro } from "@/services/conteudo";
import { DEMO_MODE } from "@/services/supabase";
import { SiteProvider } from "@/components/providers/SiteProvider";
import { SearchProvider, SearchOverlay } from "@/components/layout/SearchOverlay";
import {
  FloatingWhatsApp,
  SiteFooter,
  SiteHeader,
  SiteLuz,
  TabBar,
  TabBarSpacer,
} from "@/components/layout/SiteChrome";
import { Toaster } from "@/components/ui/Toaster";
import "./globals.css";

/**
 * Duas famílias, self-hospedadas pelo next/font: zero request externo e zero
 * layout shift.
 *
 * Editorial contemporânea: Fraunces nos títulos, Archivo na interface.
 *
 * Fraunces é o oposto da Cormorant que estava aqui antes. A garalda tinha
 * contraste alto e hastes finas, e por isso pedia peso 300 em corpo grande
 * para não engrossar. A Fraunces tem contraste baixo, serifa em cunha e
 * terminais chapados: em 300 ela fica anêmica, e o caráter dela mora em
 * 400-500. Trocar a família sem trocar o peso teria dado um título sem voz.
 *
 * As três variáveis não-peso valem a inclusão:
 *   opsz — a Fraunces redesenha a letra por tamanho. Sem esse eixo, o título de
 *          48px usaria o desenho de corpo de texto e perderia o contraste.
 *   SOFT — arredonda os terminais. Um fio de suavidade tira a dureza do bico
 *          sem virar fonte infantil.
 *   WONK — liga as formas tortas (o `g` de cauda solta, o `a` inclinado). É o
 *          que faz a fonte parecer desenhada, e não escolhida.
 *
 * Archivo é uma grotesca de x alto e largura firme, feita para caption e dado.
 * Ela sustenta preço, peso em gramas e etiqueta em 11px, onde a Manrope, mais
 * arredondada, borrava. O eixo de largura entra junto: rótulo em caixa alta
 * pede um talhe mais estreito que o do corpo de texto.
 */
const fraunces = Fraunces({
  // Nomeadas pela família, não pelo papel: `--font-display` é o token do
  // tema, e uma variável com o mesmo nome viraria autorreferência.
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  axes: ["SOFT", "WONK", "opsz"],
});

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  display: "swap",
  axes: ["wdth"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} | Joias em ouro com atendimento personalizado`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: site.name,
    title: `${site.name} | Joias em ouro`,
    description: site.description,
    url: site.url,
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#080808",
  width: "device-width",
  initialScale: 1,
  // Nunca travar o zoom: quem precisa ampliar precisa poder ampliar.
  maximumScale: 5,
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // O catálogo inteiro é lido UMA vez aqui e distribuído por contexto. Todas as
  // leituras são resilientes: com o banco fora, a vitrine degrada para as
  // seções institucionais e nunca responde 500.
  const [catalogo, categorias, colecoes, settings] = await Promise.all([
    getCatalogoSeguro(),
    getCategoriasSeguro(),
    getColecoesSeguro(),
    getSettingsSeguro(),
  ]);

  return (
    <html
      lang="pt-BR"
      // Exigido pelo Next 16 para que a navegação SPA não vire rolagem animada
      // quando o CSS global usa scroll-behavior: smooth.
      data-scroll-behavior="smooth"
      className={`${fraunces.variable} ${archivo.variable} h-full`}
    >
      <body className="flex min-h-full flex-col bg-marfim">
        <SiteProvider
          catalogo={catalogo}
          categorias={categorias}
          colecoes={colecoes}
          settings={settings}
          demoMode={DEMO_MODE}
        >
          <SearchProvider>
            <SiteLuz />
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
            <TabBarSpacer />
            <TabBar />
            <FloatingWhatsApp />
            <SearchOverlay />
          </SearchProvider>
        </SiteProvider>
        <Toaster />
      </body>
    </html>
  );
}
