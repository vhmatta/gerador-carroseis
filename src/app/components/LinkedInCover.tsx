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
  numero = "49",
  titulo = "Mercado B2C: o uso estratégico e consciente do parcelamento",
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
      className="bg-white relative"
      style={{ width: `${WIDTH}px`, height: `${HEIGHT}px` }}
    >
      {/* Shape amarelo */}
      <div
        className="absolute"
        style={{
          backgroundColor: "#ffcb31",
          height: "575px",
          left: "34px",
          right: "34px",
          top: "111px",
          borderBottomLeftRadius: "34px",
          borderBottomRightRadius: "34px",
          borderTopLeftRadius: "34px",
          borderTopRightRadius: "341px",
        }}
      />

      {/* Container da foto */}
      <div className="absolute" style={{ right: "34px", bottom: "34px" }}>
        <div
          className="relative overflow-hidden bg-gradient-to-br from-gray-300 to-gray-400"
          style={{
            height: "501px",
            width: "533px",
            borderBottomLeftRadius: "34px",
            borderBottomRightRadius: "34px",
            borderTopLeftRadius: "213px",
            borderTopRightRadius: "34px",
          }}
        >
          {fotoResolvida ? (
            <img
              alt=""
              className="absolute object-cover"
              src={fotoResolvida}
              // data URLs (upload local) não precisam de crossOrigin; externas precisam
              {...(isDataUrl ? {} : { crossOrigin: "anonymous" as const })}
              style={{ width: "100%", height: "100%" }}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-24 h-24 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}

          {/* Gradiente sobre a foto */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, rgba(0,0,0,0) 32.867%, rgba(0,0,0,0.8) 95.333%)",
            }}
          />
        </div>
      </div>

      <div
        className="absolute"
        style={{ height: "85px", left: "34px", top: "34px", width: "420px" }}
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

      {/* Parcele News */}
      <p
        className="absolute font-['Kufam',sans-serif] text-right"
        style={{
          color: "#371b01",
          fontSize: "18px",
          fontWeight: 700,
          right: "34px",
          letterSpacing: "-0.02em",
          lineHeight: "1.2",
          top: "43px",
          margin: 0,
        }}
      >
        Parcele News
      </p>

      {/* Número */}
      <p
        className="absolute font-['Kufam',sans-serif] text-right"
        style={{
          color: "#371b01",
          fontSize: "53px",
          fontWeight: 700,
          right: "34px",
          letterSpacing: "-0.02em",
          lineHeight: "1",
          top: "82px",
          margin: 0,
        }}
      >
        #{numero}
      </p>

      {/* Card do ícone */}
      <div
        className="absolute rounded-[13px]"
        style={{
          backgroundColor: "#ffe8a4",
          height: "85px",
          left: "77px",
          top: "301px",
          width: "85px",
        }}
      />

      {/* Ícone */}
      {IconeCustomizado ? <IconeCustomizado /> : <IconePadrao />}

      {/* Título */}
      <h1
        className="absolute font-['Kufam',sans-serif]"
        style={{
          color: "#1a1a1a",
          fontSize: "45px",
          fontWeight: 700,
          left: "77px",
          letterSpacing: "-0.02em",
          lineHeight: "1.15",
          top: "425px",
          width: "603px",
          margin: 0,
        }}
      >
        {titulo}
      </h1>

      {/* Legenda sobre a foto */}
      {(usarLegenda1 || usarSubtitulo) && (
        <div
          className="absolute font-['Kufam',sans-serif] text-white"
          style={{
            left: `calc(${WIDTH}px - 34px - 533px + 47px)`,
            bottom: "47px",
            right: "calc(34px + 47px)",
            textShadow: "0 2px 12px rgba(0,0,0,0.6)",
          }}
        >
          {usarLegenda1 && (
            <p style={{ fontSize: "21px", fontWeight: 400, lineHeight: "1.3", margin: 0 }}>
              {legendaLinha1}
            </p>
          )}
          {usarSubtitulo && (
            <p style={{ fontSize: "21px", fontWeight: 700, lineHeight: "1.3", margin: 0 }}>
              {legendaLinha2}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
