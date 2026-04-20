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
      })}
    </div>
  );
});

export default CarrosselSlide;
