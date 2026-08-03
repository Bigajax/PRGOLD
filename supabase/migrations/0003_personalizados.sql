-- ============================================================================
-- PR Gold — 0003: solicitações de peça personalizada
-- ============================================================================
-- COMO RODAR: cole no SQL Editor do Supabase e execute UMA vez, depois da 0002.
--
-- Esta é a única tabela em que o visitante anônimo ESCREVE. Vale a regra das
-- "caixas de entrada": o público deposita, nunca lê de volta.
-- ============================================================================

create table if not exists public.custom_requests (
  id              uuid primary key default gen_random_uuid(),

  -- Etapa 1 — tipo de peça
  piece_type      text not null,
  -- Etapa 2 — estilo
  style           text,
  -- Etapa 3 — material e detalhes
  gold_type       text check (gold_type in ('amarelo', 'branco', 'rose')),
  stones          text,
  engraving       text,
  finish          text,
  size            text,
  notes           text,
  -- Etapa 4 — referência
  reference_image text,

  -- Etapa 5 — contato
  name            text not null check (char_length(trim(name)) >= 2),
  whatsapp        text not null check (char_length(regexp_replace(whatsapp, '\D', '', 'g')) between 10 and 13),
  city            text,
  email           text,
  message         text,

  status          text not null default 'nova' check (
    status in (
      'nova', 'em-atendimento', 'orcamento-enviado',
      'aguardando-aprovacao', 'em-producao', 'finalizada', 'cancelada'
    )
  ),
  origin          text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  -- Tetos de tamanho: campo de texto livre sem limite vira depósito, e um
  -- POST público sem limite vira vetor de abuso.
  constraint custom_requests_limites check (
    char_length(piece_type) <= 60
    and char_length(coalesce(style, '')) <= 60
    and char_length(coalesce(stones, '')) <= 120
    and char_length(coalesce(engraving, '')) <= 120
    and char_length(coalesce(finish, '')) <= 60
    and char_length(coalesce(size, '')) <= 60
    and char_length(coalesce(notes, '')) <= 800
    and char_length(name) <= 120
    and char_length(coalesce(city, '')) <= 120
    and char_length(coalesce(email, '')) <= 160
    and char_length(coalesce(message, '')) <= 800
  )
);

create index if not exists custom_requests_painel_idx
  on public.custom_requests (status, created_at desc);

drop trigger if exists custom_requests_updated_at on public.custom_requests;
create trigger custom_requests_updated_at
  before update on public.custom_requests
  for each row execute function public.set_updated_at();

-- ============================================================================
-- RLS — caixa de entrada
-- ============================================================================

alter table public.custom_requests enable row level security;

-- O visitante deposita a solicitação...
drop policy if exists custom_requests_public_insert on public.custom_requests;
create policy custom_requests_public_insert
  on public.custom_requests for insert
  with check (
    -- ...mas não escolhe o próprio status nem a data. Sem esta checagem, um
    -- POST forjado poderia nascer "finalizada" e sumir da fila do lojista.
    status = 'nova'
  );

-- ...e nunca lê de volta. Dados pessoais de quem pediu uma joia só são
-- visíveis para o administrador autenticado.
drop policy if exists custom_requests_admin_read on public.custom_requests;
create policy custom_requests_admin_read
  on public.custom_requests for select to authenticated using (public.is_admin());

drop policy if exists custom_requests_admin_update on public.custom_requests;
create policy custom_requests_admin_update
  on public.custom_requests for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Sem política de DELETE, de propósito: solicitação de cliente não se apaga,
-- se cancela. O status 'cancelada' existe exatamente para isso.
