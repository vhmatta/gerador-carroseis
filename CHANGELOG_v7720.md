# v7.7.20 — FIX busca de ícones + drag/zoom da foto (feed_pilula_headline)

## 🐛 Fixes

### Buscador de ícones — campo de busca não funcionava (v7.7.19)

Causa: filtro `typeof v === "function"` não casava porque o lucide-react
agora exporta os ícones como `forwardRef` objects (não functions).

Sintoma: lista vazia, nada filtrado, busca aparentava "não funcionar".

Fix: filtro estendido pra aceitar tanto `function` quanto objetos com
`$$typeof: Symbol(react.forward_ref)` + `render`. Agora detecta os 1768
ícones corretamente.

**Bonus:** removido `disabled` do input enquanto carrega; agora o
placeholder muda pra "Carregando ícones…" e fica imediatamente
clicável quando a lista chega.

## 🆕 Drag + Zoom da foto (feed_pilula_headline apenas)

Implementação inicial em UM template (feed_pilula_headline) pra
validar antes de replicar nos outros 6.

**Como funciona:**
- Slider "Zoom da foto" na Secao "Foto" do painel direito (1x → 3x)
- Quando zoom > 1, a foto fica clicável no preview com cursor "grab"
- Usuário arrasta pra reposicionar a foto dentro do enquadramento
- Posição salva como % offset (-50 a +50) no slide
- Persiste via auto-save (localStorage)
- Botão "Resetar enquadramento" volta zoom = 1 e offsets = 0

**Detalhes técnicos:**
- Novo componente `FotoDraggable` em `components/`
- Usa `objectPosition: "X% Y%"` + `transform: scale(zoom)` na <img>
- Drag via mousedown/mousemove/mouseup globais
- Sinal invertido: arrastar foto pra direita → posição vai pra direita
  (mais natural)
- Sem afetar export: html2canvas captura DOM atual, então o offset
  salvo no slide é refletido pixel-perfect
- Drag desativado quando `onSlideChange` undefined (modo export
  offscreen)

## Por que apenas 1 template

Decisão estratégica: refatorações em massa nos 7 templates causaram
o hotfix v7.7.18. Implementar em 1 template primeiro permite testar
a UX e a robustez antes de replicar.

Se a v7.7.20 funcionar bem, a v7.7.21 vai estender pros outros 6
templates (stories_pilula_headline, *_icone_cta, ipva_iptu_*,
rotativo_feed).

## Arquivos editados

NOVOS:
- `src/app/components/feed/components/FotoDraggable.tsx`

EDITADOS:
- `src/app/components/feed/components/IconeLucide.tsx` — fix detect
  forwardRef
- `src/app/components/feed/components/IconePicker.tsx` — fix filter +
  remove disabled
- `src/app/components/feed/templates/feed_pilula_headline.tsx` —
  aceita onSlideChange + usa FotoDraggable
- `src/app/components/feed/FeedSlide.tsx` — propaga onSlideChange
- `src/app/components/feed/FeedEditor.tsx`:
  - PreviewSlide aceita onSlideChange
  - PreviewSlide passa atualizarSlide pro onSlideChange
  - Secao "Foto" tem slider de zoom + reset enquadramento
- `package.json` — version 7.7.20

## Validação
- Vite build production: ✅ 1664 módulos, 0 erros
- Bundle inicial: 518KB
- Lucide chunk: 792KB (lazy)
- Lista de ícones validada: 1768 ícones detectados

## Como aplicar
1. GitHub Desktop → repo → Show in Explorer
2. Esvaziar pasta (preservar `.git`)
3. Extrair ZIP da v7.7.20
4. Summary: `fix+feat: v7.7.20 — Busca de ícones + drag/zoom no feed_pilula_headline`
5. Commit + Push
