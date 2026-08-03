# Decisões de arquitetura — PR Gold

Cada item registra **o que foi decidido, por quê e o que mudaria a decisão**.
Serve para a próxima pessoa (ou para mim daqui a seis meses) não desfazer algo
que existe por um motivo.

---

## 1. Disponibilidade é derivada, nunca digitada

Não existe coluna `status` em `products` nem campo de status no formulário. Uma
única função, `deriveAvailability()` em `types/index.ts`, decide entre *Pronta
entrega*, *Sob encomenda* e *Consulte disponibilidade* a partir de três dados
que o lojista controla: quantidade em estoque, "tenho em mãos" e "aceita
encomenda".

**Por quê:** com um campo editável, o estoque zera e o site continua prometendo
pronta entrega até alguém lembrar de corrigir. O viés aqui é sempre prometer
menos.

A mesma função alimenta o selo do card, o badge da página de produto, o filtro
do catálogo, o JSON-LD e o texto da mensagem de WhatsApp — o visitante, o
buscador e o atendente nunca veem informações diferentes.

**O que mudaria:** nada. Se surgir a necessidade de um estado novo (ex.: "em
produção"), ele entra como resultado da função, não como campo.

---

## 2. Sem tabela de variações

O briefing especifica quantidade em estoque por peça, não por aro. Tamanho vive
em `products.dimensions` (texto livre) e na etapa 3 de "Monte sua peça".

**O que mudaria:** se a PR Gold passar a controlar estoque por numeração de
anel, isso vira uma migration `product_variants` com `UNIQUE (product_id,
label)` e `CHECK (stock >= 0)`. O desenho atual não impede — só não paga o custo
antes da hora.

---

## 3. Leitura pública filtrada na política, não no código

`products` só é legível publicamente quando `active = true and archived_at is
null`. O padrão mais comum (`using (true)` + filtrar na aplicação) deixa
qualquer pessoa com a anon key ler peças ocultas e arquivadas, **com preço**,
direto pela API REST do Supabase.

O painel usa o cliente autenticado, então continua enxergando tudo.

---

## 4. Service role fora de produção

O upload de imagem do painel roda com a **sessão do administrador**, por uma
política de Storage (migration 0004) que exige `is_admin()`. A chave secreta
fica só na máquina de desenvolvimento, para scripts.

**Por quê:** a alternativa (service role numa Server Action) obriga a colocar
uma chave que ignora toda a RLS no servidor de produção, para resolver um
problema que a política de Storage já resolve.

A imagem de referência de "Monte sua peça" é a única escrita pública em
Storage, restrita à pasta `referencias/` (migration 0005), com tipo e tamanho
validados na Server Action antes de chegar lá.

---

## 5. Modo demonstração explícito

Sem as variáveis do Supabase, `services/` cai para `data/demo/` e `DEMO_MODE`
fica `true`. O painel mostra uma faixa vermelha e todas as actions de escrita
recusam com uma mensagem explicando o que falta.

**Por quê:** permite revisar o site inteiro — inclusive o painel — antes de
existir projeto Supabase, sem que ninguém confunda o catálogo de demonstração
com o real. "Faixa vermelha em produção" é um item de bloqueio do checklist.

---

## 6. Classes de componente dentro de `@layer components`

Todo CSS próprio de `app/globals.css` vive em `@layer components`.

**Por quê:** CSS sem camada vence CSS em camada, independentemente de
especificidade. Como as utilitárias do Tailwind ficam na camada `utilities`,
uma classe solta como `.trilho { display: flex }` passava por cima de um
`md:grid` aplicado no mesmo elemento — e a grade de categorias ficou com
largura zero no desktop. O bug não era de layout, era de camada.

**Regra derivada:** nunca declarar `display` em dois lugares para o mesmo
elemento. Quando o layout muda por breakpoint, a media query fica no CSS
(ver `.faixa-categorias`).

---

## 7. `useSyncExternalStore` para o que é do navegador

Favoritos, buscas recentes e posição de rolagem são estado **externo** ao
React. Lê-los com `useState` + `useEffect` no mount dispara um render em
cascata a cada montagem — que é o que a regra `react-hooks/set-state-in-effect`
do React 19 aponta.

`hooks/useArmazenamentoLocal.ts` guarda a referência do valor em cache: sem
isso, `getSnapshot` devolveria um array novo a cada chamada e o React entraria
em laço de render.

---

## 8. Um elemento fixo por tela no rodapé

Ou a barra de navegação, ou o CTA de consulta — nunca os dois. Na página de
produto a tab bar global desaparece e o rodapé pertence ao botão do WhatsApp.

**Por quê:** duas barras fixas empilhadas comem cerca de um terço da tela útil
de um celular.

---

## 9. Dois tokens de dourado, e a escolha não é estética

`--color-ouro` (#D4AF37) só sobre fundo escuro; `--color-ouro-escuro` (#77621F)
para texto sobre fundo claro. Componentes recebem `tone` como prop e nunca
adivinham o fundo em que estão.

Os valores foram **medidos**: #D4AF37 sobre marfim dá 1,85:1 e reprova em
qualquer tamanho. O tom escuro nasceu como #8F6C22, media 4,26:1 — abaixo do
mínimo de 4,5 — e foi corrigido.

---

## 10. Nomes de marcas de terceiros ficam fora do site

As legendas do perfil oficial descrevem alguns modelos como "inspiração
Cartier", "inspiração Tiffany", "inspiração Van Cleef" e "inspiração
D'Hermés", e usam "corrente Cartier" como nome de elo.

O site usa o vocabulário corrente da joalheria brasileira — **elo cadeado** — e
nove fotos que exibem desenho reconhecidamente registrado por outra maison
ficaram fora do catálogo de demonstração (`scripts/curadoria.mjs` registra
quais e por quê).

**O que mudaria:** é uma decisão comercial e jurídica da PR Gold, não técnica.
Se a loja quiser essas peças na vitrine, elas voltam editando a curadoria — mas
vale conversar com um advogado antes.

---

## 11. Vídeo de ambiente respeita "reduzir animações"

Os laços do hero e da seção "A marca" ficam parados no poster quando o sistema
pede menos movimento. É o que o briefing exige em acessibilidade.

**Isso tem uma consequência prática que confunde:** o Windows costuma vir com
"Mostrar animações no Windows" desligado, e o Chrome traduz isso em
`prefers-reduced-motion: reduce`. Nessa máquina o hero aparece parado, e parece
um vídeo quebrado quando na verdade é a preferência sendo obedecida.

Por isso a decisão virou uma chave em `config/site.ts`
(`midia.respeitarMovimentoReduzido`). O projeto irmão (PR Grife) optou pelo
contrário — manter o movimento sempre — e o argumento dele é legítimo: o vídeo
de ambiente é a apresentação da marca. Trocar aqui é uma linha.

---

## 12. Logo recortada por rampa de luminância

O brasão veio em JPG sobre fundo preto. `scripts/prepara-logo.mjs` deriva o
canal alfa da luminância, com PISO e TETO em vez de um ganho linear.

**Por quê:** o fundo do JPG tem grão, oscilando em torno de luminância 20. Com
ganho linear, ou sobrava um quadrado escuro em volta do brasão no cabeçalho, ou
o corte forte o bastante para limpá-lo começava a comer as partes escuras do
degradê dourado. A rampa com limiar separa as duas coisas.

O brasão é servido em 3× o tamanho de exibição: coroa de louros, diamante e
"SINCE 2019" são traço fino demais para 1×.

---

## 13. Migrations sem `schema.sql` de baseline

Só existem migrations numeradas, todas idempotentes. Não há um `schema.sql`
duplicando o mesmo conteúdo.

**Por quê:** manter baseline e migrations em sincronia à mão é uma fonte de
divergência silenciosa. Com cinco arquivos idempotentes, "montar do zero" e
"atualizar" são o mesmo procedimento.
