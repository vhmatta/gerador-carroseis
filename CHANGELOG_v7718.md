# v7.7.18 — HOTFIX: imports faltando do BlocoTextoWrapper

## Bug crítico resolvido

A v7.7.17 introduziu o `BlocoTextoWrapper` mas em **3 dos 7 templates**
o componente foi USADO sem ter sido IMPORTADO, causando:

```
ReferenceError: BlocoTextoWrapper is not defined
```

E tela preta no app inteiro. Causa: minha regex de inserção do import
falhou nos arquivos que tinham `import { ... } from "lucide-react"`
DEPOIS dos imports de `../components/`. Foi um erro de processo, não
de design.

## Templates afetados (agora corrigidos)

- `feed_icone_cta.tsx` ✅ import adicionado
- `stories_icone_cta.tsx` ✅ import adicionado
- `rotativo_feed.tsx` ✅ import adicionado

## Verificação

```bash
$ for f in feed/templates/*.tsx; do
    grep -c "import.*BlocoTextoWrapper" "$f"
  done
# Todos retornaram 1 ✅
```

## Validação
- Vite build production: ✅ 1664 módulos, 0 erros
- Bundle: `index-CaapjChi.js`

## Como aplicar

1. GitHub Desktop → repo → Show in Explorer
2. Esvaziar pasta (preservar `.git`)
3. Extrair ZIP da v7.7.18
4. Commit + Push origin
5. Hard refresh

## Lição aprendida

Ao usar regex pra modificação em massa de imports, sempre validar
com `grep -c` em todos os arquivos antes do build. Build local não
detecta esse tipo de erro porque é dynamic ESM lookup; só o runtime
no navegador detecta.
