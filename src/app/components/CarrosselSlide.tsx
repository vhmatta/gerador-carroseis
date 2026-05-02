import { forwardRef } from "react";
import { obterTema } from "./temas";
import { resolverCores } from "./temas/tipos";
import type { SlideData, TemaId } from "./temas/tipos";

// Re-exports pra retrocompatibilidade
export type { SlideData, TemaId, LayoutId, FonteHeadline } from "./temas/tipos";
export { criarSlideVazio } from "./temas/tipos";

interface Props {
  slide: SlideData;
  index: number;
  total: number;
  marca: string;
  temaId: TemaId;
  /** Quando true, sem transform — pra captura via html-to-image */
  escalaReal?: boolean;
  /** Escala visual pra preview miniaturizado */
  escala?: number;
}

const CarrosselSlide = forwardRef<HTMLDivElement, Props>(function CarrosselSlide(
  { slide, index, total, marca, temaId, escalaReal = false, escala = 1 },
  ref
) {
  const tema = obterTema(temaId);
  const numero = `${String(index + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`;
  const coresResolvidas = resolverCores(slide, tema);
  const transform = escalaReal ? undefined : `scale(${escala})`;
  const ehUltimo = index === total - 1;

  // Acha o layout dentro do tema
  const layoutDef = tema.layouts.find((l) => l.id === slide.layout) || tema.layouts[0];

  return (
    <div
      ref={ref}
      style={{
        width: 1080,
        height: 1350,
        transform,
        transformOrigin: "top left",
        position: "relative",
        flexShrink: 0,
      }}
    >
      {layoutDef.render({
        slide,
        tema,
        marca,
        numero,
        coresResolvidas,
        ehUltimo,
      })}

      {/* Seta indicativa "deslize" no canto inferior direito (todos exceto último) */}
      {!ehUltimo && (
        <SetaDeslizar accent={coresResolvidas.accent} />
      )}
    </div>
  );
});

/**
 * Seta indicativa de deslizar — aparece em todos os slides menos o último.
 * Posicionada no canto inferior direito do slide.
 *
 * v7.5: Estilo outline — só contorno do círculo (sem fundo sólido) + seta
 * na mesma cor do contorno. Funciona em qualquer fundo: o accent já
 * resolve o contraste (em fundo amarelo, accent vira preto; em fundo
 * preto, accent fica amarelo).
 */
function SetaDeslizar({ accent }: { accent: string }) {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 32,
        right: 32,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 48,
        height: 48,
        borderRadius: "50%",
        backgroundColor: "transparent",
        border: `2px solid ${accent}`,
        opacity: 0.75,
        zIndex: 10,
      }}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke={accent}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </div>
  );
}

export default CarrosselSlide;
