import React from "react";
import type { CoresResolvidas, TemaConfig, SlideData } from "./tipos";
import { resolverFonteHeadline } from "./tipos";

// ============================================================
// PRIMITIVOS VISUAIS COMPARTILHADOS
// Usados dentro de qualquer layout de qualquer tema.
// ============================================================

/** Topbar com nome da marca + numeração do slide. */
export function Topbar({
  cor,
  marca,
  numero,
  estilo = "padrao",
}: {
  cor: string;
  marca: string;
  numero: string;
  estilo?: "padrao" | "refined";
}) {
  const tamanho = estilo === "refined" ? 12 : 14;
  const tracking = estilo === "refined" ? "1.5px" : "2px";
  return (
    <div
      style={{
        position: "absolute",
        top: 42,
        left: 56,
        right: 56,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontSize: tamanho,
        fontWeight: 700,
        letterSpacing: tracking,
        textTransform: "uppercase",
        color: cor,
        opacity: 0.8,
        zIndex: 10,
      }}
    >
      <span>{marca}</span>
      <span>{numero}</span>
    </div>
  );
}

/** Kicker pequeno em caixa alta com divisor colorido abaixo. */
export function Kicker({
  texto,
  cor,
  accent,
  mostrarDivisor = true,
}: {
  texto: string;
  cor: string;
  accent: string;
  mostrarDivisor?: boolean;
}) {
  if (!texto) return null;
  return (
    <>
      <div
        style={{
          fontSize: 14,
          fontWeight: 800,
          letterSpacing: "3px",
          textTransform: "uppercase",
          color: cor,
        }}
      >
        {texto}
      </div>
      {mostrarDivisor && (
        <div
          style={{
            width: 72,
            height: 5,
            backgroundColor: accent,
            marginTop: 18,
            marginBottom: 18,
          }}
        />
      )}
    </>
  );
}

/** Headline grande (respeita fontFamily customizada + caps/escala do slide). */
export function Headline({
  texto,
  cor,
  tamanho = 88,
  uppercase = true,
  fontFamily,
  pesoHeadline = 900,
  letterSpacing = "-2px",
  lineHeight = 0.98,
  italic = false,
  slide,
  tamanhoMinimo = 28,
}: {
  texto: string;
  cor: string;
  tamanho?: number;
  uppercase?: boolean;
  fontFamily: string;
  pesoHeadline?: number;
  letterSpacing?: string;
  lineHeight?: number;
  italic?: boolean;
  /** Se passado, aplica overrides de caps e escala do slide */
  slide?: SlideData;
  /** Tamanho mínimo em px (pra garantir legibilidade) */
  tamanhoMinimo?: number;
}) {
  if (!texto) return null;

  // Resolve caps override do slide
  const capsEfetivo =
    slide?.headlineCaps === undefined ? uppercase : slide.headlineCaps;

  // Resolve escala override do slide
  const escala = slide?.headlineEscala ?? 1;
  const tamanhoFinal = Math.max(tamanhoMinimo, Math.round(tamanho * escala));

  return (
    <div
      style={{
        fontFamily,
        fontSize: tamanhoFinal,
        fontWeight: pesoHeadline,
        lineHeight,
        letterSpacing,
        textTransform: capsEfetivo ? "uppercase" : "none",
        color: cor,
        whiteSpace: "pre-line",
        fontStyle: italic ? "italic" : "normal",
      }}
    >
      {texto}
    </div>
  );
}

/** Corpo de texto padrão. */
export function Corpo({
  texto,
  cor,
  tamanho = 24,
  fontFamily,
  italic = false,
  maxWidth,
}: {
  texto: string;
  cor: string;
  tamanho?: number;
  fontFamily: string;
  italic?: boolean;
  maxWidth?: number;
}) {
  if (!texto) return null;
  return (
    <div
      style={{
        fontFamily,
        fontSize: tamanho,
        lineHeight: 1.45,
        fontWeight: 400,
        color: cor,
        whiteSpace: "pre-line",
        fontStyle: italic ? "italic" : "normal",
        maxWidth,
      }}
    >
      {texto}
    </div>
  );
}

/** Frase de destaque em bold colorido. */
export function Destaque({
  texto,
  cor,
  fontFamily,
  tamanho = 26,
}: {
  texto: string;
  cor: string;
  fontFamily: string;
  tamanho?: number;
}) {
  if (!texto) return null;
  return (
    <div
      style={{
        fontFamily,
        fontSize: tamanho,
        fontWeight: 900,
        lineHeight: 1.35,
        color: cor,
      }}
    >
      {texto}
    </div>
  );
}

/** Pill de CTA arredondado. */
export function Pill({
  texto,
  corFundo,
  corTexto,
}: {
  texto: string;
  corFundo: string;
  corTexto: string;
}) {
  if (!texto) return null;
  return (
    <div
      style={{
        display: "inline-block",
        backgroundColor: corFundo,
        color: corTexto,
        padding: "12px 24px",
        borderRadius: 999,
        fontSize: 14,
        fontWeight: 900,
        letterSpacing: "2px",
        textTransform: "uppercase",
      }}
    >
      {texto}
    </div>
  );
}

/** Placeholder visual quando não há foto (listra diagonal). */
export function Placeholder({
  largura,
  altura,
  accent,
  texto = "[ Adicione uma foto aqui ]",
  borderRadius = 0,
}: {
  largura: number;
  altura: number;
  accent: string;
  texto?: string;
  borderRadius?: number;
}) {
  return (
    <div
      style={{
        position: "relative",
        width: largura,
        height: altura,
        backgroundColor: "#1f1f1f",
        backgroundImage:
          "repeating-linear-gradient(45deg, #2a2a2a, #2a2a2a 20px, #1a1a1a 20px, #1a1a1a 40px)",
        borderRadius,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 20,
          border: `2px dashed ${accent}80`,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "10%",
          right: "10%",
          transform: "translateY(-50%)",
          backgroundColor: "rgba(0,0,0,0.85)",
          border: `1px solid ${accent}`,
          padding: "14px 18px",
          color: accent,
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: "2px",
          textTransform: "uppercase",
          textAlign: "center",
          lineHeight: 1.5,
        }}
      >
        {texto}
      </div>
    </div>
  );
}

/** Foto com fallback pra placeholder. */
export function FotoOuPlaceholder({
  url,
  largura,
  altura,
  accent,
  texto,
  style,
  borderRadius = 0,
}: {
  url: string;
  largura: number;
  altura: number;
  accent: string;
  texto?: string;
  style?: React.CSSProperties;
  borderRadius?: number;
}) {
  if (url) {
    return (
      <img
        src={url}
        alt=""
        crossOrigin="anonymous"
        style={{
          width: largura,
          height: altura,
          objectFit: "cover",
          borderRadius,
          ...style,
        }}
      />
    );
  }
  return (
    <div style={style}>
      <Placeholder largura={largura} altura={altura} accent={accent} texto={texto} borderRadius={borderRadius} />
    </div>
  );
}

/** Big number centralizado (ex: +32%). */
export function BigNumber({
  texto,
  cor,
  fontFamily,
  tamanho = 240,
}: {
  texto: string;
  cor: string;
  fontFamily: string;
  tamanho?: number;
}) {
  return (
    <div
      style={{
        fontFamily,
        fontSize: tamanho,
        fontWeight: 900,
        lineHeight: 0.85,
        letterSpacing: "-8px",
        color: cor,
      }}
    >
      {texto}
    </div>
  );
}

/** Helper: aplica cantos arredondados ao slide inteiro (usado no Keynote Minimal). */
export function containerArredondado(raio: number, fundo: string): React.CSSProperties {
  return {
    position: "absolute",
    inset: 0,
    backgroundColor: fundo,
    borderRadius: raio,
    overflow: "hidden",
  };
}
