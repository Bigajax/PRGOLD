import type { Metadata } from "next";
import { site } from "@/config/site";
import { getSettingsSeguro } from "@/services/conteudo";
import { Section, SectionInner } from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "Política de privacidade",
  description: "Como a PR Gold trata os dados de quem navega e entra em contato pelo site.",
  alternates: { canonical: "/politica-de-privacidade" },
};

/**
 * Texto-modelo, deliberadamente sinalizado como tal.
 *
 * O aviso no topo NÃO é decoração: publicar política jurídica sem revisão
 * profissional cria risco real para a loja, e omitir esse aviso transfere o
 * risco para quem escreveu o site.
 */
export default async function PrivacidadePage() {
  const settings = await getSettingsSeguro();

  return (
    <Section tone="light">
      <SectionInner>
        <div className="max-w-3xl">
          <p className="eyebrow text-ouro-escuro">Documento</p>
          <h1 className="mt-5 font-display text-[clamp(2rem,4vw,3rem)] leading-[1.06]">
            Política de privacidade
          </h1>

          <div className="mt-8 border-l-2 border-alerta bg-marfim-2 p-5">
            <p className="text-sm leading-relaxed">
              <strong>Aviso ao responsável pelo site.</strong> Este é um texto-modelo,
              de caráter demonstrativo. Ele precisa ser revisado por um
              profissional do direito e ajustado à operação real da PR Gold antes
              da publicação. Enquanto isso não acontecer, este aviso deve
              permanecer visível.
            </p>
          </div>

          <div className="mt-10 space-y-8 text-base leading-relaxed text-cinza-2">
            <section>
              <h2 className="font-display-sm text-xl text-onix">Quais dados coletamos</h2>
              <p className="mt-3">
                Este site é uma vitrine: ele apresenta as peças e encaminha o
                atendimento para o WhatsApp. Não há cadastro de visitante, login
                nem processamento de pagamento.
              </p>
              <p className="mt-3">
                Coletamos dados apenas quando você os informa voluntariamente no
                formulário “Monte sua peça”: nome, WhatsApp e, se você preencher,
                cidade, e-mail, detalhes da peça desejada e uma imagem de
                referência.
              </p>
            </section>

            <section>
              <h2 className="font-display-sm text-xl text-onix">Para que usamos</h2>
              <p className="mt-3">
                Exclusivamente para responder à sua solicitação e conduzir o
                atendimento sobre a peça. Não vendemos, alugamos nem cedemos seus
                dados a terceiros para fins de marketing.
              </p>
            </section>

            <section>
              <h2 className="font-display-sm text-xl text-onix">
                Dados guardados no seu aparelho
              </h2>
              <p className="mt-3">
                Sua lista de favoritos e o histórico de buscas ficam salvos apenas
                no armazenamento local do navegador que você está usando. Eles não
                são enviados para nós e desaparecem se você limpar os dados do
                navegador.
              </p>
            </section>

            <section>
              <h2 className="font-display-sm text-xl text-onix">WhatsApp</h2>
              <p className="mt-3">
                Ao tocar em um botão de contato, você é levado ao WhatsApp com uma
                mensagem já escrita. O envio depende de você. A partir daí, a
                conversa é regida pelos termos do próprio WhatsApp.
              </p>
            </section>

            <section>
              <h2 className="font-display-sm text-xl text-onix">Seus direitos</h2>
              <p className="mt-3">
                Você pode solicitar a confirmação, a correção ou a exclusão dos
                dados que enviou, a qualquer momento, pelos nossos canais de
                atendimento.
              </p>
            </section>

            <section>
              <h2 className="font-display-sm text-xl text-onix">Como falar conosco</h2>
              <p className="mt-3">
                {settings.email
                  ? `Pelo e-mail ${settings.email} ou pelo WhatsApp de atendimento.`
                  : "Pelo WhatsApp de atendimento informado no rodapé deste site."}
              </p>
            </section>
          </div>

          <p className="mt-12 text-xs text-cinza-2">
            {site.name}
            {settings.legalName ? ` — ${settings.legalName}` : ""}
            {settings.legalDocument ? ` — CNPJ ${settings.legalDocument}` : ""}
          </p>
        </div>
      </SectionInner>
    </Section>
  );
}
