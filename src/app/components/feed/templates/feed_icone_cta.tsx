import type { FeedSlideData } from "./tipos";
import {
  FONTE_KUFAM,
  obterAlturaRodape,
  type TipoRodape,
} from "./tipos";
import RodapePNG from "../components/RodapePNG";
import TexturaOverlay from "../components/TexturaOverlay";
import GradienteLeitura from "../components/GradienteLeitura";
import { RefreshCcw } from "lucide-react";

/**
 * Template "Ícone + CTA outline" — Feed 1080×1350 (v7.7.7)
 *
 * v7.7.7:
 *  - Foto cobre 100% da peça (vai atrás do rodapé via alpha) — elimina faixa
 *    preta lateral que aparecia com rodape_01 amarelo.
 *  - Bloco de texto (ícone + headline + subhead + tagline + CTA) é COESO:
 *    todos os gaps fixos, CTA sempre colado no fim do bloco.
 *  - O bloco é ancorado pelo BOTTOM do CTA (= alturaRodape + 72), e os
 *    elementos fluem pra cima a partir dele. Assim o CTA fica fixo a 72px
 *    do rodapé independente do tipo de rodapé escolhido.
 *
 * Espaçamentos pedidos pelo cliente (mantidos):
 *   Ícone → Headline: 24px
 *   Headline → Subhead: 32px
 *   Subhead → CTA: 40px        (Tagline fica entre subhead e CTA, com gaps
 *                                proporcionais quando presente)
 *   CTA → Rodapé: 72px (FIXO)
 */
export default function TemplateFeedIconeCta({
  slide,
  escala = 1,
}: {
  slide: FeedSlideData;
  escala?: number;
}) {
  const e = (n: number) => `${n * escala}px`;

  // ===== Cores =====
  const corHeadline = slide.corHeadline || "#FFFFFF";
  const corSubhead = slide.corSubhead || "#FFFFFF";
  const corCTA = slide.corCTA || "#FFFFFF";
  const corIcone = slide.corIcone || "#FFFFFF";

  const escalaGeral = slide.escalaGeral ?? 1;

  // ===== Tipografia (defaults originais) =====
  const tamIcone = slide.tamIcone ?? 120;
  const espessuraIcone = slide.espessuraIcone ?? 2;
  const pesoHeadline = slide.pesoHeadline ?? 600;
  const tamHeadline = slide.tamHeadline ?? 92;
  const italicHeadline = slide.italicHeadline ?? false;
  const pesoSubhead = slide.pesoSubhead ?? 800;
  const tamSubhead = slide.tamSubhead ?? 92;
  const italicSubhead = slide.italicSubhead ?? false;
  const pesoTagline = slide.pesoTagline ?? 400;
  const tamTagline = slide.tamTagline ?? 38;
  const italicTagline = slide.italicTagline ?? false;
  const pesoCTA = slide.pesoCTA ?? 700;
  const tamCTA = slide.tamCTA ?? 32;
  const italicCTA = slide.italicCTA ?? false;

  // ===== Rodapé =====
  const tipoRodape: TipoRodape = slide.tipoRodape ?? "rodape_01";
  const alturaRodape = obterAlturaRodape(tipoRodape, "feed");
  const alturaUtil = 1350 - alturaRodape;

  // ===== Textura =====
  const mostrarTextura = slide.mostrarTextura !== false;
  const opacidadeTextura = slide.opacidadeTextura ?? 0.75;
  const modoTextura = slide.modoTextura ?? "overlay";

  // ===== Gradiente =====
  const mostrarGradiente = slide.mostrarGradienteLeitura ?? true;
  const opacidadeGradiente = slide.opacidadeGradienteLeitura ?? 0.5;

  // ===== Layout do bloco coeso (ancorado pelo CTA) =====
  // CTA bottom fixo a 72px do rodapé.
  const ctaBottom = alturaRodape + 72;

  // Altura efetiva do CTA (pílula com paddings 22 top + 20 bottom + tamCTA)
  const alturaCTA = tamCTA * escalaGeral + 22 + 20 + 6; // +6 buffer borda
  const yCTA = 1350 - ctaBottom - alturaCTA;

  // Tagline (se houver) fica entre subhead e CTA. Quando há tagline, gap
  // subhead→tagline=24 e tagline→CTA=24 (ainda totalizando 40 + tamTagline).
  // Quando não há tagline, gap direto subhead→CTA=40.
  const temTagline = !!slide.tagline;
  const gapSubheadCTA = 40;
  const gapHeadlineSubhead = 32;
  const gapIconeHeadline = 24;

  // Calcula bottom-up:
  // yCTA já calculado.
  // Tagline (se houver):
  //   yTagline = yCTA - 24 (gap até CTA) - tamTagline
  // Subhead:
  //   yTagline ? ySubhead = yTagline - 24 (gap subhead-tagline) - tamSubhead
  //   senão     ySubhead = yCTA - gapSubheadCTA - tamSubhead
  // Headline:
  //   yHeadline = ySubhead - gapHeadlineSubhead - tamHeadline
  // Ícone:
  //   yIcone = yHeadline - gapIconeHeadline - tamIcone

  const yTagline = temTagline
    ? yCTA - 24 - tamTagline * escalaGeral
    : null;

  const ySubhead = temTagline
    ? (yTagline as number) - 24 - tamSubhead * escalaGeral
    : yCTA - gapSubheadCTA - tamSubhead * escalaGeral;

  const yHeadline = ySubhead - gapHeadlineSubhead - tamHeadline * escalaGeral;
  const yIcone = yHeadline - gapIconeHeadline - tamIcone;

  return (
    <div
      style={{
        position: "relative",
        width: e(1080),
        height: e(1350),
        backgroundColor: "#000",
        fontFamily: FONTE_KUFAM,
        overflow: "hidden",
      }}
    >
      {/* ============ FOTO de fundo (100% da peça — vai atrás do rodapé) ============ */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: e(1080),
          height: e(1350),
          overflow: "hidden",
        }}
      >
        {slide.fotoUrl ? (
          <img
            src={slide.fotoUrl}
            alt=""
            crossOrigin="anonymous"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: slide.fotoPosicao || "center",
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              background: "linear-gradient(135deg, #2a2a2a, #0a0a0a)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#666",
              fontSize: e(20),
            }}
          >
            [ FOTO DE FUNDO ]
          </div>
        )}
      </div>

      {/* ============ TEXTURA (clipada acima do rodapé) ============ */}
      <TexturaOverlay
        visivel={mostrarTextura}
        opacity={opacidadeTextura}
        modo={modoTextura}
        alturaUtil={alturaUtil}
        escala={escala}
      />

      {/* ============ GRADIENTE DE LEITURA ============ */}
      <GradienteLeitura
        visivel={mostrarGradiente}
        opacidade={opacidadeGradiente}
        alturaUtil={alturaUtil}
        escala={escala}
      />

      {/* ============ ÍCONE ============ */}
      {slide.mostrarIcone !== false && (
        <div
          style={{
            position: "absolute",
            top: e(yIcone),
            left: e(72),
            color: corIcone,
            display: "flex",
          }}
        >
          <RefreshCcw size={tamIcone * escala} strokeWidth={espessuraIcone} />
        </div>
      )}

      {/* ============ HEADLINE ============ */}
      {slide.headline && (
        <div
          style={{
            position: "absolute",
            top: e(yHeadline),
            left: e(72),
            right: e(72),
            color: corHeadline,
            fontSize: e(tamHeadline * escalaGeral),
            fontWeight: pesoHeadline,
            fontStyle: italicHeadline ? "italic" : "normal",
            lineHeight: 1.0,
            letterSpacing: "-0.02em",
            whiteSpace: "pre-line",
          }}
        >
          {slide.headline}
        </div>
      )}

      {/* ============ SUBHEAD ============ */}
      {slide.subhead && (
        <div
          style={{
            position: "absolute",
            top: e(ySubhead),
            left: e(72),
            right: e(72),
            color: corSubhead,
            fontSize: e(tamSubhead * escalaGeral),
            fontWeight: pesoSubhead,
            fontStyle: italicSubhead ? "italic" : "normal",
            lineHeight: 1.0,
            letterSpacing: "-0.025em",
            whiteSpace: "pre-line",
          }}
        >
          {slide.subhead}
        </div>
      )}

      {/* ============ TAGLINE (entre subhead e CTA quando presente) ============ */}
      {temTagline && yTagline !== null && (
        <div
          style={{
            position: "absolute",
            top: e(yTagline),
            left: e(72),
            right: e(72),
            color: corSubhead,
            fontSize: e(tamTagline * escalaGeral),
            fontWeight: pesoTagline,
            fontStyle: italicTagline ? "italic" : "normal",
            lineHeight: 1.2,
            letterSpacing: "-0.005em",
            whiteSpace: "pre-line",
          }}
        >
          {slide.tagline}
        </div>
      )}

      {/* ============ CTA — 72px fixo do rodapé ============ */}
      {slide.mostrarCTA !== false && slide.cta && (
        <div
          style={{
            position: "absolute",
            bottom: e(ctaBottom),
            left: e(72),
            backgroundColor: "transparent",
            color: corCTA,
            border: `${e(3)} solid ${corCTA}`,
            borderRadius: e(60),
            fontSize: e(tamCTA * escalaGeral),
            fontWeight: pesoCTA,
            fontStyle: italicCTA ? "italic" : "normal",
            letterSpacing: "-0.005em",
            paddingTop: e(22),
            paddingBottom: e(20),
            paddingLeft: e(48),
            paddingRight: e(48),
            lineHeight: 1,
            display: "inline-block",
            boxSizing: "border-box",
          }}
        >
          {slide.cta}
        </div>
      )}

      {/* ============ RODAPÉ PNG ============ */}
      {slide.mostrarFooter !== false && (
        <RodapePNG tipo={tipoRodape} formato="feed" escala={escala} />
      )}
    </div>
  );
}
