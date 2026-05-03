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
 * Template "Ícone + CTA outline" — Stories 1080×1920 (v7.7.6).
 *
 * Mesmo padrão do feed_icone_cta, em proporção 9:16. Espaçamentos do cliente:
 *   Ícone → Headline: 24px
 *   Headline → Subhead: 32px
 *   Subhead → CTA: 40px
 *   CTA → Rodapé: 72px
 *
 * Ícone começa em y=560 (mais abaixo que no feed pra acomodar a altura maior
 * disponível e dar respiro ao topo da peça).
 */
export default function TemplateRotativoStories({
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

  // ===== Tipografia (defaults equivalentes ao Feed, levemente maiores) =====
  const tamIcone = slide.tamIcone ?? 130;
  const espessuraIcone = slide.espessuraIcone ?? 2;
  const pesoHeadline = slide.pesoHeadline ?? 600;
  const tamHeadline = slide.tamHeadline ?? 100;
  const italicHeadline = slide.italicHeadline ?? false;
  const pesoSubhead = slide.pesoSubhead ?? 800;
  const tamSubhead = slide.tamSubhead ?? 100;
  const italicSubhead = slide.italicSubhead ?? false;
  const pesoTagline = slide.pesoTagline ?? 400;
  const tamTagline = slide.tamTagline ?? 42;
  const italicTagline = slide.italicTagline ?? false;
  const pesoCTA = slide.pesoCTA ?? 700;
  const tamCTA = slide.tamCTA ?? 36;
  const italicCTA = slide.italicCTA ?? false;

  // ===== Rodapé =====
  const tipoRodape: TipoRodape = slide.tipoRodape ?? "rodape_01";
  const alturaRodape = obterAlturaRodape(tipoRodape, "stories");
  const alturaUtil = 1920 - alturaRodape;

  // ===== Textura =====
  const mostrarTextura = slide.mostrarTextura !== false;
  const opacidadeTextura = slide.opacidadeTextura ?? 0.75;
  const modoTextura = slide.modoTextura ?? "overlay";

  // ===== Gradiente =====
  const mostrarGradiente = slide.mostrarGradienteLeitura ?? true;
  const opacidadeGradiente = slide.opacidadeGradienteLeitura ?? 0.5;

  // ===== Posições Y =====
  const yIcone = 560;
  const yHeadline = yIcone + tamIcone + 24;
  const ySubhead = yHeadline + tamHeadline * escalaGeral + 32;
  const yTagline = ySubhead + tamSubhead * escalaGeral + 28;
  const ctaBottom = alturaRodape + 72;

  return (
    <div
      style={{
        position: "relative",
        width: e(1080),
        height: e(1920),
        backgroundColor: "#000",
        fontFamily: FONTE_KUFAM,
        overflow: "hidden",
      }}
    >
      {/* FOTO */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: e(1080),
          height: e(alturaUtil),
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

      {/* TEXTURA */}
      <TexturaOverlay
        visivel={mostrarTextura}
        opacity={opacidadeTextura}
        modo={modoTextura}
        alturaUtil={alturaUtil}
        escala={escala}
      />

      {/* GRADIENTE DE LEITURA */}
      <GradienteLeitura
        visivel={mostrarGradiente}
        opacidade={opacidadeGradiente}
        alturaUtil={alturaUtil}
        escala={escala}
      />

      {/* ÍCONE */}
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

      {/* HEADLINE */}
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

      {/* SUBHEAD */}
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

      {/* TAGLINE */}
      {slide.tagline && (
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

      {/* CTA */}
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

      {/* RODAPÉ PNG */}
      {slide.mostrarFooter !== false && (
        <RodapePNG tipo={tipoRodape} formato="stories" escala={escala} />
      )}
    </div>
  );
}
