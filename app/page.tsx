import { getCatalogoSeguro, getCategoriasSeguro, getColecoesSeguro } from "@/services/catalogo";
import {
  getBanners,
  getBeneficios,
  getInstagram,
  getMomentos,
  getSettingsSeguro,
} from "@/services/conteudo";
import { bannersDemo } from "@/data/demo/banners";
import { ELOS_VITRINE, MIN_ELOS_FAIXA } from "@/config/catalogo";
import { buscar } from "@/lib/catalogo";
import { Hero } from "@/components/home/Hero";
import { FaixaElos } from "@/components/home/FaixaElos";
import {
  SecaoCategorias,
  SecaoColecoes,
  SecaoDestaques,
  SecaoInstagram,
  SecaoMomentos,
} from "@/components/home/Vitrines";
import {
  SecaoCtaFinal,
  SecaoExperiencia,
  SecaoMontePeca,
  SecaoSobre,
} from "@/components/home/Editorial";

/**
 * Home.
 *
 * Server Component sobre o catálogo cacheado — uma leitura por revalidação,
 * não por visita.
 *
 * Arco da página: peça em primeiro plano -> o que vende -> como navegar -> o
 * diferencial (peça sob medida) -> coleções -> ocasião -> confiança -> marca
 * -> bastidores -> última chance de conversar. Produto primeiro,
 * institucional depois.
 *
 * Cada seção some sozinha quando não tem conteúdo. Se o catálogo inteiro
 * falhar, sobram as seções institucionais e a página continua de pé.
 */
export default async function HomePage() {
  const [catalogo, categorias, colecoes, banners, beneficios, momentos, instagram, settings] =
    await Promise.all([
      getCatalogoSeguro(),
      getCategoriasSeguro(),
      getColecoesSeguro(),
      getBanners().catch(() => bannersDemo),
      getBeneficios().catch(() => []),
      getMomentos().catch(() => []),
      getInstagram().catch(() => []),
      getSettingsSeguro(),
    ]);

  const ativos = catalogo.filter((p) => p.active && !p.archivedAt);

  const destaques = ativos.filter((p) => p.featured).slice(0, 8);
  // Sem peças marcadas como destaque, a seção mostra as primeiras do catálogo
  // em vez de sumir: uma vitrine sem vitrine não faz sentido.
  const selecao = destaques.length >= 4 ? destaques : ativos.slice(0, 8);

  const banner = banners[0] ?? bannersDemo[0];

  // A faixa só oferece elo que tem peça. É a mesma busca que a pessoa vai usar
  // ao clicar, então o que a faixa promete e o que o catálogo entrega não têm
  // como divergir.
  const elos = ELOS_VITRINE.filter((elo) => buscar(ativos, elo.termo, 1).length > 0);

  return (
    <>
      <Hero banner={banner} />
      {elos.length >= MIN_ELOS_FAIXA && <FaixaElos elos={elos} />}
      <SecaoCategorias categorias={categorias.filter((c) => c.active)} />
      <SecaoDestaques produtos={selecao} />
      <SecaoMontePeca />
      <SecaoColecoes colecoes={colecoes.filter((c) => c.active)} />
      <SecaoMomentos momentos={momentos.filter((m) => m.active)} />
      <SecaoExperiencia beneficios={beneficios.filter((b) => b.active)} />
      <SecaoSobre />
      <SecaoInstagram
        posts={instagram.filter((p) => p.active)}
        instagramUrl={settings.instagramUrl}
      />
      <SecaoCtaFinal />
    </>
  );
}
