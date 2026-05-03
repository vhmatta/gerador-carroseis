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
 * Template "Pílula + Headline grande" — Stories 1080×1920 (v7.7.7)
 *
 * v7.7.7: foto cobre 100% da peça (vai atrás do rodapé via alpha).
 */
export default function TemplateStoriesPilulaHeadline({
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
  const alturaRodape = obterAlturaRodape(tipoRodape, "stories");
  const alturaUtil = 1920 - alturaRodape;

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
        height: e(1920),
        backgroundColor: "#000",
        fontFamily: FONTE_KUFAM,
        overflow: "hidden",
      }}
    >
      {/* FOTO 100% (atrás do rodapé) */}
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
            height: e(1920),
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
            height: e(1920),
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

      <TexturaOverlay
        visivel={mostrarTextura}
        opacity={opacidadeTextura}
        modo={modoTextura}
        alturaUtil={alturaUtil}
        escala={escala}
      />

      <GradienteLeitura
        visivel={mostrarGradiente}
        opacidade={opacidadeGradiente}
        alturaUtil={alturaUtil}
        escala={escala}
      />

      {slide.mostrarPilula !== false && slide.pilula && (
        <div
          style={{
            position: "absolute",
            top: e(921),
            left: e(141),
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

      {slide.headline && (
        <div
          style={{
            position: "absolute",
            top: e(992),
            left: e(140),
            right: e(140),
            color: corHeadline,
            fontSize: e(180 * escalaGeral),
            fontWeight: 900,
            lineHeight: 0.92,
            letterSpacing: "-0.045em",
            whiteSpace: "pre-line",
          }}
        >
          {slide.headline}
        </div>
      )}

      {slide.subhead && (
        <div
          style={{
            position: "absolute",
            top: e(1177),
            left: e(140),
            right: e(140),
            color: corSubhead,
            fontSize: e(76 * escalaGeral),
            fontWeight: 700,
            fontStyle: "italic",
            lineHeight: 1.0,
            letterSpacing: "-0.025em",
            whiteSpace: "pre-line",
            textAlign: "right",
          }}
        >
          {slide.subhead}
        </div>
      )}

      {slide.tagline && (
        <div
          style={{
            position: "absolute",
            top: e(1340),
            left: e(140),
            right: e(140),
            color: corSubhead,
            fontSize: e(40 * escalaGeral),
            fontWeight: 700,
            lineHeight: 1.2,
            letterSpacing: "-0.005em",
            whiteSpace: "pre-line",
          }}
        >
          {slide.tagline}
        </div>
      )}

      {slide.mostrarFooter !== false && (
        <RodapePNG tipo={tipoRodape} formato="stories" escala={escala} />
      )}
    </div>
  );
}
