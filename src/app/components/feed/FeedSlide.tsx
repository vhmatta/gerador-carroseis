import type { FeedSlideData, FeedTemplateId, TemplateInfo } from "./templates/tipos";
import TemplateIpvaIptuFeed from "./templates/ipva_iptu_feed";
import TemplateIpvaIptuStories from "./templates/ipva_iptu_stories";
import TemplateRotativoFeed from "./templates/rotativo_feed";

/**
 * Renderiza um slide Feed/Stories baseado no templateId.
 * Templates implementados na v7.7:
 *  - ipva_iptu_feed (1080×1350) ✅
 *  - ipva_iptu_stories (1080×1920) ✅
 *  - rotativo_feed (1080×1350) ✅
 *
 * Templates pendentes (mostram placeholder):
 *  - rotativo_stories
 *  - oque_e_feed / oque_e_stories
 *  - ate3_cartoes_feed / ate3_cartoes_stories
 */
export default function FeedSlide({
  slide,
  escala = 1,
}: {
  slide: FeedSlideData;
  escala?: number;
}) {
  switch (slide.templateId) {
    case "ipva_iptu_feed":
      return <TemplateIpvaIptuFeed slide={slide} escala={escala} />;
    case "ipva_iptu_stories":
      return <TemplateIpvaIptuStories slide={slide} escala={escala} />;
    case "rotativo_feed":
      return <TemplateRotativoFeed slide={slide} escala={escala} />;
    default:
      return <TemplatePlaceholder slide={slide} escala={escala} />;
  }
}

/**
 * Placeholder para templates ainda não implementados.
 * Mantém estrutura visual consistente (1080×1350 ou 1080×1920) com
 * mensagem clara de "em breve".
 */
function TemplatePlaceholder({
  slide,
  escala,
}: {
  slide: FeedSlideData;
  escala: number;
}) {
  const eh_stories = slide.templateId.endsWith("_stories");
  const w = 1080 * escala;
  const h = (eh_stories ? 1920 : 1350) * escala;

  const tplInfo = TEMPLATES_DISPONIVEIS.find((t) => t.id === slide.templateId);

  return (
    <div
      style={{
        width: w,
        height: h,
        background: "linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "#888",
        fontFamily: "'Kufam', system-ui, sans-serif",
        padding: 40 * escala,
        textAlign: "center",
        gap: 20 * escala,
      }}
    >
      <div
        style={{
          fontSize: 28 * escala,
          fontWeight: 700,
          color: "#FFC528",
          letterSpacing: "0.05em",
          textTransform: "uppercase",
        }}
      >
        Em construção
      </div>
      <div style={{ fontSize: 22 * escala, color: "#ccc", lineHeight: 1.4 }}>
        {tplInfo?.nome || slide.templateId}
      </div>
      <div
        style={{
          fontSize: 16 * escala,
          color: "#666",
          marginTop: 16 * escala,
          maxWidth: 400 * escala,
          lineHeight: 1.5,
        }}
      >
        Este template estará disponível em breve.
        <br />
        Use <strong style={{ color: "#FFC528" }}>IPVA Feed</strong>,{" "}
        <strong style={{ color: "#FFC528" }}>IPVA Stories</strong> ou{" "}
        <strong style={{ color: "#FFC528" }}>Rotativo Feed</strong> nesta versão.
      </div>
    </div>
  );
}

// ============================================================
// LISTA DE TEMPLATES (UI dropdown)
// ============================================================

export const TEMPLATES_DISPONIVEIS: TemplateInfo[] = [
  // ===== IMPLEMENTADOS =====
  {
    id: "ipva_iptu_feed",
    nome: "IPVA / IPTU — Feed (1080×1350)",
    descricao: "Foto + headline grande amarelo + tagline + footer creme",
    formato: "feed",
    camposUsados: ["pilula", "headline", "subhead", "tagline", "foto"],
    exemplo: {
      templateId: "ipva_iptu_feed",
      pilula: "Gestão financeira pessoal",
      headline: "Organize",
      subhead: "seus impostos",
      tagline: "Parcele IPVA e IPTU com inteligência.",
      cta: "",
      fotoUrl: "",
      fotoPosicao: "center",
      mostrarPilula: true,
      mostrarFooter: true,
      mostrarCTA: false,
    },
  },
  {
    id: "ipva_iptu_stories",
    nome: "IPVA / IPTU — Stories (1080×1920)",
    descricao: "Versão stories: foto vertical + texto + footer creme",
    formato: "stories",
    camposUsados: ["pilula", "headline", "subhead", "tagline", "foto"],
    exemplo: {
      templateId: "ipva_iptu_stories",
      pilula: "Gestão financeira pessoal",
      headline: "Organize",
      subhead: "seus impostos",
      tagline: "Parcele IPVA e IPTU com inteligência.",
      cta: "",
      fotoUrl: "",
      fotoPosicao: "center",
      mostrarPilula: true,
      mostrarFooter: true,
      mostrarCTA: false,
    },
  },
  {
    id: "rotativo_feed",
    nome: "Rotativo vs Estratégia — Feed (1080×1350)",
    descricao: "Foto na metade superior + footer amarelo curvo + CTA pílula preto",
    formato: "feed",
    camposUsados: ["headline", "subhead", "tagline", "cta", "foto"],
    exemplo: {
      templateId: "rotativo_feed",
      pilula: "",
      headline: "Rotativo",
      subhead: "ou estratégia?",
      tagline: "Entenda a diferença.",
      cta: "Faça a escolha inteligente",
      fotoUrl: "",
      fotoPosicao: "center",
      mostrarPilula: false,
      mostrarFooter: true,
      mostrarCTA: true,
    },
  },

  // ===== EM CONSTRUÇÃO (placeholders) =====
  {
    id: "rotativo_stories",
    nome: "Rotativo vs Estratégia — Stories (em breve)",
    descricao: "Em construção · será liberado em versão futura",
    formato: "stories",
    camposUsados: ["headline", "subhead", "tagline", "cta", "foto"],
    exemplo: {
      templateId: "rotativo_stories",
      headline: "Rotativo",
      subhead: "ou estratégia?",
      tagline: "Entenda a diferença.",
      cta: "Faça a escolha inteligente",
      fotoUrl: "",
      mostrarPilula: false,
      mostrarFooter: true,
      mostrarCTA: true,
    },
  },
  {
    id: "oque_e_feed",
    nome: "O que é o Parcele Aqui — Feed (em breve)",
    descricao: "Em construção · fundo amarelo + ilustrações isométricas",
    formato: "feed",
    camposUsados: ["headline", "subhead", "cta"],
    exemplo: {
      templateId: "oque_e_feed",
      headline: "O que é o\nParcele aqui?",
      subhead: "Plataforma digital\npara parcelar boletos.",
      cta: "Conheça agora",
      fotoUrl: "",
      mostrarPilula: false,
      mostrarFooter: true,
      mostrarCTA: true,
    },
  },
  {
    id: "oque_e_stories",
    nome: "O que é o Parcele Aqui — Stories (em breve)",
    descricao: "Em construção · versão vertical do anterior",
    formato: "stories",
    camposUsados: ["headline", "subhead", "cta"],
    exemplo: {
      templateId: "oque_e_stories",
      headline: "O que é o\nParcele aqui?",
      subhead: "Plataforma digital\npara parcelar boletos.",
      cta: "Conheça agora",
      fotoUrl: "",
      mostrarPilula: false,
      mostrarFooter: true,
      mostrarCTA: true,
    },
  },
  {
    id: "ate3_cartoes_feed",
    nome: "Até 3 cartões — Feed (em breve)",
    descricao: "Em construção · headline central + asset de cartões + footer amarelo",
    formato: "feed",
    camposUsados: ["headline", "subhead", "tagline", "cta", "foto"],
    exemplo: {
      templateId: "ate3_cartoes_feed",
      headline: "Use até 3 cartões",
      subhead: "no mesmo boleto",
      tagline: "Combine seus limites",
      cta: "Simule agora",
      fotoUrl: "",
      mostrarPilula: false,
      mostrarFooter: true,
      mostrarCTA: true,
    },
  },
  {
    id: "ate3_cartoes_stories",
    nome: "Até 3 cartões — Stories (em breve)",
    descricao: "Em construção · versão vertical do anterior",
    formato: "stories",
    camposUsados: ["headline", "subhead", "tagline", "cta", "foto"],
    exemplo: {
      templateId: "ate3_cartoes_stories",
      headline: "Use até 3 cartões",
      subhead: "no mesmo boleto",
      tagline: "Combine seus limites",
      cta: "Simule agora",
      fotoUrl: "",
      mostrarPilula: false,
      mostrarFooter: true,
      mostrarCTA: true,
    },
  },
];

export function obterTemplate(id: FeedTemplateId): TemplateInfo | undefined {
  return TEMPLATES_DISPONIVEIS.find((t) => t.id === id);
}

export function templateImplementado(id: FeedTemplateId): boolean {
  return ["ipva_iptu_feed", "ipva_iptu_stories", "rotativo_feed"].includes(id);
}
