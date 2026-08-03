# Banco de dados — PR Gold

Supabase (PostgreSQL + Auth + Storage). Não há CLI configurada: as migrations
são aplicadas **manualmente pelo SQL Editor do Supabase**, o que torna a ordem
e o registro de execução responsabilidade de quem roda.

## Ordem de execução

Rode **uma vez cada**, nesta ordem:

| # | Arquivo | O que cria |
|---|---|---|
| 1 | `migrations/0001_catalogo.sql` | helpers, `admin_profiles`, `categories`, `collections`, `products`, `product_images`, RLS e índices |
| 2 | `migrations/0002_conteudo.sql` | `banners`, `benefits`, `instagram_gallery`, `moments`, `site_settings` |
| 3 | `migrations/0003_personalizados.sql` | `custom_requests` (caixa de entrada pública) |
| 4 | `migrations/0004_storage.sql` | bucket `pr-gold` e políticas de Storage |

Todos os arquivos são idempotentes (`if not exists`, `drop policy if exists`),
então reexecutar não apaga dados nem duplica objetos. Ainda assim, anote data e
responsável de cada execução.

## Depois das migrations

### 1. Desativar o cadastro público

Supabase → **Authentication → Sign In / Providers → Email** → desmarque
**Allow new users to sign up**.

Sem isso, qualquer pessoa cria conta no projeto. A autorização em si é a tabela
`admin_profiles`, mas desativar o cadastro é a primeira barreira.

### 2. Criar o usuário administrador

Supabase → **Authentication → Users → Add user**:

- e-mail da PR Gold
- senha provisória forte
- marque **Auto Confirm User**

### 3. Autorizar esse usuário como administrador

Criar a conta **não** dá acesso ao painel — `is_admin()` só devolve `true` para
quem tem linha ativa em `admin_profiles`. Rode no SQL Editor, trocando o e-mail:

```sql
insert into public.admin_profiles (user_id, name, role)
select id, 'PR Gold', 'dono'
from auth.users
where email = 'ENDERECO@DA-PR-GOLD.com'
on conflict (user_id) do nothing;
```

Confirme com:

```sql
select u.email, p.role, p.active
from public.admin_profiles p
join auth.users u on u.id = p.user_id;
```

### 4. Conferir a RLS com a anon key

Troque `SEU-PROJETO` e `ANON_KEY` e rode. O resultado esperado está ao lado.

```bash
# DEVE funcionar — catálogo público
curl "https://SEU-PROJETO.supabase.co/rest/v1/products?select=name" \
  -H "apikey: ANON_KEY"

# DEVE voltar vazio — solicitações de clientes têm dado pessoal
curl "https://SEU-PROJETO.supabase.co/rest/v1/custom_requests?select=*" \
  -H "apikey: ANON_KEY"

# DEVE falhar — o público não escreve no catálogo
curl -X POST "https://SEU-PROJETO.supabase.co/rest/v1/products" \
  -H "apikey: ANON_KEY" -H "Content-Type: application/json" \
  -d '{"slug":"invasao","code":"X","name":"Invasao"}'

# DEVE funcionar — é a caixa de entrada
curl -X POST "https://SEU-PROJETO.supabase.co/rest/v1/custom_requests" \
  -H "apikey: ANON_KEY" -H "Content-Type: application/json" \
  -d '{"piece_type":"anel","name":"Teste","whatsapp":"44999999999"}'
```

Se o terceiro comando **funcionar**, pare tudo: a RLS está aberta.

## Decisões de modelagem

**Não existe coluna de status ou disponibilidade.** Disponibilidade é derivada
de `stock_quantity`, `ready_to_ship` e `made_to_order` por
`deriveAvailability()` em `types/index.ts`. Uma única função alimenta o selo do
card, o badge da página de produto, o filtro, o JSON-LD e a mensagem de
WhatsApp. Criar um campo de status aqui quebraria essa unidade e permitiria que
o site prometesse o que o estoque não sustenta.

**Não existe tabela de variações.** O briefing especifica quantidade em estoque
por peça, não por aro. Tamanho/aro vive em `products.dimensions` (texto) e na
etapa 3 de "Monte sua peça". Se a PR Gold passar a controlar estoque por
numeração de anel, isso vira uma migration `product_variants` — o desenho atual
não impede.

**Leitura pública filtrada na política, não no código.** `products` só é
legível publicamente quando `active = true and archived_at is null`. A
alternativa comum (`using (true)` + filtro na aplicação) deixa qualquer pessoa
com a anon key ler peças ocultas e arquivadas, com preço, pela API REST.

**Sem DELETE em `custom_requests`.** Solicitação de cliente não se apaga: se
cancela. O status `cancelada` existe para isso.

**Service role fora de produção.** O upload de imagem roda com a sessão do
administrador (política de Storage para `authenticated` + `is_admin()`). A
chave secreta só é necessária em scripts locais, e por isso não deve ser
configurada na Vercel.
