# v7.7.17 — Posição vertical do bloco (offsetY) em Feed/Stories

## O que mudou

Novo controle "Posição vertical do bloco" no painel direito do
Feed/Stories que permite mover TODO o bloco de texto pra cima ou
pra baixo, sem mexer nas posições individuais de cada elemento.

### Características

- **Slider** com range -200px a +200px, step 8 (8-point grid)
- **Por slide individual** (cada slide tem sua própria posição)
- **Em todos os 7 templates** Feed/Stories
- Default 0 (sem deslocamento)
- Botão "Resetar posição" quando valor != 0
- Persiste via auto-save (localStorage)

### Ícone e localização

- Ícone: MoveVertical (lucide-react)
- Posição na UI: logo abaixo de "Tamanho geral", antes de
  "Tipografia avançada"

## Como funciona internamente

Novo componente `BlocoTextoWrapper` em `feed/components/`:
- Wrapper transparente com `position: absolute; inset: 0`
- Aplica `transform: translateY(offsetY * escala)` em todos os filhos
- Não afeta a foto, textura, gradiente ou rodapé (esses ficam fora
  do wrapper)

Cada template foi refatorado pra envolver os elementos textuais
(pílula, headline, subhead, tagline, CTA, ícone) com esse wrapper.
A foto, gradiente e rodapé continuam fora — então só o texto se move.

## Arquivos editados
- `src/app/components/feed/components/BlocoTextoWrapper.tsx` (NOVO)
- `src/app/components/feed/templates/tipos.ts` — campo `offsetYBloco`
- `src/app/components/feed/templates/feed_pilula_headline.tsx`
- `src/app/components/feed/templates/feed_icone_cta.tsx`
- `src/app/components/feed/templates/stories_pilula_headline.tsx`
- `src/app/components/feed/templates/stories_icone_cta.tsx`
- `src/app/components/feed/templates/ipva_iptu_feed.tsx`
- `src/app/components/feed/templates/ipva_iptu_stories.tsx`
- `src/app/components/feed/templates/rotativo_feed.tsx`
- `src/app/components/feed/FeedEditor.tsx` — Secao nova + import MoveVertical
- `package.json` — version 7.7.17

## Validação
- Vite build production: ✅ 1664 módulos, 0 erros
- Bundle: `index-CkZBjRUV.js`

## Como aplicar
1. GitHub Desktop → repo → Show in Explorer
2. Esvaziar pasta (preservar `.git`)
3. Extrair ZIP da v7.7.17
4. Commit + Push
