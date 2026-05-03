/**
 * Camada de textura overlay aplicada sobre toda a peça.
 *
 * Visual: imagem PNG/JPEG com manchas orgânicas de luz/sombra + grão sutil,
 * aplicada em modo `mix-blend-mode: overlay` com opacity 75%, exatamente como
 * no Figma (camada "BG" 75% Overlay, conforme print do cliente).
 *
 * Posicionamento:
 *  - position: absolute, inset: 0 (cobre 100%)
 *  - z-index: deve ficar ABAIXO dos textos mas ACIMA da foto e do footer
 *  - pointer-events: none (não atrapalha cliques)
 */
export default function TexturaOverlay({
  opacity = 0.75,
  modo = "overlay",
  visivel = true,
}: {
  /** Opacidade da textura (0 a 1). Default 0.75 (igual Figma). */
  opacity?: number;
  /** Modo de mistura. Default "overlay" (efeito do Figma). */
  modo?: "overlay" | "soft-light" | "multiply" | "normal";
  /** Permite ocultar via toggle no painel. */
  visivel?: boolean;
}) {
  if (!visivel) return null;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundImage: "url('/textura-bg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        mixBlendMode: modo,
        opacity,
        pointerEvents: "none",
      }}
      aria-hidden
    />
  );
}
