# v7.7.19 — Buscador de ícones Lucide (~1500 ícones)

## O que mudou

### 🆕 Buscador de ícones Lucide
Antes: o ícone era fixo `RefreshCcw` em todos os slides com ícone.

Agora: novo seletor "Trocar" na Secao "Ícone" do painel direito que
permite buscar entre **~1500 ícones do Lucide** por nome:
- Ex: "dollar" → DollarSign, BadgeDollarSign, CircleDollarSign…
- Ex: "credit" → CreditCard, BadgeCreditCard…
- Ex: "user" → User, UserCheck, Users, UserPlus…

Mostra preview do ícone atual + botão pra trocar. Quando aberto:
- Input de busca focado automaticamente
- Grid de até 60 resultados (6 colunas)
- Clica num ícone pra selecionar e fechar

Funciona em todos os templates que usam ícone:
- feed_icone_cta
- stories_icone_cta
- rotativo_feed

### Performance: lazy loading

O lucide-react inteiro (~700KB) só é baixado quando:
1. O usuário usa um ícone diferente do default RefreshCcw, OU
2. O usuário abre o buscador de ícones

Bundle inicial sobe só ~10KB (de 506KB pra 515KB).
Chunk separado `lucide-react-D6xxocin.js` (792KB → gzip 143KB)
fica em cache do navegador depois do primeiro uso.

### 🔜 Pendente próxima versão

Drag/zoom da foto: a interface vai depender da decisão UX
(controles no painel direito vs drag direto na foto).

## Arquivos novos/editados

NOVOS:
- `src/app/components/feed/components/IconeLucide.tsx` — wrapper
  com lazy loading
- `src/app/components/feed/components/IconePicker.tsx` — buscador

EDITADOS:
- `src/app/components/feed/templates/tipos.ts` — campo `iconeNome`
- `src/app/components/feed/templates/feed_icone_cta.tsx` —
  RefreshCcw fixo → IconeLucide com nome dinâmico
- `src/app/components/feed/templates/stories_icone_cta.tsx` — idem
- `src/app/components/feed/templates/rotativo_feed.tsx` — idem
- `src/app/components/feed/FeedEditor.tsx` — Secao Ícone agora
  inclui IconePicker; condição estendida pra rotativo_feed
- `package.json` — version 7.7.19

## Validação
- Vite build production: ✅ 1664 módulos, 0 erros
- Bundle inicial: 515KB (apenas +9KB vs v7.7.18)
- Lucide chunk separado: 792KB (lazy)

## Como aplicar
1. GitHub Desktop → repo → Show in Explorer
2. Esvaziar pasta (preservar `.git`)
3. Extrair ZIP da v7.7.19
4. Summary: `feat: v7.7.19 — Buscador de ícones Lucide (~1500 ícones)`
5. Commit + Push origin
6. Hard refresh
