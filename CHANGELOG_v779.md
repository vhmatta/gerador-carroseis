# v7.7.9 — Entrelinhas + espaçamentos customizáveis (8pt grid)

## Novo

### Slider de entrelinhas (line-height) por elemento
Adicionado em `Tipografia avançada` (recolhível), abaixo do slider de tamanho:
- Range: **0.8 a 1.4**, step 0.05
- Aplicado em **Headline, Subhead, Tagline, CTA**
- Default = preserva o valor original de cada template
- Mostra "(padrão X.XX)" quando não customizado

Resolve: ajustar entrelinhas do título principal pra controlar o espaço entre
"Rotativo" e "ou estratégia?" sem afetar tamanho ou peso.

### Nova seção "Espaçamentos" (recolhível, só em templates `_icone_cta`)
4 sliders pros gaps verticais entre elementos do bloco coeso, todos no
**8-point grid (step 8)**:

| Gap | Range | Default |
|---|---|---|
| Ícone → Headline | 16–64px | **24** |
| Headline → Subhead | 16–80px | **32** |
| Subhead → CTA | 24–96px | **64** (era 40) |
| CTA → Rodapé | 48–120px | **72** |

Quando há **tagline**, o gap "Subhead → CTA" é distribuído automaticamente:
- 60% pra Subhead → Tagline (snap a 8pt)
- 40% pra Tagline → CTA (snap a 8pt)

Resultado: o cliente edita 1 valor único e o sistema faz a distribuição
limpa no 8pt grid sem expor 2 sliders extras.

### Defaults novos (afetam visual)
- **Subhead → CTA**: 40 → **64** (mais respiro entre subtítulo e CTA, conforme
  feedback do print onde os dois ficavam coladinhos)

## Arquivos editados

### Tipos
- `src/app/components/feed/templates/tipos.ts` — campos novos:
  `lineHeightHeadline`, `lineHeightSubhead`, `lineHeightTagline`, `lineHeightCTA`,
  `gapIconeHeadline`, `gapHeadlineSubhead`, `gapSubheadCTA`, `gapCTARodape`

### Templates
- `feed_icone_cta.tsx` / `stories_icone_cta.tsx` — gaps e line-heights
  customizáveis, distribuição automática 60/40 com tagline, alturas dos
  textos consideram line-height
- `feed_pilula_headline.tsx` / `stories_pilula_headline.tsx` — line-heights
  customizáveis (gaps não se aplicam, layout fixo por coordenadas)

### UI
- `FeedEditor.tsx` — `ControlesElemento` ganhou prop `lineHeight` (slider
  novo); novo componente `EspacamentosBloco` (recolhível, com 4 SliderGap);
  reset estendido pra incluir todos os novos campos
- `package.json` — version 7.7.9

## Validação
- TS check: 0 erros nos arquivos editados
- Matemática do layout: yIcone > 0 em todos os cenários testados, incluindo
  configurações extremas (LH 1.4 + gaps maxados)

## Pendências (próxima versão)
1. **5 templates ainda em placeholder:**
   - `feed_amarelo_ilustracao` / `stories_amarelo_ilustracao`
   - `feed_central_asset` / `stories_central_asset`
2. **Observações de ajuste com imagens** — cliente trará prints específicos
