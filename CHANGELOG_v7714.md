# v7.7.14 — Auto-save no localStorage + botão Limpar tudo

## O que mudou

### 🆕 Auto-save automático

Os slides do Feed/Stories agora ficam SALVOS automaticamente no
navegador (localStorage). Tudo que o usuário fizer fica preservado:
- Textos (pílula, headline, subhead, tagline, CTA)
- Fotos selecionadas (URL e posição)
- Cores customizadas
- Controles de tipografia (peso, tamanho, italic, line-height,
  letter-spacing, alinhamento, transform, mb)
- Espaçamentos do bloco (gaps customizados)
- Tamanho geral, ícone, etc.

**Comportamento:**
- Toda vez que o usuário muda algo, é salvo na hora.
- Quando o usuário recarrega a página (F5, fecha/abre browser, etc),
  os slides voltam EXATAMENTE como estavam.
- No subtítulo aparece "● Auto-save ativo" (verde) confirmando.

**Storage key:** `parceleaqui:feed-stories:slides:v1`

### 🆕 Botão "Limpar tudo"

Adicionado botão pra começar do zero (apaga todos os slides salvos).
Pede confirmação antes pra evitar perda acidental.

### 🛠️ Notas técnicas

- Usa `localStorage` (5MB máximo). Em caso de limite, falha
  silenciosamente — usuário pode limpar via DevTools console com
  `localStorage.clear()`.
- Validação mínima ao restaurar: cada item precisa ter `id` e
  `templateId`. Se não tiver, ignora e cria slide vazio.
- O `useEffect` salva sempre que `slides` muda — sem debounce, o que
  é ok pro tamanho típico de dados (poucos KB).

## Arquivos editados
- `src/app/components/feed/FeedEditor.tsx`:
  - Adicionada função `carregarSlidesSalvos()` e `salvarSlides()`
  - useState inicial usa `carregarSlidesSalvos()` como fallback
  - useEffect salva quando slides mudam
  - Botão "Limpar tudo" no cabeçalho
  - Indicador "● Auto-save ativo" no subtítulo
- `package.json` — version 7.7.14

## Validação
- Vite build production: ✅ 1662 módulos, 0 erros
- Bundle: `index-B10VJxUT.js`

## Como aplicar

1. Abrir GitHub Desktop, repo `gerador-carroseis`
2. Repository → Show in Explorer
3. Esvaziar pasta (preservar `.git` oculta)
4. Extrair ZIP da v7.7.14
5. Voltar GitHub Desktop, vai detectar 1-2 arquivos modificados
6. Summary: `feat: v7.7.14 — Auto-save dos slides no navegador`
7. Commit + Push origin
8. Esperar Vercel deploy (~1-2 min)
9. Hard refresh (Ctrl+Shift+R)

## ATENÇÃO sobre o "tamanho não funciona"

Reportado: sliders de Tamanho e Margem inferior não respondem.
Investigação: o código está correto, os templates aplicam fontSize:
`(slide.tamHeadline ?? 165) * escalaGeral` e position com mb.

Hipótese forte: o efeito é PERCEPTUAL. Headline default 165px num
preview que aparece ~33% do tamanho real (1080→360px), uma mudança
de 4-8px só vira ~1-2px na tela. mb = 8px também é só ~2.6px de
deslocamento visível.

**Como testar de verdade**: arrasta o slider ATÉ O MÁXIMO (250px) e
veja se a Headline aumenta visualmente no preview. Se não aumentar,
é bug funcional. Se aumentar pouco, é só perceptual.
