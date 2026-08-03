/**
 * PR Gold — navegação.
 *
 * Navegação é decisão comercial, não componente: a ordem do menu é a ordem em
 * que a loja quer ser descoberta. Por isso mora em `config/`, e não dentro do
 * Header.
 *
 * Os slugs abaixo precisam existir como categorias no banco (ou no catálogo de
 * demonstração). O menu não inventa destino: um item cuja categoria não existe
 * é filtrado na renderização, e não vira link quebrado.
 */

export type NavItem = {
  label: string;
  href: string;
  /** Quando presente, o item só aparece se a categoria existir e estiver ativa. */
  requiresCategory?: string;
};

/** Menu principal do header, na ordem do briefing. */
export const menuPrincipal: NavItem[] = [
  { label: "Novidades", href: "/catalogo?novidade=1" },
  { label: "Alianças", href: "/catalogo/aliancas", requiresCategory: "aliancas" },
  { label: "Anéis", href: "/catalogo/aneis", requiresCategory: "aneis" },
  { label: "Correntes", href: "/catalogo/correntes", requiresCategory: "correntes" },
  { label: "Colares", href: "/catalogo/colares", requiresCategory: "colares" },
  { label: "Pulseiras", href: "/catalogo/pulseiras", requiresCategory: "pulseiras" },
  { label: "Brincos", href: "/catalogo/brincos", requiresCategory: "brincos" },
  { label: "Masculino", href: "/catalogo?genero=masculino" },
  { label: "Feminino", href: "/catalogo?genero=feminino" },
  { label: "Personalizados", href: "/monte-sua-peca" },
  { label: "Sobre", href: "/sobre" },
];

/**
 * O que fica VISÍVEL na barra do cabeçalho.
 *
 * Curto de propósito. Onze links sempre na tela não são onze caminhos, são
 * uma parede: a pessoa lê todos para achar um. "Catálogo" abre o painel com o
 * resto do `menuPrincipal`; o que sobra aqui é só o institucional.
 *
 * Um item listado aqui NÃO se repete dentro do painel — a filtragem é
 * automática, por `href`.
 */
export const menuBarra: NavItem[] = [
  { label: "Catálogo", href: "/catalogo" },
  { label: "Sobre", href: "/sobre" },
];

/** Rodapé — coluna institucional. */
export const menuInstitucional: NavItem[] = [
  { label: "Sobre a PR Gold", href: "/sobre" },
  { label: "Coleções", href: "/colecoes" },
  { label: "Monte sua peça", href: "/monte-sua-peca" },
  { label: "Favoritos", href: "/favoritos" },
  { label: "Contato", href: "/contato" },
];

/** Rodapé — coluna legal. */
export const menuLegal: NavItem[] = [
  { label: "Política de privacidade", href: "/politica-de-privacidade" },
];

/** Barra fixa inferior no mobile. Máximo cinco destinos. */
export const tabBar: NavItem[] = [
  { label: "Início", href: "/" },
  { label: "Catálogo", href: "/catalogo" },
  { label: "Monte sua peça", href: "/monte-sua-peca" },
  { label: "Favoritos", href: "/favoritos" },
];

/** Navegação do painel administrativo. */
export const menuAdmin: NavItem[] = [
  { label: "Visão geral", href: "/admin" },
  { label: "Produtos", href: "/admin/produtos" },
  { label: "Categorias", href: "/admin/categorias" },
  { label: "Coleções", href: "/admin/colecoes" },
  { label: "Banners", href: "/admin/banners" },
  { label: "Personalizados", href: "/admin/personalizados" },
  { label: "Configurações", href: "/admin/configuracoes" },
];

/**
 * Remove do menu os itens cuja categoria não existe. Chamado no servidor, com
 * a lista de slugs ativos — assim o menu nunca oferece um caminho vazio.
 */
export function filtrarMenu(itens: NavItem[], slugsAtivos: string[]): NavItem[] {
  return itens.filter(
    (item) => !item.requiresCategory || slugsAtivos.includes(item.requiresCategory)
  );
}
