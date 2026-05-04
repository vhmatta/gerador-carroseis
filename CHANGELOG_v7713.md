# v7.7.13 — Tipografia avançada e Espaçamentos: padrão Secao (sem recolhível)

## Por quê essa versão

Nas versões 7.7.11 e 7.7.12, mesmo com border 2px/3px amarela, boxShadow,
fonte maior e tudo mais, o usuário não conseguia visualizar a "Tipografia
avançada" no painel direito. O bundle deployado tinha todos os estilos,
mas algo no CSS Tailwind do projeto interferia com o `<button>` custom.

## Fix v7.7.13: refatoração radical

Em vez de tentar corrigir o componente recolhível custom, removi o wrapper
e usei o **mesmo padrão `<Secao>`** que já funciona perfeitamente em todas
as outras seções do app (Tamanho geral, Cores, Foto deste slide, etc).

### Antes (v7.7.12)
```tsx
<TipografiaAvancada slide={slide} onChange={onChange} ... />
```
Componente custom com botão recolhível e wrapper próprio. Não funcionava.

### Agora (v7.7.13)
```tsx
<Secao titulo="Tipografia avançada" icone={<Type size={12} />}>
  <ConteudoTipografia slide={slide} onChange={onChange} ... />
</Secao>
```
Usa o componente `<Secao>` padrão. **Mesma aparência das outras seções.**

## Mudanças nos componentes

- `TipografiaAvancada` removido. Substituído por `ConteudoTipografia` que
  renderiza apenas o conteúdo (cards de Pílula, Headline, Subhead, etc),
  sem wrapper recolhível.
- `EspacamentosBloco` removido. Substituído por `ConteudoEspacamentos`,
  mesmo padrão.
- Os controles ficam **sempre visíveis** (não recolhem mais). Como são
  vários elementos, isso pode aumentar o scroll do painel, mas garante
  que eles serão **sempre encontrados**.

## Visualmente

Agora "TIPOGRAFIA AVANÇADA" aparece com a mesma cor cinza/amarela das outras
seções (TAMANHO GERAL, FOTO DESTE SLIDE, etc), com ícone de fonte ao lado.
Logo abaixo aparecem os cards de cada elemento (Pílula, Headline, Subhead,
Tagline, CTA).

## Arquivos editados
- `src/app/components/feed/FeedEditor.tsx`:
  - Substituiu `<TipografiaAvancada>` por `<Secao>+<ConteudoTipografia>`
  - Substituiu `<EspacamentosBloco>` por `<Secao>+<ConteudoEspacamentos>`
  - Removidas funções `TipografiaAvancada` e `EspacamentosBloco`
- `package.json` — version 7.7.13

## Validação
- Vite build production: ✅ 1662 módulos transformados, sem erros
- Bundle novo: `index-BmoVa9X5.js` (anterior: `DxlPvr2D`)

## Como aplicar

Igual antes:
1. Abrir GitHub Desktop com repo gerador-carroseis selecionado
2. Esvaziar a pasta local (preservando .git oculta)
3. Extrair o ZIP da v7.7.13 dentro da pasta
4. Voltar no GitHub Desktop, vai detectar 1-2 arquivos modificados
5. Mensagem do commit: `fix: v7.7.13 — Tipografia e Espaçamentos com padrão Secao`
6. Commit + Push origin
7. Esperar Vercel deploy (1-2 min)
8. Hard refresh (Ctrl+Shift+R) ou janela anônima
