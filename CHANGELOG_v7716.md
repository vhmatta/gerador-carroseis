# v7.7.16 — Indicador "Auto-save ativo" em todos os módulos

## O que mudou

Na v7.7.15 implementei auto-save em todos os módulos, mas o indicador
visual "● Auto-save ativo" só apareceu no Feed/Stories. Agora aparece
em todos os módulos.

### Onde aparece "● Auto-save ativo"

- ✅ Feed & Stories (já tinha — no subtítulo)
- ✅ LinkedIn — Capa avançada (junto do título "Configuração")
- ✅ LinkedIn — Carrossel (no Toolbar, ao lado de "Aparece no topo de cada slide")
- ✅ LinkedIn — Gerador em Lote (junto do título "Gerador em Lote")

Texto sempre em verde (#10b981) com bullet ● à esquerda. Tipografia
pequena (10px) maiúscula com letter-spacing — discreto mas visível.

## Arquivos editados
- `src/app/components/CoverEditorAvancado.tsx` — span ao lado de "Configuração"
- `src/app/components/GeradorLote.tsx` — span ao lado de "Gerador em Lote"
- `src/app/components/carrossel/Toolbar.tsx` — span no rodapé do input
- `package.json` — version 7.7.16

## Validação
- Vite build production: ✅ 1663 módulos, 0 erros
- Bundle: `index-7dBRRCFy.js`

## Como aplicar
1. GitHub Desktop → repo → Show in Explorer
2. Esvaziar pasta (preservar `.git`)
3. Extrair ZIP da v7.7.16
4. Commit + Push
