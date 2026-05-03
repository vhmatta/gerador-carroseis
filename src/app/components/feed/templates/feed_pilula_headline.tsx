import type { FeedSlideData } from "./tipos";
import {
  PARCELE_AQUI_CORES,
  FONTE_KUFAM,
  obterAlturaRodape,
  type TipoRodape,
} from "./tipos";
import RodapePNG from "../components/RodapePNG";
import TexturaOverlay from "../components/TexturaOverlay";
import GradienteLeitura from "../components/GradienteLeitura";

/**
 * Template "Pílula + Headline grande" — Feed 1080×1350 (v7.7.7)
 *
 * v7.7.7:
 *  - Foto cobre 100% da peça (vai atrás do rodapé via alpha) — elimina faixa
 *    preta lateral que aparecia com rodape_01 amarelo.
 *  - Textos com posições absolutas (layout fixo do Figma) preservados.
 */
export default function TemplateFeedPilulaHeadline({
  slide,
  escala = 1,
}: {
  slide: FeedSlideData;
  escala?: number;
}) {
  const e = (n: number) => `${n * escala}px`;

  const corHeadline = slide.corHeadline || PARCELE_AQUI_CORES.amareloPrincipal;
  const corSubhead = slide.corSubhead || PARCELE_AQUI_CORES.cremeFooter;
  const corPilulaFundo = PARCELE_AQUI_CORES.cremeFooter;
  const corPilulaTexto = PARCELE_AQUI_CORES.marromTexto;

  const escalaGeral = slide.escalaGeral ?? 1;

  const tipoRodape: TipoRodape = slide.tipoRodape ?? "rodape_02";
  const alturaRodape = obterAlturaRodape(tipoRodape, "feed");
  const alturaUtil = 1350 - alturaRodape;

  const mostrarTextura = slide.mostrarTextura !== false;
  const opacidadeTextura = slide.opacidadeTextura ?? 0.75;
  const modoTextura = slide.modoTextura ?? "overlay";

  const mostrarGradiente = slide.mostrarGradienteLeitura ?? true;
  const opacidadeGradiente = slide.opacidadeGradienteLeitura ?? 0.5;

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
      {/* FOTO 100% (vai atrás do rodapé) */}
      {slide.fotoUrl ? (
        <img
          src={slide.fotoUrl}
          alt=""
          crossOrigin="anonymous"
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: e(1080),
            height: e(1350),
            objectFit: "cover",
            objectPosition: slide.fotoPosicao || "center",
          }}
        />
      ) : (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: e(1080),
            height: e(1350),
            background:
              "linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 50%, #0a0a0a 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#666",
            fontSize: e(20),
            letterSpacing: "0.1em",
          }}
        >
          [ FOTO DE FUNDO ]
        </div>
      )}

      {/* TEXTURA (clipada acima do rodapé) */}
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

      {/* PÍLULA */}
      {slide.mostrarPilula !== false && slide.pilula && (
        <div
          style={{
            position: "absolute",
            top: e(489),
            left: e(148),
            backgroundColor: corPilulaFundo,
            borderRadius: e(24.5),
            color: corPilulaTexto,
            fontSize: e(20 * escalaGeral),
            fontWeight: 700,
            letterSpacing: "-0.005em",
            whiteSpace: "nowrap",
            paddingTop: e(14),
            paddingBottom: e(11),
            paddingLeft: e(28),
            paddingRight: e(28),
            lineHeight: 1,
            display: "inline-block",
            maxWidth: e(800),
            overflow: "hidden",
            textOverflow: "ellipsis",
            boxSizing: "border-box",
          }}
        >
          {slide.pilula}
        </div>
      )}

      {/* HEADLINE */}
      {slide.headline && (
        <div
          style={{
            position: "absolute",
            top: e(560),
            left: e(140),
            right: e(140),
            color: corHeadline,
            fontSize: e(165 * escalaGeral),
            fontWeight: 800,
            lineHeight: 0.95,
            letterSpacing: "-0.04em",
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
            top: e(740),
            left: e(140),
            right: e(140),
            color: corSubhead,
            fontSize: e(72 * escalaGeral),
            fontWeight: 500,
            lineHeight: 1.0,
            letterSpacing: "-0.02em",
            whiteSpace: "pre-line",
            textAlign: "right",
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
            top: e(905),
            left: e(140),
            right: e(140),
            color: corSubhead,
            fontSize: e(38 * escalaGeral),
            fontWeight: 600,
            lineHeight: 1.2,
            letterSpacing: "-0.01em",
            whiteSpace: "pre-line",
          }}
        >
          {slide.tagline}
        </div>
      )}

      {/* RODAPÉ PNG */}
      {slide.mostrarFooter !== false && (
        <RodapePNG tipo={tipoRodape} formato="feed" escala={escala} />
      )}
    </div>
  );
}
