# PR Gold — Vitrine digital

Vitrine digital da PR Gold, joalheria de ouro com confecção própria em
Maringá-PR. O site apresenta as peças, organiza o catálogo por categoria e
coleção, permite salvar favoritos e solicitar uma joia personalizada — e leva
toda a conversão para o WhatsApp.

**Não é uma loja com pagamento online.** Não há checkout, carrinho de pagamento
nem cadastro de visitante. O botão abre uma conversa, não conclui uma compra.

---

## Stack

| Camada | Escolha |
|---|---|
| Framework | Next.js 16.2 (App Router, Turbopack) |
| Linguagem | TypeScript 5 |
| Estilo | Tailwind CSS 4 (tokens no `@theme` de `app/globals.css`, sem `tailwind.config`) |
| Banco, auth e arquivos | Supabase (PostgreSQL + Auth + Storage) |
| Validação | Zod 4 |
| Ícones | lucide-react |
| Deploy | Vercel |

> O Next 16 mudou convenções importantes: `middleware.ts` virou `proxy.ts`,
> `revalidateTag` passou a exigir um segundo argumento e `params`/`searchParams`
> são assíncronos. Antes de mexer no código, leia o guia correspondente em
> `node_modules/next/dist/docs/` — é o que o `AGENTS.md` instrui.

---

## Como instalar

Requisitos: Node.js 20.9 ou superior.

```bash
npm install
cp .env.example .env.local   # copie, não renomeie
npm run dev                  # http://localhost:3000
```

**O site sobe mesmo sem banco configurado.** Nesse estado ele roda em *modo
demonstração*: o catálogo vem de `data/demo/` e o painel exibe uma faixa
vermelha avisando que nada será salvo. Isso existe para o site poder ser
revisado inteiro antes de o projeto Supabase existir — e a faixa vermelha em
produção é um item de bloqueio do checklist de publicação.

### Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` | Desenvolvimento |
| `npm run build` | Build de produção |
| `npm run start` | Serve o build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run format` | Prettier |
| `npm run fotos:otimizar` | Reprocessa o acervo de imagens a partir de `_fotos-ig/` |
| `node scripts/prepara-logo.mjs` | Regera logo, favicon e ícones a partir do brasão oficial |
| `node scripts/prepara-videos.mjs` | Reencoda os vídeos de `_fotos-ig/` para a web (720p, sem áudio, com poster) |

---

## Como configurar o Supabase

O passo a passo completo, com os comandos de verificação da RLS, está em
[`supabase/README.md`](supabase/README.md). Resumo:

1. Crie o projeto na região **sa-east-1 (São Paulo)**.
2. Rode as migrations no SQL Editor, **uma vez cada e nesta ordem**:
   `0001_catalogo` → `0002_conteudo` → `0003_personalizados` → `0004_storage` →
   `0005_referencias`.
3. Em **Authentication → Providers → Email**, desmarque *Allow new users to
   sign up*.
4. Em **Authentication → Users → Add user**, crie a conta da PR Gold com
   *Auto Confirm* marcado.
5. Autorize essa conta como administradora (SQL em `supabase/README.md`).
   Criar o usuário **não** basta: sem linha em `admin_profiles`, o painel
   recusa qualquer escrita.
6. Preencha o `.env.local` e reinicie o servidor.

---

## Variáveis de ambiente

| Variável | Onde | Para que serve |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | local + Vercel (produção e preview) | Endereço do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | local + Vercel (produção e preview) | Chave pública; a segurança dela depende 100% da RLS |
| `NEXT_PUBLIC_SITE_URL` | local + Vercel | URL final do site (canonical, OG, sitemap) |
| `SUPABASE_SERVICE_ROLE_KEY` | **somente local** | Scripts de carga. Ignora a RLS |

**Decisão registrada deste projeto: a service role NÃO vai para a Vercel.** O
upload de imagens do painel roda com a sessão do próprio administrador, por uma
política de Storage (migration 0004). A chave secreta só é necessária em
scripts locais.

---

## Como acessar o painel

`/admin` — o link não aparece na navegação pública, de propósito.

A proteção tem quatro camadas independentes:

1. `proxy.ts` barra quem não tem sessão antes de renderizar;
2. o layout do painel revalida a sessão no servidor;
3. **toda** Server Action chama `requireUser()` antes de escrever;
4. a RLS do banco só aceita escrita de quem passa em `is_admin()`.

Esconder um botão na tela não protege nada — por isso a validação se repete nas
quatro.

---

## Como cadastrar produtos

**Produtos → Nova peça.** O formulário tem quatro abas e o botão salvar fica
sempre visível, inclusive no celular.

- **Peça** — nome, código, categoria, coleção, descrições, preço e
  disponibilidade.
- **Fotos** — até 8 por peça, 8 MB cada. A primeira é a capa: aparece no
  catálogo e na prévia de compartilhamento. Dá para reordenar e para colar o
  endereço de uma imagem quando o upload não estiver disponível.
- **Ficha técnica** — material, tipo de ouro, quilates, peso, dimensões e
  pedras. **Preencha só o que souber**: campo vazio não aparece na página, e a
  ficha encolhe sozinha.
- **Exibição** — publicada, destaque, novidade, exclusiva, ordem e SEO.

### Duas regras do cadastro que valem entender

**Disponibilidade não é um campo.** Não existe onde escolher "pronta entrega".
O selo é calculado: com estoque maior que zero vira *Pronta entrega*; sem
estoque mas com "aceita encomenda" marcado, vira *Sob encomenda*; sem nenhum
dos dois, *Consulte disponibilidade*. Assim a vitrine nunca promete o que o
estoque não sustenta.

**Sem preço, o site diz "Valor sob consulta".** É o comportamento correto, não
uma falha — inventar valor na vitrine cria a pior conversa possível no
atendimento.

Para tirar uma peça do ar, use **ocultar** (reversível) ou **arquivar** (sai da
vitrine e das contagens, mas continua no painel). *Excluir* apaga de vez, e o
diálogo desencoraja o uso.

---

## Como fazer o deploy

1. `npm run build` local sem erro.
2. Suba o repositório e importe na Vercel.
3. Configure `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` e
   `NEXT_PUBLIC_SITE_URL` em **Production e Preview**. Não configure a service
   role.
4. Aponte o domínio e confirme o HTTPS.
5. Rode o checklist abaixo **no domínio final**.

### Checklist de publicação

- [ ] A faixa vermelha de "modo demonstração" **não** aparece em `/admin`
- [ ] `/admin` em aba anônima redireciona para o login
- [ ] `/robots.txt` bloqueia `/admin` e `/sitemap.xml` responde
- [ ] O WhatsApp foi confirmado por escrito com a PR Gold
- [ ] Teste de ponta a ponta pelo celular: achar uma peça → "Consultar esta
      joia" → **enviar** a mensagem → conferir como ela chegou, no aparelho do
      atendente **e** no WhatsApp Desktop do Windows
- [ ] Nenhum item crítico aberto em [`docs/materiais-pendentes.md`](docs/materiais-pendentes.md)
- [ ] O catálogo de demonstração foi substituído pelo catálogo real

---

## Estrutura

```
app/          rotas (páginas finas: metadata + dados + composição)
components/   ui/ layout/ catalog/ product/ home/ admin/ providers/
config/       site.ts textos.ts nav.ts catalogo.ts   <- fonte única, versionada
data/demo/    catálogo de demonstração (gerado; some quando o banco assume)
services/     acesso a dados, sempre "server-only"
lib/          whatsapp, catálogo em memória, formatação, supabase, validação
types/        um domínio, um arquivo — inclui deriveAvailability()
supabase/     migrations numeradas + README com o passo a passo
scripts/      coleta e otimização do acervo fotográfico
docs/         decisões e materiais pendentes
```

As convenções que o projeto assume estão em [`AGENTS.md`](AGENTS.md); as
decisões de arquitetura, em [`docs/decisoes.md`](docs/decisoes.md).

---

## Origem do conteúdo

Todas as fotos são as originais publicadas pela própria PR Gold em
[@prgold_oficial](https://www.instagram.com/prgold_oficial/) — arquivos do CDN,
sem nenhum elemento de interface do Instagram. Peso, comprimento, largura, tipo
de elo e pedras vieram das legendas escritas pela própria marca.

Nenhum preço, prazo, garantia ou certificação foi inventado. O que a PR Gold
ainda não informou está listado em
[`docs/materiais-pendentes.md`](docs/materiais-pendentes.md) e simplesmente não
aparece no site.
