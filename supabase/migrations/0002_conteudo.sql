-- ============================================================================
-- PR Gold — 0002: conteúdo editável da vitrine
-- ============================================================================
-- COMO RODAR: cole no SQL Editor do Supabase e execute UMA vez, depois da 0001.
--
-- Cria: banners, benefits, instagram_gallery, moments, site_settings.
-- Tudo aqui é o que o lojista muda sem chamar o desenvolvedor.
-- ============================================================================

-- ── Banners do hero ────────────────────────────────────────────────────────
-- Desktop e mobile são obrigatoriamente artes SEPARADAS: uma arte panorâmica
-- recortada para 1080x1350 fica ilegível, e é o erro mais comum desta tela.

create table if not exists public.banners (
  id             uuid primary key default gen_random_uuid(),
  title          text not null default '',
  subtitle       text,
  image_desktop  text not null,
  image_mobile   text,
  cta_label      text,
  link           text,
  align          text not null default 'left' check (align in ('left', 'center', 'right')),
  -- Intensidade do véu escuro sobre a foto (0-100). Existe porque a foto da
  -- PR Gold já é escura: às vezes o texto precisa de menos véu, não de mais.
  overlay        integer not null default 40 check (overlay between 0 and 100),
  position       integer not null default 0,
  active         boolean not null default true,
  starts_at      timestamptz,
  ends_at        timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),

  constraint banners_janela_valida check (
    starts_at is null or ends_at is null or ends_at > starts_at
  )
);

create index if not exists banners_ordem_idx on public.banners (active, position);

drop trigger if exists banners_updated_at on public.banners;
create trigger banners_updated_at
  before update on public.banners
  for each row execute function public.set_updated_at();

-- ── Benefícios (seção "Experiência PR Gold") ───────────────────────────────
-- `icon` guarda o nome de um ícone do lucide-react. A aplicação valida contra
-- uma lista fechada e cai num ícone padrão se o nome não existir — nunca
-- quebra a página por causa de um nome digitado errado.

create table if not exists public.benefits (
  id          uuid primary key default gen_random_uuid(),
  icon        text not null default 'Sparkles',
  title       text not null,
  description text,
  position    integer not null default 0,
  active      boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists benefits_ordem_idx on public.benefits (active, position);

drop trigger if exists benefits_updated_at on public.benefits;
create trigger benefits_updated_at
  before update on public.benefits
  for each row execute function public.set_updated_at();

-- ── Galeria do Instagram ───────────────────────────────────────────────────
-- Curadoria MANUAL de propósito: nada aqui depende da API do Instagram, que
-- exige token com validade e derruba a seção quando expira.

create table if not exists public.instagram_gallery (
  id         uuid primary key default gen_random_uuid(),
  image      text not null,
  post_url   text,
  alt        text,
  position   integer not null default 0,
  active     boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists instagram_ordem_idx
  on public.instagram_gallery (active, position);

drop trigger if exists instagram_updated_at on public.instagram_gallery;
create trigger instagram_updated_at
  before update on public.instagram_gallery
  for each row execute function public.set_updated_at();

-- ── Momentos (ocasiões) ────────────────────────────────────────────────────
-- Cada ocasião é um atalho nomeado para um recorte do catálogo. `filter_query`
-- é a query string aplicada, ex.: "categoria=aliancas".

create table if not exists public.moments (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  name         text not null,
  description  text,
  image        text,
  filter_query text not null default '',
  position     integer not null default 0,
  active       boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists moments_ordem_idx on public.moments (active, position);

drop trigger if exists moments_updated_at on public.moments;
create trigger moments_updated_at
  before update on public.moments
  for each row execute function public.set_updated_at();

-- ── Configurações da loja ──────────────────────────────────────────────────
-- Chave/valor. Só entra aqui o que muda toda semana; o que muda todo semestre
-- (nome da marca, URL canônica, identidade visual) fica no código.

create table if not exists public.site_settings (
  key        text primary key,
  value      text not null default '',
  label      text not null default '',
  "group"    text not null default 'geral',
  updated_at timestamptz not null default now(),
  updated_by text
);

drop trigger if exists site_settings_updated_at on public.site_settings;
create trigger site_settings_updated_at
  before update on public.site_settings
  for each row execute function public.set_updated_at();

-- Chaves esperadas pela aplicação. Valor vazio = a aplicação usa o fallback de
-- config/site.ts e NÃO exibe o campo. Nada aqui nasce preenchido: preencher
-- com dado inventado é exatamente o que este projeto não faz.
insert into public.site_settings (key, value, label, "group") values
  ('whatsapp',                 '', 'WhatsApp (só dígitos, com DDI e DDD)', 'contato'),
  ('whatsapp_default_message', '', 'Mensagem padrão do WhatsApp',          'contato'),
  ('instagram_handle',         '', 'Instagram (sem @)',                    'contato'),
  ('instagram_url',            '', 'URL do Instagram',                     'contato'),
  ('email',                    '', 'E-mail de contato',                    'contato'),
  ('address',                  '', 'Endereço',                             'contato'),
  ('city',                     '', 'Cidade',                               'contato'),
  ('business_hours',           '', 'Horário de atendimento',               'contato'),
  ('top_bar_text',             '', 'Texto da barra superior',              'textos'),
  ('top_bar_cta_label',        '', 'Texto do link da barra superior',      'textos'),
  ('about_title',              '', 'Título da seção Sobre',                'textos'),
  ('about_text',               '', 'Texto da seção Sobre',                 'textos'),
  ('footer_tagline',           '', 'Frase institucional do rodapé',        'textos'),
  ('legal_name',               '', 'Razão social',                         'legal'),
  ('legal_document',           '', 'CNPJ',                                 'legal'),
  ('seo_title',                '', 'Título para buscadores',               'seo'),
  ('seo_description',          '', 'Descrição para buscadores',            'seo')
on conflict (key) do nothing;

-- ============================================================================
-- RLS
-- ============================================================================

alter table public.banners enable row level security;
alter table public.benefits enable row level security;
alter table public.instagram_gallery enable row level security;
alter table public.moments enable row level security;
alter table public.site_settings enable row level security;

-- Banners: o público só enxerga o que está ativo E dentro da janela agendada.
drop policy if exists banners_public_read on public.banners;
create policy banners_public_read
  on public.banners for select
  using (
    active = true
    and (starts_at is null or starts_at <= now())
    and (ends_at is null or ends_at >= now())
  );

drop policy if exists banners_admin_read on public.banners;
create policy banners_admin_read
  on public.banners for select to authenticated using (public.is_admin());

drop policy if exists banners_admin_write on public.banners;
create policy banners_admin_write
  on public.banners for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Benefícios
drop policy if exists benefits_public_read on public.benefits;
create policy benefits_public_read
  on public.benefits for select using (active = true);

drop policy if exists benefits_admin_read on public.benefits;
create policy benefits_admin_read
  on public.benefits for select to authenticated using (public.is_admin());

drop policy if exists benefits_admin_write on public.benefits;
create policy benefits_admin_write
  on public.benefits for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Instagram
drop policy if exists instagram_public_read on public.instagram_gallery;
create policy instagram_public_read
  on public.instagram_gallery for select using (active = true);

drop policy if exists instagram_admin_read on public.instagram_gallery;
create policy instagram_admin_read
  on public.instagram_gallery for select to authenticated using (public.is_admin());

drop policy if exists instagram_admin_write on public.instagram_gallery;
create policy instagram_admin_write
  on public.instagram_gallery for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Momentos
drop policy if exists moments_public_read on public.moments;
create policy moments_public_read
  on public.moments for select using (active = true);

drop policy if exists moments_admin_read on public.moments;
create policy moments_admin_read
  on public.moments for select to authenticated using (public.is_admin());

drop policy if exists moments_admin_write on public.moments;
create policy moments_admin_write
  on public.moments for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Configurações: leitura pública porque são os dados públicos da loja
-- (WhatsApp, endereço, horário). Nenhuma chave sensível entra nesta tabela.
drop policy if exists site_settings_public_read on public.site_settings;
create policy site_settings_public_read
  on public.site_settings for select using (true);

drop policy if exists site_settings_admin_write on public.site_settings;
create policy site_settings_admin_write
  on public.site_settings for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
