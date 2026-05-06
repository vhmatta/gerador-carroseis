# v7.7.23 — Pacote A: Drag/Zoom no Carrossel + Capa LinkedIn

## O que mudou

Pacote A do roadmap: drag e zoom da foto agora funciona em **todos
os módulos** (antes era só Feed/Stories).

## Novas features

### LinkedIn — Carrossel
- Slider "Zoom da foto" no painel direito (1x → 3x)
- Quando zoom > 1, foto fica arrastável no preview
- Funciona em todos os 4 temas (Classic, Refined, Keynote, Tweet)
  e todos os layouts dentro de cada tema
- Persiste via auto-save (localStorage)
- Botão "Resetar" volta zoom = 1 e offsets = 0

### LinkedIn — Capa
- Mesma feature do Carrossel aplicada ao LinkedInCover
- Slider de zoom no painel direito do CoverEditorAvancado
- Drag direto na foto da capa quando zoom > 1
- Persiste com prefixo `parceleaqui:cover:`

## Implementação

### Carrossel (~400 linhas alteradas)
Estratégia inteligente: como todos os 4 temas usam o componente
compartilhado `FotoOuPlaceholder` em `temas/primitivos.tsx`, bastou
modificar **1 componente** e ele aplica em todos os temas.

Cadeia de propagação do callback:
1. `CarrosselEditor` → `SlidePreview` (passa `atualizarSlide`)
2. `SlidePreview` → `CarrosselSlide` (recebe e passa adiante)
3. `CarrosselSlide` → `layoutDef.render({ ..., onSlideChange })`
4. Cada Layout passa `onSlideChange` pro `<FotoOuPlaceholder>`
5. `FotoOuPlaceholder` faz o drag e chama `onPositionChange`

Campos novos em `SlideData`:
- `fotoZoom?: number`
- `fotoOffsetX?: number`
- `fotoOffsetY?: number`

### Capa LinkedIn
Implementação direta no `LinkedInCover.tsx`:
- State de drag interno no componente
- Container da foto vira clicável quando `onFotoPositionChange` é
  passado (modo editor)
- Em modo export (sem callback), drag desativado mas zoom/offsets
  salvos são renderizados normalmente

## Arquivos editados

NOVOS:
- (nenhum, reuso de componentes existentes)

EDITADOS:
- `src/app/components/temas/tipos.ts` — campos fotoZoom/Offset + onSlideChange
- `src/app/components/temas/primitivos.tsx` — FotoOuPlaceholder com drag/zoom
- `src/app/components/temas/tema_classic.tsx` — passa props pra FotoOuPlaceholder
- `src/app/components/temas/tema_keynote.tsx` — idem
- `src/app/components/temas/tema_refined.tsx` — idem
- `src/app/components/temas/tema_tweet.tsx` — idem (+ assinaturas)
- `src/app/components/CarrosselSlide.tsx` — propaga onSlideChange
- `src/app/components/carrossel/SlidePreview.tsx` — propaga onSlideChange
- `src/app/components/CarrosselEditor.tsx` — passa atualizarSlide
- `src/app/components/carrossel/EditPanel.tsx` — slider zoom + reset
- `src/app/components/LinkedInCover.tsx` — drag/zoom na capa LinkedIn
- `src/app/components/CoverEditorAvancado.tsx` — slider + state
- `package.json` — version 7.7.23

## Validação
- Vite build production: ✅ 1668 módulos, 0 erros
- Bundle: 525KB
- Lazy chunk lucide-react: 792KB

## Texto do commit

**Summary:**
feat: v7.7.23 — Pacote A: Drag/Zoom no Carrossel + Capa LinkedIn

**Description:**
Pacote A do roadmap: drag e zoom da foto estendido pra Carrossel LinkedIn (todos os 4 temas) e Capa LinkedIn (LinkedInCover).

CARROSSEL:
- FotoOuPlaceholder ganhou suporte opcional a zoom/offsetX/offsetY/onPositionChange
- Cadeia de propagação: CarrosselEditor → SlidePreview → CarrosselSlide → Layout → FotoOuPlaceholder
- 4 temas atualizados: Classic, Refined, Keynote, Tweet
- Slider de zoom no EditPanel (painel direito)
- Persiste via auto-save

CAPA LINKEDIN:
- LinkedInCover com state de drag interno e props fotoZoom/fotoOffsetX/fotoOffsetY
- CoverEditorAvancado com slider de zoom e reset

Campos novos em SlideData (Carrossel):
- fotoZoom, fotoOffsetX, fotoOffsetY

Build: 1668 módulos, 0 erros.
