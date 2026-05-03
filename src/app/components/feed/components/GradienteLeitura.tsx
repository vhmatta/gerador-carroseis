/**
 * Gradiente sutil de leitura — v7.7.6.
 *
 * Aplica gradiente vertical preto→transparente (escurecendo a base, clareando o topo)
 * pra garantir legibilidade dos textos sobre fotos contrastadas.
 *
 * IMPORTANTE: o gradiente NUNCA pode invadir o rodapé. Por isso ele é renderizado
 * apenas na "área útil" da peça — do topo até o início do rodapé.
 *
 * Z-index: fica ABAIXO do rodapé (que tem z-index 50) e ABAIXO dos textos
 * (que ficam acima por ordem de renderização DOM).
 */
export default function GradienteLeitura({
  visivel = true,
  opacidade = 0.5,
  alturaUtil,
  escala = 1,
}: {
  visivel?: boolean;
  /** Opacidade do gradiente (0-1). */
  opacidade?: number;
  /**
   * Altura útil em px (no espaço 1080×H) onde o gradiente pode aparecer
   * — ou seja, da peça toda menos a faixa do rodapé.
   * Ex: feed com rodapé de 462px → alturaUtil = 1350-462 = 888.
   */
  alturaUtil: number;
  escala?: number;
}) {
  if (!visivel) return null;

  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: `${1080 * escala}px`,
        height: `${alturaUtil * escala}px`,
        background: `linear-gradient(180deg,
          rgba(0,0,0,0) 0%,
          rgba(0,0,0,0) 35%,
          rgba(0,0,0,${opacidade * 0.5}) 65%,
          rgba(0,0,0,${opacidade}) 100%)`,
        pointerEvents: "none",
      }}
    />
  );
}
