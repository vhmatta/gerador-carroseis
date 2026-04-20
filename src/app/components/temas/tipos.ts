import type React from "react";

// ============================================================
// TIPOS COMPARTILHADOS ENTRE TODOS OS TEMAS DE CARROSSEL
// ============================================================

/**
 * IDs dos temas disponíveis. Cada tema tem seus próprios layouts.
 * Novos temas são adicionados aqui + arquivo correspondente em /temas.
 */
export type TemaId = "brands_decoded_classic" | "editorial_refined" | "tweet_style" | "keynote_minimal";

/** ID genérico de layout — cada tema define o seu conjunto */
export type LayoutId = string;

/** Famílias de fonte disponíveis pro headline. */
export type FonteHeadline = "archivo" | "inter" | "impact" | "instrument_serif";

export const FONTE_FAMILIAS: Record<FonteHeadline, string> = {
  archivo: "'Archivo', 'Helvetica Neue', sans-serif",
  inter: "'Inter', sans-serif",
  impact: "Impact, 'Arial Black', sans-serif",
  instrument_serif: "'Instrument Serif', 'Playfair Display', Georgia, serif",
};

export const FONTE_LABELS: Record<FonteHeadline, string> = {
  archivo: "Archivo (padrão)",
  inter: "Inter",
  impact: "Impact",
  instrument_serif: "Instrument Serif",
};

// ============================================================
// SLIDE DATA — estado de cada slide, independente de tema
// ============================================================

export interface SlideData {
  id: string;
  layout: LayoutId;

  // Textos
  kicker: string;
  headline: string;
  corpo: string;
  destaque: string;
  numero: string;           // ex.: "+32%" — big number opcional
  legendaFoto: string;
  textoPill: string;
  mostrarPill: boolean;

  // Fotos
  fotoUrl: string;
  fotoUrl2: string;

  // Flags genéricas (cada tema decide como usar)
  corFundo: "preto" | "amarelo" | "bege" | "branco"; // paleta do slide

  // Customizações locais por slide (sobrescrevem as globais do tema)
  corKicker?: string;
  corHeadline?: string;
  corDestaque?: string;
  fonteHeadline?: FonteHeadline;
  /** Override: forçar CAPS (true) ou minúsculas (false). undefined = usa default do layout */
  headlineCaps?: boolean;
  /** Override: multiplicador do tamanho default do layout (1 = padrão, 1.2 = +20%, 0.8 = -20%) */
  headlineEscala?: number;
}

/** Cria um novo slide vazio com valores default. */
export function criarSlideVazio(layout: LayoutId, corFundo: SlideData["corFundo"] = "preto"): SlideData {
  return {
    id: Math.random().toString(36).substring(2, 10),
    layout,
    kicker: "",
    headline: "",
    corpo: "",
    destaque: "",
    numero: "",
    legendaFoto: "",
    textoPill: "",
    mostrarPill: false,
    fotoUrl: "",
    fotoUrl2: "",
    corFundo,
  };
}

// ============================================================
// CONFIG DE CADA TEMA
// ============================================================

/** Define um layout dentro de um tema. */
export interface LayoutDef {
  id: LayoutId;
  nome: string;
  descricao: string;
  /** Se o layout usa foto (aparece no painel de upload). */
  usaFoto: boolean;
  /** Se o layout usa segunda foto (dupla_foto, etc). */
  usaDuasFotos?: boolean;
  /** Cores de fundo permitidas. Se omitido, usa paleta default do tema. */
  coresFundoPermitidas?: SlideData["corFundo"][];
  /** Componente React que renderiza o layout. */
  render: (props: LayoutRenderProps) => React.ReactElement;
}

/** Props que cada componente de layout recebe. */
export interface LayoutRenderProps {
  slide: SlideData;
  tema: TemaConfig;
  marca: string;
  numero: string; // "01 / 12"
  coresResolvidas: CoresResolvidas;
}

/** Cores efetivas usadas no slide (slide > tema). */
export interface CoresResolvidas {
  fundo: string;
  texto: string;         // cor do texto padrão sobre o fundo
  accent: string;        // amarelo/destaque do tema
  kicker: string;
  headline: string;
  destaque: string;
  corpo: string;
  topbar: string;
}

/** Config de um tema completo. */
export interface TemaConfig {
  id: TemaId;
  nome: string;
  descricao: string;

  // Paleta base
  cores: {
    preto: string;
    branco: string;
    bege: string;
    amarelo: string;     // accent principal
  };

  // Defaults (podem ser sobrescritos por slide)
  fonteHeadlineDefault: FonteHeadline;
  fonteCorpo: string;                    // sempre fixo — fonte do corpo
  corKickerDefault: string;              // cor sobre fundo "escuro default"
  corHeadlineDefault: string;
  corDestaqueDefault: string;

  // Layouts disponíveis nesse tema
  layouts: LayoutDef[];

  // Slides iniciais sugeridos quando o usuário escolhe esse tema
  slidesExemplo: SlideData[];
}

// ============================================================
// HELPERS DE RESOLUÇÃO DE CORES
// ============================================================

/**
 * Calcula as cores efetivas de um slide baseado em:
 *   1. Tema (defaults)
 *   2. Cor de fundo do slide (preto/amarelo/bege/branco → resolvem contraste)
 *   3. Overrides explícitos do slide (corKicker, corHeadline, corDestaque)
 */
export function resolverCores(slide: SlideData, tema: TemaConfig): CoresResolvidas {
  const { cores } = tema;

  // Mapeia "corFundo" do slide para a cor real
  const fundoMap: Record<SlideData["corFundo"], string> = {
    preto: cores.preto,
    amarelo: cores.amarelo,
    bege: cores.bege,
    branco: cores.branco,
  };
  const fundo = fundoMap[slide.corFundo] || cores.preto;

  // Texto default sobre esse fundo (contraste automático)
  const fundoEscuro = slide.corFundo === "preto";
  const textoPadrao = fundoEscuro ? cores.branco : cores.preto;

  // Accent: em fundo amarelo, o accent vira preto (senão ficaria invisível)
  const accentEfetivo = slide.corFundo === "amarelo" ? cores.preto : cores.amarelo;

  return {
    fundo,
    texto: textoPadrao,
    accent: accentEfetivo,
    topbar: fundoEscuro ? cores.amarelo : cores.preto,
    kicker: slide.corKicker || (fundoEscuro ? cores.amarelo : cores.preto),
    headline: slide.corHeadline || (fundoEscuro ? cores.amarelo : cores.preto),
    destaque: slide.corDestaque || accentEfetivo,
    corpo: textoPadrao,
  };
}

/** Resolve a fonte do headline (slide > tema). */
export function resolverFonteHeadline(slide: SlideData, tema: TemaConfig): string {
  const fam = slide.fonteHeadline || tema.fonteHeadlineDefault;
  return FONTE_FAMILIAS[fam];
}

/**
 * Resolve se o headline usa caps.
 * `padraoLayout` é o comportamento default do layout.
 * Se o slide tiver override explícito, usa ele.
 */
export function resolverCapsHeadline(slide: SlideData, padraoLayout: boolean): boolean {
  if (slide.headlineCaps === undefined) return padraoLayout;
  return slide.headlineCaps;
}

/**
 * Aplica o multiplicador de escala ao tamanho base do headline.
 * Mínimo de 20px por segurança (pra layouts com tamanho pequeno não sumirem).
 */
export function resolverTamanhoHeadline(slide: SlideData, tamanhoBase: number): number {
  const escala = slide.headlineEscala ?? 1;
  return Math.max(20, Math.round(tamanhoBase * escala));
}
