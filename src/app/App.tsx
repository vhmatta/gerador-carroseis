import { useState, useEffect, useRef } from "react";
import CoverEditorAvancado from "./components/CoverEditorAvancado";
import GeradorLote from "./components/GeradorLote";
import CarrosselEditor from "./components/CarrosselEditor";
import imgLogoGrupo from "../imports/logo_potencial_dark.png";
import imgLogoPotencialFooter from "../imports/Logo_-_Potencial_Tecnologia_Horizontal_Negativa__2-2.png";
import {
  LayoutDashboard,
  Layers,
  GalleryHorizontal,
  Linkedin,
  Instagram,
  ChevronDown,
  Sun,
  Moon,
} from "lucide-react";
import { ThemeProvider, useTheme } from "./lib/ThemeProvider";
import { SPACING, RADIUS, FONT_WEIGHT, FONT_SIZE, TRANSITION, SHADOW } from "./lib/designSystem";
import { Badge } from "./components/ui-premium";

type Modo = "editor" | "lote" | "carrossel";

interface ModoDef {
  id: Modo;
  categoria: "linkedin" | "instagram";
  label: string;
  icone: React.ReactNode;
  descricao: string;
}

const MODOS: ModoDef[] = [
  {
    id: "editor",
    categoria: "linkedin",
    label: "Capa individual",
    icone: <LayoutDashboard size={14} strokeWidth={1.75} />,
    descricao: "Uma capa de newsletter por vez",
  },
  {
    id: "lote",
    categoria: "linkedin",
    label: "Lote de capas",
    icone: <Layers size={14} strokeWidth={1.75} />,
    descricao: "Várias capas de uma vez em ZIP",
  },
  {
    id: "carrossel",
    categoria: "instagram",
    label: "Carrossel",
    icone: <GalleryHorizontal size={14} strokeWidth={1.75} />,
    descricao: "Editor editorial com múltiplos slides",
  },
];

export default function App() {
  return (
    <ThemeProvider>
      <AppShell />
    </ThemeProvider>
  );
}

function AppShell() {
  const [modo, setModo] = useState<Modo>("editor");
  const { theme } = useTheme();

  useEffect(() => {
    document.title = "Gerador de Capas LinkedIn — Parcele Aqui";
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#050505",
        color: "#ffffff",
        fontFamily: "'Archivo', sans-serif",
      }}
    >
      {/* ================ HEADER ================ */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          backgroundColor: "rgba(5, 5, 5, 0.8)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        <div
          style={{
            maxWidth: 1400,
            margin: "0 auto",
            padding: "14px 32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Logo + título */}
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <img
              src={imgLogoGrupo}
              alt="Grupo Potencial"
              style={{ height: 32 }}
            />
            <div style={{ height: 24, width: 1, backgroundColor: "rgba(255,255,255,0.15)" }} />
            <div>
              <h1
                style={{
                  fontSize: "15px",
                  fontWeight: 700,
                  color: "#ffffff",
                  margin: 0,
                  letterSpacing: "-0.01em",
                }}
              >
                Gerador de Capas LinkedIn
              </h1>
              <p
                style={{
                  fontSize: "11px",
                  color: "rgba(255,255,255,0.45)",
                  margin: 0,
                  marginTop: 1,
                  fontWeight: 500,
                  letterSpacing: "0.02em",
                }}
              >
                Parcele Aqui · Parcele News
              </p>
            </div>
          </div>

          {/* Navegação Direta */}
          <nav style={{ display: "flex", gap: 12 }}>
            <NavButton
              active={modo === "editor"}
              onClick={() => setModo("editor")}
              label="Editor Capa"
              icone={<LayoutDashboard size={16} />}
            />
            <NavButton
              active={modo === "lote"}
              onClick={() => setModo("lote")}
              label="Lote de Capas"
              icone={<Layers size={16} />}
            />
            <NavButton
              active={modo === "carrossel"}
              onClick={() => setModo("carrossel")}
              label="Carrossel Instagram"
              icone={<GalleryHorizontal size={16} />}
            />
          </nav>
        </div>
      </header>

      {/* ================ MAIN ================ */}
      <main style={{ flex: 1, backgroundColor: "#050505" }}>
        {modo === "editor" && <CoverEditorAvancado />}
        {modo === "lote" && <GeradorLote />}
        {modo === "carrossel" && <CarrosselEditor />}
      </main>

      {/* ================ FOOTER ================ */}
      <footer
        style={{
          padding: "40px 0",
          backgroundColor: "#050505",
          borderTop: "1px solid rgba(255, 255, 255, 0.05)",
        }}
      >
        <div
          style={{
            maxWidth: 1400,
            margin: "0 auto",
            padding: "0 32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
          }}
        >
          <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "13px" }}>
            Potencial Tecnologia © {new Date().getFullYear()}
          </span>
        </div>
      </footer>
    </div>
  );
}

function NavButton({
  active,
  onClick,
  label,
  icone,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icone: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        height: 34,
        padding: "0 14px",
        backgroundColor: active ? "rgba(255, 197, 40, 0.15)" : "transparent",
        color: active ? "#FFC528" : "rgba(255,255,255,0.6)",
        border: `1px solid ${active ? "#FFC52844" : "rgba(255,255,255,0.1)"}`,
        borderRadius: "6px",
        fontSize: "12px",
        fontWeight: 600,
        cursor: "pointer",
        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.05)";
          e.currentTarget.style.color = "#ffffff";
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.backgroundColor = "transparent";
          e.currentTarget.style.color = "rgba(255,255,255,0.6)";
        }
      }}
    >
      {icone}
      {label}
    </button>
  );
}
