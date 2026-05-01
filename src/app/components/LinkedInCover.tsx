import svgPaths from "../../imports/svg-l2yh47psh";

interface LinkedInCoverProps {
  numero?: string;
  titulo?: string;
  legendaLinha1?: string;
  legendaLinha2?: string;
  fotoUrl?: string;
  IconeCustomizado?: React.ComponentType<any>;
  usarLegenda1?: boolean;
  usarSubtitulo?: boolean;
}

// Assets servidos pela pasta /public (mesma origem, não contaminam canvas)
const LOGO_URL = "/assets/f105090c0d8399c4c5ddf6f3b68c32fc5dfd387f.png";
const FOTO_PADRAO = "/assets/94f0de88dd7da2aa7b58f6680bcc081b5b16c90f.png";

/**
 * Dimensões do componente — 1280×720 (proporção 16:9, ideal LinkedIn).
 * Esses valores PRECISAM bater com os usados em gerarCapa.ts (BASE_WIDTH/HEIGHT).
 * Layout proporcional da referência 1200×675 (escala 1.0667).
 */
const WIDTH = 1280;
const HEIGHT = 720;

function IconePadrao() {
  return (
    <div
      className="absolute flex items-center justify-center"
      style={{ left: "77px", top: "301px", width: "85px", height: "85px" }}
    >
      <svg style={{ width: "51px", height: "51px" }} fill="none" viewBox="0 0 80 80">
        <g>
          <path d={svgPaths.p325f5470} fill="#371B01" />
        </g>
      </svg>
    </div>
  );
}

/**
 * Resolve a URL da foto:
 * - figma:asset/xxx → /assets/xxx (legado)
 * - data:image/... → base64 (upload local, passa direto)
 * - URL externa → mantém (precisa aceitar CORS)
 * - vazio → foto padrão
 */
function resolveFotoUrl(url?: string): string {
  if (!url) return FOTO_PADRAO;
  if (url.startsWith("figma:asset/")) {
    const filename = url.replace("figma:asset/", "");
    return `/assets/${filename}`;
  }
  return url;
}

export default function LinkedInCover({
  numero = "46",
  titulo = "Mercado B2B: flexibilidade financeira na cadeia de suprimentos",
  legendaLinha1 = "Tecnologia que destrava",
  legendaLinha2 = "o seu dia a dia financeiro.",
  fotoUrl = FOTO_PADRAO,
  IconeCustomizado,
  usarLegenda1 = true,
  usarSubtitulo = true,
}: LinkedInCoverProps) {
  const fotoResolvida = resolveFotoUrl(fotoUrl);
  const isDataUrl = fotoResolvida.startsWith("data:");

  return (
    <div
      className="bg-white relative overflow-hidden"
      style={{ width: `${WIDTH}px`, height: `${HEIGHT}px` }}
    >
      {/* Shape amarelo */}
      <div
        className="absolute"
        style={{
          backgroundColor: "#ffcb31",
          height: "580px",
          left: "30px",
          right: "30px",
          top: "110px",
          borderBottomLeftRadius: "40px",
          borderBottomRightRadius: "40px",
          borderTopLeftRadius: "40px",
          borderTopRightRadius: "320px",
        }}
      />

      {/* Container da foto */}
      <div className="absolute" style={{ right: "30px", bottom: "30px" }}>
        <div
          className="relative overflow-hidden bg-gray-200"
          style={{
            height: "510px",
            width: "550px",
            borderBottomLeftRadius: "40px",
            borderBottomRightRadius: "40px",
            borderTopLeftRadius: "220px",
            borderTopRightRadius: "40px",
          }}
        >
          {fotoResolvida && (
            <img
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
              src={fotoResolvida}
              {...(isDataUrl ? {} : { crossOrigin: "anonymous" as const })}
            />
          )}

          {/* Gradiente sobre a foto para legenda */}
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.7) 100%)",
            }}
          />
        </div>
      </div>

      {/* Logo no topo esquerdo */}
      <div
        className="absolute"
        style={{ height: "110px", left: "30px", top: "25px", width: "540px" }}
      >
        <img
          alt="Parcele Aqui"
          src={LOGO_URL}
          crossOrigin="anonymous"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            objectPosition: "left center",
          }}
        />
      </div>

      {/* Header Info (Parcele News + Número) */}
      <div className="absolute" style={{ right: "45px", top: "40px", textAlign: "right" }}>
        <p
          className="font-['Kufam',sans-serif]"
          style={{
            color: "#371b01",
            fontSize: "20px",
            fontWeight: 500,
            margin: 0,
            lineHeight: 1,
          }}
        >
          Parcele News
        </p>
        <p
          className="font-['Kufam',sans-serif]"
          style={{
            color: "#371b01",
            fontSize: "70px",
            fontWeight: 800,
            margin: "5px 0 0 0",
            lineHeight: 0.9,
          }}
        >
          #{numero}
        </p>
      </div>

      {/* Card do ícone */}
      <div
        className="absolute flex items-center justify-center"
        style={{
          backgroundColor: "#ffe8a4",
          height: "90px",
          left: "70px",
          top: "320px",
          width: "90px",
          borderRadius: "15px",
        }}
      >
        {IconeCustomizado ? <IconeCustomizado /> : (
          <span style={{ fontSize: "50px", color: "#371b01", fontWeight: 300 }}>$</span>
        )}
      </div>

      {/* Título */}
      <h1
        className="absolute font-['Kufam',sans-serif]"
        style={{
          color: "#371b01",
          fontSize: "48px",
          fontWeight: 800,
          left: "70px",
          top: "450px",
          width: "600px",
          lineHeight: "1.1",
          margin: 0,
          letterSpacing: "-0.01em",
        }}
      >
        {titulo}
      </h1>

      {/* Legenda na foto */}
      {(usarLegenda1 || usarSubtitulo) && (
        <div
          className="absolute font-['Kufam',sans-serif] text-white"
          style={{
            right: "75px",
            bottom: "70px",
            width: "460px",
            textAlign: "left",
          }}
        >
          {usarLegenda1 && (
            <div style={{ fontSize: "24px", fontWeight: 400, opacity: 0.9 }}>
              {legendaLinha1}
            </div>
          )}
          {usarSubtitulo && (
            <div style={{ fontSize: "24px", fontWeight: 700, marginTop: "2px" }}>
              {legendaLinha2}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
