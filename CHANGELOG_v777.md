# v7.7.7 — Foto cobrindo 100% + bloco coeso ancorado no CTA

## Correções

### Foto sempre cobre 100% da peça
**Bug v7.7.6:** quando se escolhia `rodape_01` (amarelo), a foto era recortada
em y=888 (alturaUtil) e aparecia uma faixa preta entre o final da foto e o
início do amarelo nas laterais (visível por causa dos cantos arredondados do
rodapé com alpha).

**Fix v7.7.7:** a foto agora cobre `height: 100%` da peça (1350 ou 1920px).
O rodapé PNG fica por cima, e como tem alpha nos cantos arredondados, a foto
aparece naturalmente atrás do rodapé sem deixar espaço preto.

Aplicado em todos os 4 templates implementados.

### Bloco de texto coeso e ancorado no CTA (apenas templates `_icone_cta`)
**Bug v7.7.6:** nos templates `feed_icone_cta` e `stories_icone_cta`, o CTA
ficava ancorado por bottom no rodapé (72px) mas os textos acima usavam top
absoluto (y=320 fixo). Quando se trocava de `rodape_02` (curto) pra `rodape_01`
(alto), a área do bloco mudava e o CTA podia colar no subtítulo.

**Fix v7.7.7:** o bloco inteiro (Ícone + Headline + Subhead + Tagline + CTA)
agora é COESO. O CTA fica fixo a 72px do rodapé, e os outros elementos são
calculados PRA CIMA a partir dele com gaps fixos:
- Ícone → Headline: 24px
- Headline → Subhead: 32px
- Subhead → Tagline (se houver): 24px
- Tagline → CTA (se houver): 24px
- Subhead → CTA (sem tagline): 40px
- **CTA → Rodapé: 72px FIXO**

Resultado: trocar de rodapé não embola mais o CTA com o subtítulo.

## Arquivos editados
- `src/app/components/feed/templates/feed_icone_cta.tsx` — bloco coeso
- `src/app/components/feed/templates/stories_icone_cta.tsx` — bloco coeso
- `src/app/components/feed/templates/feed_pilula_headline.tsx` — foto 100%
- `src/app/components/feed/templates/stories_pilula_headline.tsx` — foto 100%
- `package.json` — version bump para 7.7.7

## Pendências (próxima versão)
1. **5 templates ainda em placeholder:**
   - `feed_amarelo_ilustracao` / `stories_amarelo_ilustracao`
   - `feed_central_asset` / `stories_central_asset`
2. **Observações de ajuste com imagens** — cliente trará prints específicos
