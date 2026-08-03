-- ============================================================================
-- PR Gold — 0004: armazenamento de imagens
-- ============================================================================
-- COMO RODAR: cole no SQL Editor do Supabase e execute UMA vez, depois da 0003.
--
-- DECISÃO DE ARQUITETURA REGISTRADA AQUI:
-- o upload do painel roda com a SESSÃO DO ADMINISTRADOR, não com a service
-- role. Por isso as políticas abaixo dão INSERT/UPDATE/DELETE ao papel
-- `authenticated` filtrado por is_admin().
--
-- A alternativa (service role numa Server Action) obrigaria a colocar a chave
-- secreta no servidor de produção. Como não precisamos dela para mais nada,
-- ela fica só na máquina de desenvolvimento, para os scripts de seed.
-- ============================================================================

insert into storage.buckets (id, name, public)
values ('pr-gold', 'pr-gold', true)
on conflict (id) do nothing;

-- Leitura pública: é a vitrine, as fotos precisam abrir para qualquer pessoa.
drop policy if exists pr_gold_public_read on storage.objects;
create policy pr_gold_public_read
  on storage.objects for select
  using (bucket_id = 'pr-gold');

-- Escrita: só administrador autenticado.
drop policy if exists pr_gold_admin_insert on storage.objects;
create policy pr_gold_admin_insert
  on storage.objects for insert to authenticated
  with check (bucket_id = 'pr-gold' and public.is_admin());

drop policy if exists pr_gold_admin_update on storage.objects;
create policy pr_gold_admin_update
  on storage.objects for update to authenticated
  using (bucket_id = 'pr-gold' and public.is_admin())
  with check (bucket_id = 'pr-gold' and public.is_admin());

drop policy if exists pr_gold_admin_delete on storage.objects;
create policy pr_gold_admin_delete
  on storage.objects for delete to authenticated
  using (bucket_id = 'pr-gold' and public.is_admin());
