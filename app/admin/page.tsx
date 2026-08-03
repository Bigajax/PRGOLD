import Link from "next/link";
import { TriangleAlert } from "lucide-react";
import { LIMIAR_ESTOQUE_BAIXO } from "@/config/catalogo";
import {
  listarBannersAdmin,
  listarCategoriasAdmin,
  listarColecoesAdmin,
  listarPedidosAdmin,
  listarProdutosAdmin,
} from "@/services/admin";
import { pendenciasDeConfiguracao } from "@/config/site";
import { deriveAvailability, isLowStock } from "@/types";
import { PageHeader, StatCard } from "@/components/admin/AdminUI";

/**
 * Visão geral.
 *
 * Os cartões são clicáveis e levam para a lista já filtrada — número que não
 * leva a lugar nenhum é decoração. E as pendências ficam no topo, porque o
 * lojista abre esta tela para saber o que precisa da atenção dele.
 */
export default async function DashboardPage() {
  const [produtos, categorias, colecoes, banners, pedidos] = await Promise.all([
    listarProdutosAdmin().catch(() => []),
    listarCategoriasAdmin().catch(() => []),
    listarColecoesAdmin().catch(() => []),
    listarBannersAdmin().catch(() => []),
    listarPedidosAdmin().catch(() => []),
  ]);

  const naoArquivados = produtos.filter((p) => !p.archivedAt);
  const ativos = naoArquivados.filter((p) => p.active);
  const destaques = ativos.filter((p) => p.featured);
  const estoqueBaixo = ativos.filter((p) => isLowStock(p, LIMIAR_ESTOQUE_BAIXO));
  const novas = pedidos.filter((p) => p.status === "nova");

  /**
   * Ações pendentes: no máximo oito, e cada uma com o caminho para resolver.
   * Uma lista infinita de pendências é a mesma coisa que nenhuma lista.
   */
  const semFoto = ativos.filter((p) => p.images.length === 0);
  const semPreco = ativos.filter((p) => p.priceOnRequest || p.price === null);
  const semDisponibilidade = ativos.filter(
    (p) => deriveAvailability(p) === "consultar"
  );

  const pendencias: { texto: string; href: string }[] = [
    ...semFoto.slice(0, 3).map((p) => ({
      texto: `“${p.name}” está publicada sem nenhuma foto`,
      href: `/admin/produtos?busca=${encodeURIComponent(p.code)}`,
    })),
    ...estoqueBaixo.slice(0, 2).map((p) => ({
      texto: `“${p.name}” está com estoque baixo`,
      href: `/admin/produtos?filtro=estoque-baixo`,
    })),
    ...(semPreco.length > 0
      ? [
          {
            texto: `${semPreco.length} peças sem preço: a vitrine mostra “Valor sob consulta”`,
            href: "/admin/produtos",
          },
        ]
      : []),
    ...(semDisponibilidade.length > 0
      ? [
          {
            texto: `${semDisponibilidade.length} peças sem disponibilidade definida`,
            href: "/admin/produtos",
          },
        ]
      : []),
    ...(novas.length > 0
      ? [
          {
            texto: `${novas.length} solicitação(ões) de peça personalizada aguardando`,
            href: "/admin/personalizados",
          },
        ]
      : []),
  ].slice(0, 8);

  const configPendente = pendenciasDeConfiguracao();

  return (
    <>
      <PageHeader
        titulo="Visão geral"
        descricao="O estado da vitrine agora, e o que precisa da sua atenção."
      />

      <div className="vitrine grid-cols-2 border border-onix/12 lg:grid-cols-4">
        <StatCard rotulo="Peças ativas" valor={ativos.length} href="/admin/produtos" />
        <StatCard rotulo="Em destaque" valor={destaques.length} href="/admin/produtos" />
        <StatCard
          rotulo="Estoque baixo"
          valor={estoqueBaixo.length}
          href="/admin/produtos?filtro=estoque-baixo"
          destaque={estoqueBaixo.length > 0}
        />
        <StatCard
          rotulo="Solicitações novas"
          valor={novas.length}
          href="/admin/personalizados"
          destaque={novas.length > 0}
        />
        <StatCard rotulo="Categorias" valor={categorias.length} href="/admin/categorias" />
        <StatCard rotulo="Coleções" valor={colecoes.length} href="/admin/colecoes" />
        <StatCard rotulo="Banners" valor={banners.length} href="/admin/banners" />
        <StatCard
          rotulo="Arquivadas"
          valor={produtos.length - naoArquivados.length}
          href="/admin/produtos?filtro=arquivados"
        />
      </div>

      {pendencias.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 font-display text-2xl">Ações pendentes</h2>
          <ul className="divide-y divide-onix/10 border border-onix/12">
            {pendencias.map((p) => (
              <li key={p.texto}>
                <Link
                  href={p.href}
                  className="tap flex min-h-14 items-center gap-3 px-4 text-sm hover:bg-marfim-2"
                >
                  <TriangleAlert className="size-4 shrink-0 text-ouro-escuro" aria-hidden />
                  {p.texto}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {configPendente.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 font-display text-2xl">Antes de publicar</h2>
          <p className="mb-4 text-sm text-cinza-2">
            Estes dados ainda não foram confirmados. Enquanto isso, o site
            simplesmente não os exibe — em vez de mostrar informação inventada.
          </p>
          <ul className="space-y-2 border border-onix/12 p-4 text-sm text-cinza-2">
            {configPendente.map((item) => (
              <li key={item} className="flex gap-2">
                <span aria-hidden className="text-ouro-escuro">
                  •
                </span>
                {item}
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
