-- ============================================================================
-- PR Gold — 0005: imagem de referência das peças personalizadas
-- ============================================================================
-- COMO RODAR: cole no SQL Editor do Supabase e execute UMA vez, depois da 0004.
--
-- A etapa 4 de "Monte sua peça" permite anexar uma foto de referência. Quem
-- envia é um visitante anônimo, então esta é a ÚNICA escrita pública em
-- Storage do projeto — e ela é estreita de propósito:
--
--   - só o bucket `pr-gold`
--   - só dentro da pasta `referencias/`
--   - sem leitura de listagem, sem update, sem delete
--
-- A validação de tamanho (8 MB) e de tipo (jpeg/png/webp/avif) acontece na
-- Server Action ANTES de chegar aqui. Esta política é a segunda camada, não a
-- única: ela garante que nem um payload forjado escreva fora da pasta.
--
-- Se a PR Gold preferir receber a foto direto na conversa do WhatsApp, basta
-- não rodar esta migration: o formulário continua funcionando e apenas deixa
-- de oferecer o anexo.
-- ============================================================================

drop policy if exists pr_gold_referencia_publica on storage.objects;
create policy pr_gold_referencia_publica
  on storage.objects for insert to anon
  with check (
    bucket_id = 'pr-gold'
    and (storage.foldername(name))[1] = 'referencias'
  );
