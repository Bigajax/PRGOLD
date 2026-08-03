# Materiais e definições pendentes — PR Gold

Tudo que o site já tem veio de fonte verificável: o perfil oficial
`@prgold_oficial` (fotos, legendas e bio). Nada nesta lista foi inventado para
"preencher"; o que falta está descrito exatamente como falta.

Enquanto houver item crítico aberto, o site **não deve ser publicado**.

---

## 1. Crítico — impede a publicação

### Confirmar o WhatsApp de atendimento

Hoje configurado: **5544998788108** (`config/site.ts`).

De onde veio: a própria PR Gold publica `Orçamentos 44998788108` nas legendas
de dezenas de posts do perfil oficial. O DDD 44 confere com Maringá-PR, cidade
informada na bio.

O que falta: confirmação **por escrito** de que o atendimento do site vai para
esse número. Se a loja usa um número diferente para o site, é uma linha em
`config/site.ts` (ou o campo `whatsapp` no painel).

Depois de confirmar: fazer o teste de ponta a ponta — abrir uma peça no
celular, tocar em "Consultar esta joia", **enviar** a mensagem e conferir como
ela chegou, no aparelho do atendente **e** no WhatsApp Desktop do Windows.

### Logotipo — recebido, mas em bitmap

**Resolvido para uso imediato.** A PR Gold forneceu o brasão oficial em JPG
1080 × 1080 (monograma PR, coroa de louros, diamante e "SINCE 2019"), sobre
fundo preto. `scripts/prepara-logo.mjs` recorta o fundo e gera cabeçalho,
rodapé, favicon, ícone de aplicativo e imagem de compartilhamento.

A marca **não foi redesenhada**: o script só recorta e redimensiona.

**Ainda vale pedir o arquivo vetorial (SVG, AI ou PDF).** O bitmap resolve
todos os tamanhos que o site usa hoje, mas um brasão com traço fino como este
perde definição em qualquer aplicação maior — impressão, embalagem, fachada — e
o recorte do fundo, por melhor que esteja, sempre carrega o grão do JPG
original.

### Domínio

`NEXT_PUBLIC_SITE_URL` está apontando para `localhost`. Sem o domínio final,
canonical, sitemap e a prévia de link no WhatsApp saem quebrados.

---

## 2. Dados institucionais (ficam ocultos enquanto não chegarem)

O site foi construído para **omitir** o que não foi confirmado, em vez de
mostrar texto genérico. Cada item abaixo simplesmente não aparece hoje:

- **Endereço** — mostrar endereço completo, só "Maringá - PR", ou nada?
- **Horário de atendimento**
- **E-mail de contato** — um e-mail real, ou decidir ocultar o campo
- **Razão social e CNPJ** — para o rodapé
- **Formas de pagamento e de entrega** aceitas
- **Prazo real de encomenda** (`config/catalogo.ts`). Enquanto vazio, peças sob
  encomenda dizem "o prazo é confirmado no atendimento", sem prometer número.

Todos são editáveis pelo painel em `/admin/configuracoes`.

---

## 3. Conteúdo do catálogo

O catálogo atual tem **42 peças de demonstração**, montadas a partir de fotos e
legendas publicadas pela própria PR Gold. Para virar catálogo real falta:

- **Preço de cada peça.** Nenhuma peça tem preço: a PR Gold não publica valores,
  e o site exibe "Valor sob consulta" em todas. Isso funciona, mas preço visível
  converte melhor.
- **Disponibilidade real.** Hoje toda peça mostra "Consulte disponibilidade".
  No painel, basta informar a quantidade em estoque ou marcar "aceita
  encomenda" para o selo mudar sozinho.
- **Peso, comprimento e largura das peças que não têm.** O que existe veio das
  legendas; as demais estão em branco e a ficha técnica encolhe sozinha.
- **Fotos oficiais em alta.** As atuais são as originais do Instagram
  (de 941 × 1254 a 2268 × 3024 px). Servem bem, mas fotos de estúdio em
  resolução maior melhoram a página de produto.
- **Brincos.** O briefing prevê a categoria, mas não há nenhuma foto de brinco
  no perfil. A categoria só aparece quando existir peça — não criamos vitrine
  vazia.
- **Nomes definitivos das coleções.** Hoje: Alianças, Fé, Personalizados,
  Presentes. São nomes administrativos, todos editáveis pelo painel.

### Decisão pendente: peças que reproduzem desenho de outras marcas

As legendas do perfil descrevem alguns braceletes como "inspiração Cartier",
"inspiração Tiffany", "inspiração Van Cleef" e "inspiração D'Hermés", e os
destaques do perfil usam esses nomes como títulos.

O que foi feito:

1. **Nenhum nome de marca de terceiro entra no site.** Onde a legenda usava a
   marca como nome do elo ("corrente Cartier"), o site usa o termo corrente da
   joalheria brasileira: **elo cadeado**.
2. **Nove fotos ficaram fora do catálogo de demonstração** por exibirem um
   elemento de desenho reconhecidamente registrado por outra maison
   (bracelete com parafusos, aplique em T, aplique floral, fecho em H). Uma
   delas traz "Inspiração Cartier" gravado na própria imagem.

Essa é uma decisão comercial e jurídica da PR Gold, não técnica. Se a loja
quiser essas peças na vitrine, elas voltam editando `scripts/curadoria.mjs` —
mas vale conversar com um advogado antes.

Também ficou fora a foto com **etiqueta de preço manuscrita** visível.

---

### Vídeos da marca

Três publicações do perfil oficial já estão no site, reencodadas para a web
(720p, sem áudio, com poster):

| Onde | Post de origem |
|---|---|
| Hero, à esquerda | `instagram.com/p/DaV4F3rBYLg` |
| Hero, à direita | `instagram.com/p/DN6Yu3lEQPM` |
| Seção "A marca" | `instagram.com/p/DZ4okx8RNQc` |

O segundo vídeo do hero só existe em 360 × 640 no Instagram (é um post mais
antigo). Ele funciona no tamanho em que aparece, mas se a PR Gold tiver o
arquivo original em alta, vale substituir.

Para trocar qualquer um: coloque o arquivo em `_fotos-ig/`, rode
`node scripts/prepara-videos.mjs` e aponte o novo nome em `config/site.ts`.

---

## 4. Textos a validar

Estão no ar como provisórios, marcados `TODO_CONFIRMAR` em `config/textos.ts`:

- **Texto do "Sobre".** O que é confirmado: "desde 2019", "joalheria com
  confecção própria" e "somente joias em ouro" — tudo da bio oficial. O resto
  do parágrafo é provisório.
- **Ano de fundação: 2019 ou 2015?** A bio oficial diz "DESDE 2019", e é isso
  que está em `site.foundedYear` e no rodapé. Mas a marca-d'água do próprio
  logotipo, visível nas fotos do perfil, diz **"SINCE 2015"**. Os dois números
  vêm da PR Gold e se contradizem. Confirmar qual vale antes de publicar.
- **Benefícios da seção "Experiência PR Gold".** Os quatro atuais só afirmam o
  que a marca já comunica. Nenhum menciona certificação, garantia, prazo ou
  cobertura — isso exigiria confirmação.
- **Política de privacidade.** O texto publicado é um modelo demonstrativo e
  **precisa de revisão profissional** antes de ir ao ar. Está sinalizado na
  própria página.

### Imagem da seção "Monte sua peça" — removida

`public/images/ilustracoes/sob-medida.webp` **não é foto de peça da PR Gold** —
é imagem gerada por IA, aprovada como referência visual. Ficou publicada por um
tempo com a legenda visível "Imagem ilustrativa", justamente porque quem vê uma
joia numa vitrine assume que pode comprá-la.

**Saiu da home a pedido do cliente.** A seção agora é só texto e as quatro
etapas. O arquivo continua em `public/images/ilustracoes/` e não é referenciado
por nenhum componente.

**Quando a PR Gold enviar foto real de uma peça personalizada**, ela entra nessa
coluna — e aí sem legenda de ressalva, porque será peça da casa.

### Imagens da faixa de elos — geradas por IA, sem ressalva na tela

Os seis ladrilhos de `public/images/elos/` (`romana-quadrada`, `elo-cadeado`,
`grumet`, `portuguesa`, `lacraia`, `escapulario`) **não são fotos de peças da PR
Gold**. São renders gerados por IA, recortados de duas imagens de 1536x1024
enviadas pelo cliente — corte de 512x280 por elo, topo em 300px na primeira
imagem e 328px na segunda, que trazia o conjunto mais baixo.

A faixa entrou com a legenda "Imagens ilustrativas dos tipos de elo", **removida
a pedido do cliente**. Fica o registro: são ilustrações do TIPO de elo, e a
pessoa que clicar vai ver peças reais que podem não ter exatamente aquele
desenho. Confirmar com a PR Gold se cada render representa fielmente o elo que
leva o nome — principalmente "romana quadrada" e "lacraia".

O rótulo está desenhado dentro da imagem, então não é texto: não é buscável, não
é traduzível e não acompanha mudança de nome. O nome acessível vem do `alt`, que
sai de `ELOS_VITRINE.rotulo` em `config/catalogo.ts`. Note que o render escreve
"ESCAPULARIO" sem acento.

**Substituir por fotos reais dos elos** assim que a loja fotografar — é trocar
os seis arquivos, mantendo o corte 512x280.

### Faixa de garantias da seção "Monte sua peça"

A referência de layout aprovada trazia quatro selos: *ouro 18K certificado*,
*ajuste perfeito*, *entrega segura e discreta* e *garantia vitalícia da
autenticidade*. **Nenhum deles foi publicado** — são afirmações de certificação,
política de ajuste, frete e garantia, e a regra do projeto proíbe inventá-las.

No lugar entraram quatro itens que a loja já cumpre ou já declara: "Sem
compromisso", "Resposta no WhatsApp", "Confecção própria" e "Somente ouro 18K"
(`textos.montePeca.garantias`).

Para publicar os selos originais, a PR Gold precisa confirmar, por escrito:

| Selo | O que precisa ser confirmado |
|---|---|
| Ouro 18K certificado | Quem emite o certificado e o que ele atesta |
| Ajuste perfeito | Existe reajuste de aro/tamanho? É gratuito? Tem prazo? |
| Entrega segura e discreta | Transportadora, cobertura, seguro, prazo |
| Garantia vitalícia | Prazo real, o que cobre e o que exclui |

---

## 5. Acesso e infraestrutura

- Projeto Supabase criado e as migrations 0001 a 0004 aplicadas
  (ver `supabase/README.md`)
- Cadastro público desativado no Supabase Auth
- Usuário administrador criado e autorizado em `admin_profiles`
- `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` na Vercel,
  em Production **e** Preview
- Conta da Vercel e do Supabase preferencialmente **no nome da PR Gold**, com
  seu acesso — e não o contrário
