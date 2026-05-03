// ============================================================
// TIPOS DO MÓDULO FEED/STORIES (v7.7)
// ============================================================

/** ID único de cada template Feed/Stories. */
export type FeedTemplateId =
  | "ipva_iptu_feed"
  | "ipva_iptu_stories"
  | "oque_e_feed"
  | "oque_e_stories"
  | "ate3_cartoes_feed"
  | "ate3_cartoes_stories"
  | "rotativo_feed"
  | "rotativo_stories";

/** Formato da peça (impacta dimensões de export). */
export type FeedFormato = "feed" | "stories";

/** Dimensões em pixels reais (export PNG). */
export const DIMENSOES: Record<FeedFormato, { w: number; h: number }> = {
  feed: { w: 1080, h: 1350 },
  stories: { w: 1080, h: 1920 },
};

/**
 * Dados editáveis de um slide Feed/Stories.
 * Cada template usa só as propriedades que faz sentido pra ele;
 * as demais ficam undefined.
 */
export interface FeedSlideData {
  /** Identificador único do slide na lista. */
  id: string;
  /** Template usado por este slide. */
  templateId: FeedTemplateId;

  // ============ TEXTOS EDITÁVEIS ============
  /** Pílula superior pequena (ex: "Gestão financeira pessoal"). */
  pilula?: string;
  /** Headline principal (ex: "Organize"). */
  headline?: string;
  /** Subhead (ex: "seus impostos"). */
  subhead?: string;
  /** Tagline ou frase de complemento (ex: "Parcele IPVA e IPTU com inteligência"). */
  tagline?: string;
  /** Texto do botão / CTA (ex: "Conheça agora"). */
  cta?: string;

  // ============ FOTO ============
  /** URL da foto principal (Unsplash ou data:base64 do upload). */
  fotoUrl?: string;
  /** Posição/zoom da foto (object-position CSS, ex: "center", "top right"). */
  fotoPosicao?: string;

  // ============ COR DO BLOB / DESTAQUE ============
  /** Cor do blob amarelo / footer / botão accent. Default depende do template. */
  corAccent?: string;

  // ============ OVERRIDES TIPOGRÁFICOS ============
  /** Multiplicador de tamanho aplicado a todos os textos (1 = padrão). */
  escalaGeral?: number;
  /** Override de cor do headline. */
  corHeadline?: string;
  /** Override de cor do subhead. */
  corSubhead?: string;

  // ============ AVANÇADO: por elemento (v7.7.1) ============
  /** Peso fonte do headline (400-900). Default depende do template. */
  pesoHeadline?: number;
  /** Tamanho fonte do headline em px (no espaço 1080×1350/1920). */
  tamHeadline?: number;
  /** Italic no headline. */
  italicHeadline?: boolean;

  /** Peso fonte do subhead. */
  pesoSubhead?: number;
  /** Tamanho fonte do subhead em px. */
  tamSubhead?: number;
  /** Italic no subhead. */
  italicSubhead?: boolean;

  /** Peso fonte da tagline. */
  pesoTagline?: number;
  /** Tamanho fonte da tagline em px. */
  tamTagline?: number;
  /** Italic na tagline. */
  italicTagline?: boolean;

  // ============ CTA (botão) — v7.7.1 ============
  /** Cor do texto/borda do CTA. Default branco em foto, preto em fundo claro. */
  corCTA?: string;
  /** Peso fonte do CTA. */
  pesoCTA?: number;
  /** Tamanho fonte do CTA em px. */
  tamCTA?: number;
  /** Italic no CTA. */
  italicCTA?: boolean;

  // ============ ÍCONE — v7.7.1 ============
  /** Tamanho do ícone em px (templates que usam ícone, ex: Rotativo). */
  tamIcone?: number;
  /** Cor do ícone. */
  corIcone?: string;
  /** v7.7.2: Espessura do traço do ícone (lucide strokeWidth). 0.5-3, default 2. */
  espessuraIcone?: number;

  // ============ TEXTURA OVERLAY — v7.7.2 ============
  /** Mostrar textura granulada por cima da peça (default true). */
  mostrarTextura?: boolean;
  /** Opacidade da textura (0-1). Default 0.75 (igual Figma). */
  opacidadeTextura?: number;
  /** Modo de mistura da textura. Default "overlay". */
  modoTextura?: "overlay" | "soft-light" | "multiply" | "normal";
  /** v7.7.4: Se TRUE, textura cobre só a foto (não invade rodapé amarelo). Default false. */
  mascaraTexturaSoFoto?: boolean;
  /** v7.7.4: Opacidade da textura SOMENTE no rodapé (override). Quando definido, sobrepõe opacidadeTextura no rodapé. */
  opacidadeTexturaRodape?: number;
  /** v7.7.4: Modo de blend da textura SOMENTE no rodapé (override). */
  modoTexturaRodape?: "overlay" | "soft-light" | "multiply" | "normal";

  // ============ VISIBILIDADE ============
  /** Mostrar pílula superior (default true se template usa). */
  mostrarPilula?: boolean;
  /** Mostrar CTA (default true se template usa). */
  mostrarCTA?: boolean;
  /** Mostrar footer creme com URL + logo (default true se template usa). */
  mostrarFooter?: boolean;
  /** Mostrar ícone (default true se template usa ícone). */
  mostrarIcone?: boolean;
}

/** Cria um slide Feed vazio com defaults razoáveis. */
export function criarFeedSlideVazio(templateId: FeedTemplateId): FeedSlideData {
  return {
    id: Math.random().toString(36).substring(2, 10),
    templateId,
    pilula: "",
    headline: "",
    subhead: "",
    tagline: "",
    cta: "",
    fotoUrl: "",
    fotoPosicao: "center",
    corAccent: "#FFCB31",
    mostrarPilula: true,
    mostrarCTA: true,
    mostrarFooter: true,
  };
}

/** Metadados de cada template — pra mostrar no seletor de templates. */
export interface TemplateInfo {
  id: FeedTemplateId;
  nome: string;
  descricao: string;
  formato: FeedFormato;
  /** Campos editáveis que ESTE template usa (UI só mostra estes). */
  camposUsados: ("pilula" | "headline" | "subhead" | "tagline" | "cta" | "foto" | "corAccent")[];
  /** Slide de exemplo pra populá-lo automaticamente. */
  exemplo: Omit<FeedSlideData, "id">;
}

/** Paleta oficial Parcele Aqui (extraída dos SVGs). */
export const PARCELE_AQUI_CORES = {
  amareloPrincipal: "#FFCB31",
  amareloLogo: "#FFCC1B",
  amareloEscuro: "#DAA500",
  amareloEscuroAlt: "#E9D69F",
  cremeFooter: "#FFF9E8",
  marromTexto: "#371B01",
  pretoTexto: "#1C1815",
} as const;

/** Fonte oficial: Kufam (Google Fonts). */
export const FONTE_KUFAM = "'Kufam', system-ui, sans-serif";
