# v7.7.15 — Auto-save em TODOS os módulos

## O que mudou

A v7.7.14 implementou auto-save apenas no Feed/Stories. Agora a v7.7.15
estende o auto-save pra TODOS os módulos da ferramenta:

### ✅ LinkedIn — Capa avançada (CoverEditorAvancado)
Persiste no localStorage:
- Número da edição
- Título principal
- Legendas (linha 1 e 2)
- Foto escolhida
- Ícone selecionado
- Toggles (usar legenda 1, usar subtítulo)
- Textura (mostrar + opacidade)

### ✅ LinkedIn — Carrossel (CarrosselEditor)
Persiste no localStorage:
- Lista completa de slides (textos, imagens, layouts, cores)
- Mantém o tema selecionado entre sessões

### ✅ LinkedIn — Gerador em lote (GeradorLote)
Persiste no localStorage:
- Número inicial
- Lista de títulos
- Quantidade por vez
- Textura
- Configuração de blocos (até 6 blocos com fotos, ícones e cores)

### ✅ Instagram — Feed/Stories (FeedEditor)
Já implementado na v7.7.14, continua funcionando.

## Como funciona

Cada módulo usa o hook `useLocalStorage` (já existente em
`src/app/lib/useLocalStorage.ts`). É o mesmo `useState` mas que
persiste automaticamente no localStorage do navegador.

**Chaves de armazenamento:**
- Feed/Stories: `parceleaqui:feed-stories:slides:v1`
- LinkedIn Capa: `parceleaqui:cover:<campo>:v1`
- LinkedIn Carrossel: `parceleaqui:carrossel:slides:v1`
- LinkedIn Lote: `parceleaqui:lote:<campo>:v1`

Caso o usuário queira limpar tudo, abrir DevTools (F12) → Console:
```js
localStorage.clear()
```
ou usar o botão "Limpar tudo" do Feed/Stories.

## Arquivos editados
- `src/app/components/feed/FeedEditor.tsx` (já modificado v7.7.14)
- `src/app/components/CoverEditorAvancado.tsx` — useLocalStorage
- `src/app/components/CarrosselEditor.tsx` (indireto via useSlides)
- `src/app/components/carrossel/useSlides.ts` — persiste slides
- `src/app/components/GeradorLote.tsx` — useLocalStorage
- `package.json` — version 7.7.15

## Validação
- Vite build production: ✅ 1663 módulos, 0 erros
- Bundle: `index-Bn6DXnNO.js`

## Como aplicar

1. GitHub Desktop → repo `gerador-carroseis` → Show in Explorer
2. Esvaziar pasta (preservar `.git` oculta)
3. Extrair ZIP da v7.7.15
4. GitHub Desktop detecta mudanças (4-5 arquivos)
5. Summary: `feat: v7.7.15 — Auto-save em todos os módulos`
6. Commit + Push origin
7. Esperar Vercel deploy
8. Hard refresh
