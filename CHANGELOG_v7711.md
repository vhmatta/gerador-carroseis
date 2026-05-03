# v7.7.11 — Bug fixes críticos + botão de download individual

## 🐛 Bug fixes críticos

### Stories saía cortado no export (1080x1350 em vez de 1080x1920)
**Causa:** o `gerarCarrossel.ts` tinha as dimensões hardcoded (`BASE_HEIGHT = 1350`).
Qualquer slide — incluindo Stories que mede 1080×1920 — era capturado como
1080×1350, perdendo ~570px da parte de baixo (CTA, rodapé).

**Fix:** dimensões agora são DETECTADAS dinamicamente do elemento renderizado
via `getBoundingClientRect()`. Funciona pra qualquer formato:
- Feed: 1080×1350 ✅
- Stories: 1080×1920 ✅
- Qualquer formato futuro sem precisar tocar nesse arquivo

### Tipografia avançada e Espaçamentos eram invisíveis na UI
**Causa:** os botões recolhíveis estavam com `backgroundColor: "transparent"`
e `border: 1px solid #2a2a2a` sobre fundo `#141414` do aside — contraste tão
baixo que ficavam praticamente invisíveis. O componente RENDERIZAVA (DevTools
confirmava 2/2 ocorrências de "Tipografia avançada") mas o usuário não
conseguia ver visualmente.

**Fix:** aumentado contraste:
- Border: `#2a2a2a` → `#3a3a3a`
- Background: transparente → `#1a1a1a`
- Cor do título: `#ddd` → `#FFC528` (amarelo, alta visibilidade)
- Padding: `10px 12px` → `12px 14px` (maior área clicável)

## ✨ Novo

### Botão "Baixar este slide" (PNG individual)
Adicionado ícone Download (amarelo) no card de cada slide na lista, entre o
Duplicar (Copy) e o Remover (Trash2). Ao clicar, baixa imediatamente o PNG
do slide selecionado com nome:
`parceleaqui-{feed|stories}-{NN}-{YYYY-MM-DD}.png`

Reusa a mesma lógica de captura PNG do export em lote (que agora detecta
dimensões dinamicamente).

## Arquivos editados

- `src/app/lib/gerarCarrossel.ts` — REESCRITO. Detecta dimensões via
  `getBoundingClientRect()`, calcula pixelRatio pra exportar em 1080 de
  largura, altura proporcional ao slide
- `src/app/components/feed/FeedEditor.tsx`:
  - Import de `baixarSlideUnico`
  - Novo span com ícone Download no card do slide (entre Copy e Trash2)
  - Contraste melhorado em `TipografiaAvancada` (border, background, cor)
  - Contraste melhorado em `EspacamentosBloco` (mesmo padrão)
- `package.json` — version 7.7.11

## Validação
- TS check: 0 erros novos
- Vite build production: ✅ 1662 módulos transformados sem erros

## Como testar

1. Aplicar ZIP no repo
2. `npm run build` local (validação)
3. Push pro GitHub → Vercel deploya automático
4. **Hard refresh** (Ctrl+Shift+R) no site

**Verificar:**
- [ ] Painel direito mostra "Tipografia avançada" amarela e visível entre
      "TAMANHO GERAL" e "FOTO DESTE SLIDE"
- [ ] Card de cada slide na lista (à esquerda) tem 3 ícones: Duplicar,
      Download (amarelo), Remover
- [ ] Clicar no Download baixa o PNG individual
- [ ] Exportar Stories em lote agora gera PNG 1080×1920 sem cortar
