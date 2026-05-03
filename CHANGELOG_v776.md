# v7.7.6 — Rodapé PNG + textura/gradiente no Feed/Stories

## Novo

### Rodapés como PNG (4 arquivos em `/public/rodapes/`)
- `rodape_01_feed.png` / `rodape_01_stories.png` — amarelo cheio com grão (logo creme)
- `rodape_02_feed.png` / `rodape_02_stories.png` — creme com curva amarela (logo amarelo)
- Cantos arredondados com transparência alpha (sem artefatos pretos)
- Otimizados: ~1.1MB total (de ~2.7MB originais)

### Seletor de rodapé no painel direito (todos os templates Feed/Stories)
- 2 cards com thumbnail dos PNGs reais
- Default por template:
  - `feed_icone_cta` / `stories_icone_cta` → `rodape_01` (amarelo)
  - `feed_pilula_headline` / `stories_pilula_headline` → `rodape_02` (creme)
- Toggle "Mostrar rodapé" embutido na seção

### Toggle de textura + slider de opacidade no Feed/Stories
- Mesmo padrão do Gerador de Lote do LinkedIn (v7.7.5)
- Textura nunca invade o rodapé (clipada via `alturaUtil`)

### Gradiente sutil de leitura (novo)
- Toggle on/off + slider de opacidade (0–80%)
- Direção: preto na base → transparente no topo
- Aplicado entre foto e textos pra garantir legibilidade
- Também clipado acima do rodapé

### Novo template implementado
- `stories_icone_cta` (1080×1920) — saiu de placeholder, totalmente funcional

## Mudanças

### IDs dos templates renomeados (descrevem ESTRUTURA, não conteúdo)
| Antigo | Novo |
|---|---|
| `ipva_iptu_feed` | `feed_pilula_headline` |
| `ipva_iptu_stories` | `stories_pilula_headline` |
| `rotativo_feed` | `feed_icone_cta` |
| `rotativo_stories` | `stories_icone_cta` |
| `oque_e_feed` | `feed_amarelo_ilustracao` |
| `oque_e_stories` | `stories_amarelo_ilustracao` |
| `ate3_cartoes_feed` | `feed_central_asset` |
| `ate3_cartoes_stories` | `stories_central_asset` |

→ Aliases dos IDs antigos preservados no parser de cola de texto (retrocompat).

### Espaçamentos do Ícone + CTA outline (Rotativo, agora `feed_icone_cta`/`stories_icone_cta`)
- Ícone → Headline: **24px**
- Headline → Subhead: **32px**
- Subhead → CTA: **40px**
- CTA → Rodapé: **72px**

### Camadas (z-index, de baixo pra cima)
1. Foto de fundo (cobre só a área útil)
2. Textura overlay (clipada acima do rodapé)
3. Gradiente de leitura (clipado acima do rodapé)
4. Conteúdo (ícone, pílula, headline, subhead, tagline, CTA)
5. **Rodapé PNG** (sempre por cima de tudo, z-index 50)

### Removido
- SVG path do footer creme programático (substituído pelo PNG)
- `LogoParceleAqui` programático nos templates (URL e logo agora vêm dentro do PNG)
- Lógica de textura em 2 camadas no `feed_icone_cta` (agora a única textura é clipada)

## Arquivos novos
- `src/app/components/feed/components/RodapePNG.tsx`
- `src/app/components/feed/components/GradienteLeitura.tsx`
- `src/app/components/feed/templates/feed_pilula_headline.tsx`
- `src/app/components/feed/templates/stories_pilula_headline.tsx`
- `src/app/components/feed/templates/stories_icone_cta.tsx`
- `public/rodapes/*.png` (4 arquivos)

## Arquivos editados
- `src/app/components/feed/templates/tipos.ts` — `TipoRodape`, `ALTURAS_RODAPE`, campos novos
- `src/app/components/feed/templates/feed_icone_cta.tsx` (renomeado de `rotativo_feed.tsx`)
- `src/app/components/feed/components/TexturaOverlay.tsx` — aceita `alturaUtil`
- `src/app/components/feed/FeedSlide.tsx` — switch + registry com novos IDs
- `src/app/components/feed/FeedEditor.tsx` — 3 novas seções no painel
- `src/app/components/feed/index.ts` — re-exporta novos tipos/funções
- `src/app/lib/parsearTextoFeed.ts` — IDs novos + aliases antigos
- `package.json` — version bump para 7.7.6

## Pendências (próxima versão)
1. **5 templates ainda em placeholder:**
   - `feed_amarelo_ilustracao` / `stories_amarelo_ilustracao`
   - `feed_central_asset` / `stories_central_asset`
2. **Observações de ajuste com imagens** — cliente trará prints específicos
