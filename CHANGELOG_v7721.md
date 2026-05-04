# v7.7.21 — FIX drag da foto + drag/zoom em TODOS os templates

## 🐛 Fix crítico: drag não funcionava

Reportado v7.7.20: zoom funcionava mas drag não respondia.

Causa: o `BlocoTextoWrapper` (introduzido v7.7.17 pra controle de
posição vertical do bloco) tinha `pointer-events: auto` num div
interno cobrindo a área toda do canvas. Isso bloqueava 100% dos
eventos de mouse de chegarem no `FotoDraggable` que está atrás.

Fix: ambos os divs do `BlocoTextoWrapper` agora têm
`pointer-events: none`. Os elementos textuais dentro são puramente
visuais e não precisam interagir com mouse, então eventos de drag
passam direto pra foto atrás. Outros overlays (TexturaOverlay,
GradienteLeitura, RodapePNG) já tinham `pointer-events: none`.

## 🆕 Drag/zoom estendido pra todos os 7 templates

Antes (v7.7.20): apenas `feed_pilula_headline` tinha drag/zoom.

Agora (v7.7.21): TODOS os templates Feed/Stories suportam
drag + zoom da foto:
- ✅ feed_pilula_headline
- ✅ stories_pilula_headline
- ✅ feed_icone_cta
- ✅ stories_icone_cta
- ✅ ipva_iptu_feed
- ✅ ipva_iptu_stories
- ✅ rotativo_feed

Slider "Zoom da foto" no painel direito agora aparece em qualquer
template que usa foto (campo `usaFoto`), não só no
`feed_pilula_headline`.

## Refatoração técnica

Cada um dos 6 templates modificados via script Python automatizado:
1. Adicionado import `FotoDraggable`
2. Assinatura aceita `onSlideChange?: (patch: Partial<FeedSlideData>) => void`
3. Destructuring inclui `onSlideChange`
4. `<img src={slide.fotoUrl}>` → `<FotoDraggable ... />` com:
   - width/height corretos por template (Feed=1080×1350, Stories=1080×1920)
   - zoom={slide.fotoZoom ?? 1}
   - offsetX={slide.fotoOffsetX ?? 0}
   - offsetY={slide.fotoOffsetY ?? 0}
   - onPositionChange repassando pro slide

`FeedSlide.tsx` propaga `onSlideChange` pra todos os templates
implementados (não só feed_pilula_headline como na v7.7.20).

## Arquivos editados

EDITADOS:
- `src/app/components/feed/components/BlocoTextoWrapper.tsx` —
  pointer-events: none em ambos os divs
- `src/app/components/feed/templates/feed_icone_cta.tsx`
- `src/app/components/feed/templates/stories_icone_cta.tsx`
- `src/app/components/feed/templates/stories_pilula_headline.tsx`
- `src/app/components/feed/templates/ipva_iptu_feed.tsx`
- `src/app/components/feed/templates/ipva_iptu_stories.tsx`
- `src/app/components/feed/templates/rotativo_feed.tsx`
- `src/app/components/feed/FeedSlide.tsx` — propaga onSlideChange
  pros 4 templates do switch
- `src/app/components/feed/FeedEditor.tsx` — slider zoom em todos
  templates que usam foto (não só feed_pilula_headline)
- `package.json` — version 7.7.21

## Validação
- Vite build production: ✅ 1664 módulos, 0 erros
- Bundle: 518KB
- Todos os 7 templates validados via grep:
  - 7/7 importam FotoDraggable
  - 7/7 usam <FotoDraggable>
  - 7/7 aceitam onSlideChange
  - 7/7 destructuram onSlideChange

## Como testar

1. Hard refresh após deploy
2. Adiciona foto em QUALQUER template Feed/Stories
3. Aumenta o slider "Zoom da foto" pra mais de 100%
4. Cursor da foto vira "grab" (mãozinha)
5. Arrasta a foto pra reposicionar
6. Salva automaticamente (auto-save)

## Texto do commit

**Summary:**
fix+feat: v7.7.21 — Drag da foto funcionando + estendido pra todos templates

**Description:**
FIX CRÍTICO: drag da foto não funcionava na v7.7.20 porque o
BlocoTextoWrapper bloqueava eventos de mouse com pointer-events:auto.
Corrigido pra pointer-events:none em ambos os divs.

NOVA FEATURE: drag/zoom estendido pra todos os 7 templates
Feed/Stories (antes só feed_pilula_headline).

Templates atualizados: feed_pilula_headline, stories_pilula_headline,
feed_icone_cta, stories_icone_cta, ipva_iptu_feed, ipva_iptu_stories,
rotativo_feed. Cada um aceita onSlideChange e usa FotoDraggable.

FeedSlide propaga onSlideChange. Slider de zoom no painel direito
agora visível em qualquer template com foto.

Validado via grep: 7/7 templates corretos. Build OK.
