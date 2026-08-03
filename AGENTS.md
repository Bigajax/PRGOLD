<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# PR Gold — regras do projeto

Vitrine digital de uma joalheria de ouro. **Não é e-commerce**: não existe
checkout, carrinho de pagamento nem cadastro de visitante. Toda conversão
acontece no WhatsApp.

## A regra que vale mais que todas as outras

**Nunca inventar dado da PR Gold.** Preço, peso, quilates, pedras,
disponibilidade, prazo, garantia, certificação, CNPJ, endereço, telefone,
e-mail e horário só aparecem no site se vierem do banco ou do config com valor
confirmado.

Campo sem dado **não renderiza** — não vira "—", não vira "a combinar", não
vira texto genérico. As duas únicas exceções são frases já aprovadas:

- sem preço → `Valor sob consulta`
- sem disponibilidade confirmada → `Consulte disponibilidade`

Qualquer valor ainda não confirmado pela loja fica marcado com
`TODO_CONFIRMAR` no config e listado em `docs/materiais-pendentes.md`.

## Convenções de arquitetura

- **Disponibilidade é derivada, nunca digitada.** Só existe `deriveAvailability()`
  em `types/index.ts`. Não crie coluna nem campo de "status" em lugar nenhum.
- **Prazo de encomenda é da LOJA, não do produto.** Vive em `config/catalogo.ts`.
- **Um único arquivo gera links de WhatsApp**: `lib/whatsapp.ts`. Nenhum `wa.me`
  fora dele. Zero emoji, zero travessão, zero NBSP (corrompem no WhatsApp
  Desktop do Windows).
- **Acesso a banco só em `services/`**, sempre com `import "server-only"`.
- **Toda Server Action** começa com `requireUser()` e valida com Zod antes de
  escrever; termina com `updateTag()`; retorna `{ ok: true } | { ok: false; error }`.
- **Textos institucionais moram em `config/textos.ts`**, nunca hardcoded em
  componente.
- **Cor nunca hardcoded em componente**: só os tokens do `@theme` em
  `app/globals.css`.

## Armadilha de contraste desta paleta

`--color-ouro` (#D4AF37) sobre `--color-marfim` (#F4F0E8) dá 1,85:1 e **reprova
em acessibilidade**. Texto dourado sobre fundo claro usa sempre
`--color-ouro-escuro` (#77621F, 5,2:1). Componentes recebem `tone` como prop e
nunca adivinham o fundo em que estão.

Ao mexer na paleta, **meça** — não estime. O valor anterior deste token
(#8F6C22) parecia seguro e dava 4,26:1, abaixo do mínimo.

## Mobile

Duas colunas no mobile sempre (inclusive nos skeletons). Toque >= 44px. Inputs
16px em telas <= 640px (menos que isso o iOS dá zoom sozinho). `safe-area-inset`
em toda barra fixa. Um único elemento fixo no rodapé por tela: ou navegação, ou
ação — nunca os dois.
