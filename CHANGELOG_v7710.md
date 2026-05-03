# v7.7.10 — Controles tipográficos profissionais (Figma-like)

## Novo

### Controles tipográficos profissionais por elemento
Cada card de elemento em "Tipografia avançada" agora tem (além de Peso/Tamanho/Italic/Entrelinhas):

- **Letter-spacing (tracking)** — slider em "em" (-0.05 a +0.10, step 0.005)
- **Alinhamento horizontal** — botões Esq / Centro / Dir
- **Caixa do texto (transform)** — Normal / MAIÚSCULA / minúscula / Capitular
- **Margem inferior individual** — slider 0–64px, step 8 (8pt grid). Empurra
  só este elemento pra baixo, útil pra ajuste fino sem mexer nos gaps gerais.

Aplica em: **Pílula, Headline, Subhead, Tagline, CTA**.

### Pílula agora tem todos os controles tipográficos
A pílula (kicker) era hardcoded antes. Agora tem o card completo no painel
"Tipografia avançada" com Peso/Tamanho/Italic/Entrelinhas/LetterSpacing/
Align/Transform/Margem.

## Mudanças nos defaults

| Item | Antes | Agora |
|---|---|---|
| Pílula no Feed (tamanho) | 20px | **24px** |
| Pílula no Stories (tamanho) | 20px | **32px** |
| Gap Subhead → CTA (templates _icone_cta) | 64px | **80px** |

## Bug fixes

### `stories_pilula_headline`: italic do subhead removido
O subhead estava com `fontStyle: "italic"` hardcoded. Agora respeita o toggle
italic do slide (default = sem italic, igual ao Feed).

## ⚠️ Pendente nesta versão (próxima sessão)

Dois itens da sua lista não entraram nesta v7.7.10 porque exigem o arquivo
`src/app/lib/gerarCarrossel.ts` que não estava no ZIP que recebi:

1. **Bug do Stories cortado no export** — provável causa: altura fixa 1350
   no exportador. Preciso ver `gerarCarrossel.ts` pra corrigir.
2. **Botão "Baixar este slide" individual** — também depende do exportador
   pra reusar a lógica de captura PNG.

Manda o `gerarCarrossel.ts` na próxima e eu fecho a v7.7.11 com esses dois.

## Arquivos editados

### Tipos
- `src/app/components/feed/templates/tipos.ts` — campos novos:
  letterSpacing/align/transform/mb por elemento (Pílula/Headline/Subhead/
  Tagline/CTA), além dos campos de tipografia da pílula
  (tamPilula/pesoPilula/italicPilula/lineHeightPilula/corPilula/corPilulaFundo)

### Templates
- `feed_pilula_headline.tsx` / `stories_pilula_headline.tsx` — pílula
  totalmente parametrizada (default 24/32), aplicação de letter-spacing/
  align/transform em headline/subhead/tagline; remoção do italic fixo no
  subhead do stories
- `feed_icone_cta.tsx` / `stories_icone_cta.tsx` — default gap subhead→CTA
  64→80, mb individual nos cálculos bottom-up, aplicação de letter-spacing/
  align/transform em headline/subhead/tagline/CTA

### UI
- `FeedEditor.tsx` — `ControlesElemento` ganhou 4 novos props
  (letterSpacing/align/transform/mb) com seus respectivos handlers; nova
  chamada de `ControlesElemento` pra Pílula no painel Tipografia avançada;
  reset de tipografia estendido pra incluir todos os campos novos
- `package.json` — version 7.7.10

## Validação
- TS check: 0 erros nos arquivos editados
