/**
 * Parser de texto colado para módulo Feed/Stories.
 *
 * Formato esperado:
 *
 *   SLIDE 1
 *   TEMPLATE: ipva_iptu_feed
 *   PILULA: Gestão financeira pessoal
 *   HEADLINE: Organize
 *   SUBHEAD: seus impostos
 *   TAGLINE: Parcele IPVA e IPTU com inteligência.
 *
 *   ---
 *
 *   SLIDE 2
 *   TEMPLATE: rotativo_feed
 *   HEADLINE: Rotativo
 *   SUBHEAD: ou estratégia?
 *   TAGLINE: Entenda a diferença.
 *   CTA: Faça a escolha inteligente
 *
 * Separadores: "---" ou "SLIDE N" inicial.
 * Campos suportados: TEMPLATE, PILULA, HEADLINE, SUBHEAD, TAGLINE, CTA
 *
 * Tudo case-insensitive. Multi-linha: continuar sem rótulo até próximo CAMPO: ou divisor.
 */

import type { FeedSlideData, FeedTemplateId } from "../components/feed/templates/tipos";

const TEMPLATES_VALIDOS: FeedTemplateId[] = [
  "ipva_iptu_feed",
  "ipva_iptu_stories",
  "rotativo_feed",
  "rotativo_stories",
  "oque_e_feed",
  "oque_e_stories",
  "ate3_cartoes_feed",
  "ate3_cartoes_stories",
];

const ROTULOS: Record<string, keyof FeedSlideData> = {
  TEMPLATE: "templateId",
  PILULA: "pilula",
  PÍLULA: "pilula",
  KICKER: "pilula",
  HEADLINE: "headline",
  TITULO: "headline",
  TÍTULO: "headline",
  SUBHEAD: "subhead",
  SUBTITULO: "subhead",
  SUBTÍTULO: "subhead",
  TAGLINE: "tagline",
  DESTAQUE: "tagline",
  CTA: "cta",
  BOTAO: "cta",
  BOTÃO: "cta",
};

function ehDivisor(linha: string): boolean {
  const t = linha.trim();
  if (t === "" || t === "---" || t === "===") return true;
  if (/^[\-=]{3,}$/.test(t)) return true;
  if (/^slide\s*\d+\s*$/i.test(t)) return true;
  if (/^={2,}\s*slide\s*\d*\s*={2,}$/i.test(t)) return true;
  return false;
}

function parseRotulo(linha: string): { campo: keyof FeedSlideData; valor: string } | null {
  const m = linha.match(/^\s*([A-ZÀ-Ú]+)\s*[:：]\s*(.*)$/i);
  if (!m) return null;
  const rotulo = m[1].toUpperCase();
  const campo = ROTULOS[rotulo];
  if (!campo) return null;
  return { campo, valor: m[2].trim() };
}

export interface ResultadoParser {
  slides: FeedSlideData[];
  avisos: string[];
}

export function parsearTextoFeedStories(texto: string): ResultadoParser {
  const linhas = texto.replace(/\r\n/g, "\n").split("\n");
  const slides: FeedSlideData[] = [];
  const avisos: string[] = [];

  let slideAtual: Partial<FeedSlideData> | null = null;
  let ultimoCampo: keyof FeedSlideData | null = null;

  const finalizarSlide = () => {
    if (!slideAtual) return;
    if (!slideAtual.templateId) {
      avisos.push(
        `Slide ${slides.length + 1} sem TEMPLATE: definido — pulado. (Adicione "TEMPLATE: ipva_iptu_feed" ou outro)`
      );
      slideAtual = null;
      return;
    }
    slides.push({
      id: Math.random().toString(36).substring(2, 10),
      templateId: slideAtual.templateId,
      pilula: slideAtual.pilula || "",
      headline: slideAtual.headline || "",
      subhead: slideAtual.subhead || "",
      tagline: slideAtual.tagline || "",
      cta: slideAtual.cta || "",
      fotoUrl: "",
      fotoPosicao: "center",
      mostrarPilula: !!slideAtual.pilula,
      mostrarCTA: !!slideAtual.cta,
      mostrarFooter: true,
    });
    slideAtual = null;
    ultimoCampo = null;
  };

  for (let i = 0; i < linhas.length; i++) {
    const linha = linhas[i];

    if (ehDivisor(linha)) {
      finalizarSlide();
      continue;
    }

    const rotulado = parseRotulo(linha);
    if (rotulado) {
      if (!slideAtual) slideAtual = {};
      const { campo, valor } = rotulado;

      if (campo === "templateId") {
        const tplLimpo = valor.toLowerCase().trim() as FeedTemplateId;
        if (TEMPLATES_VALIDOS.includes(tplLimpo)) {
          slideAtual.templateId = tplLimpo;
        } else {
          avisos.push(
            `Linha ${i + 1}: TEMPLATE "${valor}" não reconhecido. Templates válidos: ${TEMPLATES_VALIDOS.join(", ")}`
          );
        }
      } else {
        // Campo de texto
        (slideAtual as Record<string, unknown>)[campo] = valor;
      }
      ultimoCampo = campo;
    } else if (ultimoCampo && ultimoCampo !== "templateId" && slideAtual) {
      // Linha continua o último campo (multi-linha)
      const valorAtual = (slideAtual as Record<string, string>)[ultimoCampo] || "";
      const adicional = linha.trim();
      if (adicional) {
        (slideAtual as Record<string, string>)[ultimoCampo] = valorAtual
          ? `${valorAtual}\n${adicional}`
          : adicional;
      }
    }
  }

  finalizarSlide();

  if (slides.length === 0 && texto.trim()) {
    avisos.push(
      "Nenhum slide foi reconhecido. Verifique o formato — exemplo:\n\nSLIDE 1\nTEMPLATE: ipva_iptu_feed\nHEADLINE: Organize\n..."
    );
  }

  return { slides, avisos };
}

/** Exemplo de texto pra mostrar como guia ao usuário. */
export const EXEMPLO_TEXTO_COLA = `SLIDE 1
TEMPLATE: ipva_iptu_feed
PILULA: Gestão financeira pessoal
HEADLINE: Organize
SUBHEAD: seus impostos
TAGLINE: Parcele IPVA e IPTU com inteligência.

---

SLIDE 2
TEMPLATE: ipva_iptu_stories
PILULA: Gestão financeira pessoal
HEADLINE: Organize
SUBHEAD: seus impostos
TAGLINE: Parcele IPVA e IPTU com inteligência.

---

SLIDE 3
TEMPLATE: rotativo_feed
HEADLINE: Rotativo
SUBHEAD: ou estratégia?
TAGLINE: Entenda a diferença.
CTA: Faça a escolha inteligente`;
