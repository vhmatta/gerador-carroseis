# v7.7.22 — FIX drag vertical da foto

## 🐛 Bug v7.7.21

Reportado: drag horizontal funcionava, vertical não.

## Causa raiz

O `FotoDraggable` da v7.7.21 usava combo `objectFit: cover` +
`objectPosition: "X% Y%"`. Esse combo tem uma limitação CSS:

`objectPosition` só desloca dentro do que foi cropado pelo `objectFit`.
Se a imagem fonte é landscape e o container é portrait (Feed 1080×1350,
Stories 1080×1920), o `objectFit: cover` corta as laterais mas
preserva 100% da altura. Resultado: `objectPosition X` consegue mover
horizontalmente, mas Y não tem o que mover.

## Fix v7.7.22

Trocado `objectPosition` por `transform: translate()` combinado com
`scale()`. Agora a imagem é deslocada como um todo, em ambos os eixos
livremente.

```tsx
// ANTES (v7.7.21)
objectPosition: `${50 + offsetX}% ${50 + offsetY}%`
transform: zoom !== 1 ? `scale(${zoom})` : undefined

// AGORA (v7.7.22)
objectPosition: "center"
transform: `scale(${zoom}) translate(${offsetX/zoom}%, ${offsetY/zoom}%)`
```

Detalhes:
- `transform: translate()` em % é relativo ao tamanho do elemento
  (não do container) — como a img tem `width: 100%`, traduz 1:1
- Divisão por `zoom` porque translate é aplicado APÓS scale (na
  ordem CSS o último é executado primeiro)
- Sinal do drag invertido: agora foto SEGUE o mouse (sinal natural,
  igual Figma/Photoshop), antes seguia o sinal contrário (porque
  objectPosition funciona invertido)
- Movimentação multiplicada por zoom: arrastar 10% num zoom 2x
  desloca 20% (sensação natural de "arrastar a imagem completa")

## Arquivos editados
- `src/app/components/feed/components/FotoDraggable.tsx`
- `package.json` — version 7.7.22

## Validação
- Vite build production: ✅ 1664 módulos, 0 erros
- Bundle: 518KB

## Texto do commit

**Summary:**
fix: v7.7.22 — Drag vertical da foto funcionando

**Description:**
Bug v7.7.21: drag horizontal funcionava, vertical não.

Causa: combo objectFit:cover + objectPosition tem limitação. Quando imagem fonte é landscape e container é portrait (Feed/Stories), objectFit:cover corta laterais mas preserva altura inteira. Resultado: objectPosition Y não tinha o que mover.

Fix: trocado por transform translate() combinado com scale().
- objectPosition: "center" (fixo)
- transform: scale(zoom) translate(X/zoom%, Y/zoom%)
- Sinal do drag invertido (foto segue mouse, sinal natural)
- Movimentação multiplicada por zoom (sensação natural)

Build OK, 1664 módulos, 0 erros.
