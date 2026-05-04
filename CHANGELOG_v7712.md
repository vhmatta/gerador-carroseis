# v7.7.12 — Tipografia avançada SUPER visível (borda amarela 2px)

## Por quê essa versão

Na v7.7.11 mudei o contraste de Tipografia avançada e Espaçamentos
(border #3a3a3a, fundo #1a1a1a, título #FFC528). O bundle deployado tinha
todas as alterações confirmadas, mas o usuário continuou reportando que
não conseguia ver visualmente as seções no painel direito.

## Fix v7.7.12

Aumentado drasticamente o destaque visual dos botões recolhíveis:

| Antes (v7.7.11) | Agora (v7.7.12) |
|---|---|
| `border: 1px solid #3a3a3a` | **`border: 2px solid #FFC528`** (amarelo, mais grosso) |
| Sem sombra externa | **`boxShadow: 0 0 0 1px rgba(255, 197, 40, 0.2)`** |
| Padding `12px 14px` | **`14px 16px`** (maior área clicável) |
| `fontSize: 11` | **`fontSize: 12`** |
| `fontWeight: 700` | **`fontWeight: 800`** |
| `letterSpacing: 0.08em` | **`0.1em`** |
| Ícone `size={12}` | **`size={14}`** |

Quando aberto, fundo vira amarelo sólido (#FFC528) com texto preto.
Impossível não ver agora.

## Arquivos editados
- `src/app/components/feed/FeedEditor.tsx` — TipografiaAvancada e
  EspacamentosBloco com visual reforçado
- `package.json` — version 7.7.12

## Validação
- Vite build production: ✅ 1662 módulos transformados sem erros
- Bundle novo gerado: `index-DxlPvr2D.js` (anterior: `BK7ipjt0`)

## Como aplicar
1. Extrair ZIP no projeto local
2. `git add -A`
3. `git commit -m "fix: v7.7.12 — Tipografia avançada com borda amarela 2px"`
4. `git push`
5. Hard refresh (Ctrl+Shift+R) após Vercel ficar Ready
