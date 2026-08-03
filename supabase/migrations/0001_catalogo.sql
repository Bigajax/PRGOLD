-- ============================================================================
-- PR Gold — 0001: catálogo
-- ============================================================================
-- COMO RODAR: cole este arquivo inteiro no SQL Editor do Supabase e execute
-- UMA vez. Rode as migrations em ordem: 0001 -> 0002 -> 0003 -> 0004.
-- O arquivo é idempotente: reexecutar não apaga dados nem duplica objetos.
--
-- Cria: helpers, admin_profiles, categories, collections, products,
--       product_images, com RLS e índices.
--
-- REGRA CENTRAL DO MODELO: não existe coluna de "status" ou "disponibilidade".
-- Disponibilidade é DERIVADA de stock_quantity + ready_to_ship + made_to_order
-- pela função deriveAvailability() em types/index.ts. Se você sentir vontade de
-- criar um campo de status aqui, releia esta linha.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ── Helpers ────────────────────────────────────────────────────────────────

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ── Administradores ────────────────────────────────────────────────────────
-- O Supabase Auth guarda a identidade; esta tabela guarda a AUTORIZAÇÃO.
-- Sem ela, qualquer conta autenticada do projeto seria admin total.

create table if not exists public.admin_profiles (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  name       text not null default '',
  role       text not null default 'operador' check (role in ('dono', 'operador')),
  active     boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.admin_profiles enable row level security;

-- `security definer` é necessário: a policy precisa ler admin_profiles, mas a
-- própria admin_profiles tem RLS. Sem definer, a checagem entraria em recursão.
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.admin_profiles
    where user_id = auth.uid() and active
  );
$$;

drop policy if exists admin_profiles_self_read on public.admin_profiles;
create policy admin_profiles_self_read
  on public.admin_profiles for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists admin_profiles_admin_write on public.admin_profiles;
create policy admin_profiles_admin_write
  on public.admin_profiles for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ── Categorias ─────────────────────────────────────────────────────────────

create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  name        text not null,
  description text,
  image       text,
  position    integer not null default 0,
  active      boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists categories_ordem_idx
  on public.categories (active, position);

drop trigger if exists categories_updated_at on public.categories;
create trigger categories_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();

-- ── Coleções ───────────────────────────────────────────────────────────────

create table if not exists public.collections (
  id             uuid primary key default gen_random_uuid(),
  slug           text not null unique,
  name           text not null,
  description    text,
  image          text,
  banner_desktop text,
  banner_mobile  text,
  position       integer not null default 0,
  active         boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists collections_ordem_idx
  on public.collections (active, position);

drop trigger if exists collections_updated_at on public.collections;
create trigger collections_updated_at
  before update on public.collections
  for each row execute function public.set_updated_at();

-- ── Produtos ───────────────────────────────────────────────────────────────
-- Todo campo de ficha técnica é anulável DE PROPÓSITO. `null` significa "a
-- PR Gold ainda não informou" e a interface simplesmente não renderiza a linha.
-- Preencher com "-" ou "a combinar" é proibido pela regra de não inventar.

create table if not exists public.products (
  id                  uuid primary key default gen_random_uuid(),
  slug                text not null unique,
  code                text not null unique,
  name                text not null check (char_length(name) >= 3),

  short_description   text,
  full_description    text,

  category_id         uuid references public.categories (id) on delete set null,
  collection_id       uuid references public.collections (id) on delete set null,
  gender              text check (gender in ('feminino', 'masculino', 'unissex')),

  -- Ficha técnica
  material            text,
  gold_type           text check (gold_type in ('amarelo', 'branco', 'rose')),
  karat               integer check (karat is null or karat > 0),
  weight_g            numeric(10, 2) check (weight_g is null or weight_g > 0),
  dimensions          text,
  stones              text,

  -- Preço
  price               numeric(10, 2) check (price is null or price > 0),
  promo_price         numeric(10, 2) check (promo_price is null or promo_price > 0),
  price_on_request    boolean not null default true,

  -- Entradas da derivação de disponibilidade (nunca o resultado)
  stock_quantity      integer check (stock_quantity is null or stock_quantity >= 0),
  low_stock_threshold integer check (low_stock_threshold is null or low_stock_threshold >= 0),
  ready_to_ship       boolean not null default false,
  made_to_order       boolean not null default false,

  -- Vitrine
  featured            boolean not null default false,
  new_arrival         boolean not null default false,
  exclusive           boolean not null default false,
  active              boolean not null default true,
  position            integer not null default 0,
  archived_at         timestamptz,

  seo_title           text,
  seo_description     text,

  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),

  -- Oferta invertida é erro de cadastro, não decisão comercial: o "de" precisa
  -- ser maior que o "por", senão o desconto exibido seria mentira.
  constraint products_oferta_valida check (
    promo_price is null or price is null or promo_price < price
  )
);

create index if not exists products_vitrine_idx
  on public.products (active, position, created_at desc);
create index if not exists products_categoria_idx on public.products (category_id);
create index if not exists products_colecao_idx on public.products (collection_id);

drop trigger if exists products_updated_at on public.products;
create trigger products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- ── Imagens do produto ─────────────────────────────────────────────────────
-- position 0 é a capa: card do catálogo, imagem principal da galeria e OG.

create table if not exists public.product_images (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  url        text not null,
  alt        text,
  position   integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists product_images_produto_idx
  on public.product_images (product_id, position);

-- ============================================================================
-- RLS
-- ============================================================================
-- Regra-mestra: o público LÊ o catálogo ativo e nada mais. A leitura pública é
-- filtrada NA POLÍTICA, não só no código — senão qualquer pessoa com a anon
-- key consulta a API REST e lê peças ocultas e arquivadas, com preço.

alter table public.categories enable row level security;
alter table public.collections enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;

-- Categorias
drop policy if exists categories_public_read on public.categories;
create policy categories_public_read
  on public.categories for select using (active = true);

drop policy if exists categories_admin_read on public.categories;
create policy categories_admin_read
  on public.categories for select to authenticated using (public.is_admin());

drop policy if exists categories_admin_write on public.categories;
create policy categories_admin_write
  on public.categories for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Coleções
drop policy if exists collections_public_read on public.collections;
create policy collections_public_read
  on public.collections for select using (active = true);

drop policy if exists collections_admin_read on public.collections;
create policy collections_admin_read
  on public.collections for select to authenticated using (public.is_admin());

drop policy if exists collections_admin_write on public.collections;
create policy collections_admin_write
  on public.collections for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Produtos
drop policy if exists products_public_read on public.products;
create policy products_public_read
  on public.products for select
  using (active = true and archived_at is null);

drop policy if exists products_admin_read on public.products;
create policy products_admin_read
  on public.products for select to authenticated using (public.is_admin());

drop policy if exists products_admin_write on public.products;
create policy products_admin_write
  on public.products for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Imagens: seguem a visibilidade do produto ao qual pertencem.
drop policy if exists product_images_public_read on public.product_images;
create policy product_images_public_read
  on public.product_images for select
  using (
    exists (
      select 1 from public.products p
      where p.id = product_id and p.active = true and p.archived_at is null
    )
  );

drop policy if exists product_images_admin_read on public.product_images;
create policy product_images_admin_read
  on public.product_images for select to authenticated using (public.is_admin());

drop policy if exists product_images_admin_write on public.product_images;
create policy product_images_admin_write
  on public.product_images for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
