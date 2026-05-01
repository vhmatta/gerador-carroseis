import { useState, useRef, useMemo } from "react";
import LinkedInCover from "./LinkedInCover";
import * as LucideIcons from "lucide-react";
import UnsplashSearch from "./UnsplashSearch";
import { gerarCapaPNG } from "../lib/gerarCapa";
import SelectIconeComPreview, { iconesDisponiveis } from "./SelectIconeComPreview";

function IconeCustomizado({ IconeComponente }: { IconeComponente: any }) {
  // Shape amarelo está em left:77 top:301 com 85×85
  // Ícone 80×80 centralizado dentro: left:79.5 top:303.5
  return (
    <div
      className="absolute flex items-center justify-center"
      style={{ left: "79.5px", top: "303.5px", width: "80px", height: "80px" }}
    >
      <IconeComponente size={48} strokeWidth={1.5} color="#371B01" />
    </div>
  );
}

type Status = { tipo: "idle" } | { tipo: "gerando" } | { tipo: "sucesso" } | { tipo: "erro"; msg: string };

export default function CoverEditorAvancado() {
  const [numero, setNumero] = useState("49");
  const [titulo, setTitulo] = useState("Mercado B2C: o uso estratégico e consciente do parcelamento");
  const [legendaLinha1, setLegendaLinha1] = useState("Tecnologia que destrava");
  const [legendaLinha2, setLegendaLinha2] = useState("o seu dia a dia financeiro.");
  const [fotoUrl, setFotoUrl] = useState("/assets/94f0de88dd7da2aa7b58f6680bcc081b5b16c90f.png");
  const [iconeEscolhido, setIconeEscolhido] = useState<string>("CreditCard");
  const [usarLegenda1, setUsarLegenda1] = useState(true);
  const [usarSubtitulo, setUsarSubtitulo] = useState(true);
  const [status, setStatus] = useState<Status>({ tipo: "idle" });
  const capaRef = useRef<HTMLDivElement>(null);

  const IconeComponente = iconesDisponiveis[iconeEscolhido as keyof typeof iconesDisponiveis];
  const caracteresTitulo = titulo.length;
  const tituloLongo = caracteresTitulo > 80;

  const nomeArquivo = useMemo(() => {
    const slug = titulo
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40);
    return `parcele-news-${numero}-${slug || "capa"}`;
  }, [numero, titulo]);

  const gerarImagem = async () => {
    if (!capaRef.current) {
      setStatus({ tipo: "erro", msg: "Capa não encontrada no DOM." });
      return;
    }
    setStatus({ tipo: "gerando" });
    await gerarCapaPNG(capaRef.current, {
      nomeArquivo,
      onSuccess: () => {
        setStatus({ tipo: "sucesso" });
        setTimeout(() => setStatus({ tipo: "idle" }), 2500);
      },
      onError: (err) => {
        setStatus({ tipo: "erro", msg: err.message || "Erro desconhecido ao gerar PNG." });
      },
    });
  };

  return (
    <div className="w-full min-h-screen bg-[#050505]">
      <div className="max-w-[1400px] mx-auto px-6 py-12 space-y-8">
        {/* Preview da Capa */}
        <section
          aria-label="Preview da capa"
          className="bg-[#0a0a0a] rounded-2xl border border-white/5 p-8 overflow-hidden shadow-2xl"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-bold text-white/40 uppercase tracking-widest font-['Archivo',sans-serif]">
              Preview da Capa
            </h2>
            <span className="text-[10px] text-white/20 font-mono tracking-tighter">1280 × 720 PX · PNG EXPORT</span>
          </div>
          <div className="flex justify-center overflow-hidden">
            <div
              style={{
                transform: "scale(0.55)",
                transformOrigin: "top center",
                width: "1280px",
                height: "400px",
              }}
            >
              <div ref={capaRef} className="shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                <LinkedInCover
                  numero={numero}
                  titulo={titulo}
                  legendaLinha1={legendaLinha1}
                  legendaLinha2={legendaLinha2}
                  fotoUrl={fotoUrl}
                  usarLegenda1={usarLegenda1}
                  usarSubtitulo={usarSubtitulo}
                  IconeCustomizado={() => <IconeCustomizado IconeComponente={IconeComponente} />}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Form em 2 colunas */}
        <section
          aria-label="Configuração da capa"
          className="bg-[#0a0a0a] rounded-2xl border border-white/5 p-8"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1.5 h-6 bg-[#FFC528] rounded-full" />
            <h2 className="text-xl font-bold text-white font-['Archivo',sans-serif] tracking-tight">
              Parâmetros de Edição
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Coluna esquerda */}
            <div className="space-y-6">
              {/* Número e Ícone */}
              <div className="grid grid-cols-2 gap-4">
                <FieldWrapper label="Edição #" htmlFor="numero">
                  <input
                    id="numero"
                    type="text"
                    value={numero}
                    onChange={(e) => setNumero(e.target.value.replace(/[^\d]/g, ""))}
                    className="input-base"
                    placeholder="46"
                    maxLength={4}
                  />
                </FieldWrapper>

                <FieldWrapper label="Símbolo" htmlFor="icone">
                  <SelectIconeComPreview
                    id="icone"
                    valor={iconeEscolhido}
                    onChange={setIconeEscolhido}
                  />
                </FieldWrapper>
              </div>

              {/* Título */}
              <FieldWrapper
                label="Título da Newsletter"
                htmlFor="titulo"
                hint={
                  <span className={tituloLongo ? "text-amber-400" : "text-white/20"}>
                    {caracteresTitulo} caracteres {tituloLongo && " (Limite visual sugerido: 80)"}
                  </span>
                }
              >
                <textarea
                  id="titulo"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  rows={3}
                  className="input-base resize-none"
                  placeholder="Mercado B2B: flexibilidade financeira na cadeia de suprimentos"
                />
              </FieldWrapper>

              {/* Legendas */}
              <div className="space-y-4 bg-white/[0.02] rounded-xl p-5 border border-white/5">
                <h3 className="text-xs font-bold text-white/30 uppercase tracking-wider">Legendas (Sobre a Foto)</h3>

                <ToggleField
                  id="usarLegenda1"
                  label="Linha 1 (Suave)"
                  checked={usarLegenda1}
                  onChange={setUsarLegenda1}
                >
                  <input
                    type="text"
                    value={legendaLinha1}
                    onChange={(e) => setLegendaLinha1(e.target.value)}
                    disabled={!usarLegenda1}
                    className="input-base"
                    placeholder="Tecnologia que destrava"
                  />
                </ToggleField>

                <ToggleField
                  id="usarSubtitulo"
                  label="Linha 2 (Destaque)"
                  checked={usarSubtitulo}
                  onChange={setUsarSubtitulo}
                >
                  <input
                    type="text"
                    value={legendaLinha2}
                    onChange={(e) => setLegendaLinha2(e.target.value)}
                    disabled={!usarSubtitulo}
                    className="input-base"
                    placeholder="o seu dia a dia financeiro."
                  />
                </ToggleField>
              </div>
            </div>

            {/* Coluna direita - Foto */}
            <div className="space-y-6">
              <FieldWrapper
                label="Fonte da Imagem"
                htmlFor="foto"
                hint="URL direta ou assets locais"
              >
                <input
                  id="foto"
                  type="text"
                  value={fotoUrl}
                  onChange={(e) => setFotoUrl(e.target.value)}
                  className="input-base"
                  placeholder="https://images.unsplash.com/..."
                />
              </FieldWrapper>

              <div className="pt-2">
                <UnsplashSearch
                  onSelectImage={(url) => setFotoUrl(url)}
                  grupoIndex={0}
                  valorAtual={fotoUrl}
                />
              </div>
            </div>
          </div>

          {/* Barra de ação */}
          <div className="mt-10 pt-8 border-t border-white/5 flex items-center justify-between gap-4 flex-wrap">
            <StatusBadge status={status} />

            <button
              onClick={gerarImagem}
              disabled={status.tipo === "gerando" || !titulo.trim()}
              className="px-8 py-4 bg-[#FFC528] text-black rounded-xl hover:bg-[#FFD04F] active:scale-95 transition-all font-bold shadow-[0_10px_20px_rgba(255,197,40,0.2)] flex items-center gap-3 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {status.tipo === "gerando" ? (
                <>
                  <Spinner />
                  Gerando PNG...
                </>
              ) : (
                <>
                  <LucideIcons.Download size={20} />
                  Exportar Capa Final
                </>
              )}
            </button>
          </div>
        </section>
      </div>

      <GlobalStyles />
    </div>
  );
}

/* ============ Componentes auxiliares ============ */

function FieldWrapper({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={htmlFor} className="block text-xs font-bold text-white/40 uppercase tracking-wide">
        {label}
      </label>
      {children}
      {hint && <div className="text-[11px]">{hint}</div>}
    </div>
  );
}

function ToggleField({
  id,
  label,
  checked,
  onChange,
  children,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 cursor-pointer select-none group">
        <div 
          className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${checked ? 'bg-[#FFC528] border-[#FFC528]' : 'bg-transparent border-white/20 group-hover:border-white/40'}`}
          onClick={(e) => { e.preventDefault(); onChange(!checked); }}
        >
          {checked && <LucideIcons.Check size={12} className="text-black" />}
        </div>
        <span className="text-[13px] font-medium text-white/60 group-hover:text-white transition-colors">{label}</span>
      </label>
      {children}
    </div>
  );
}

function StatusBadge({ status }: { status: Status }) {
  if (status.tipo === "idle") {
    return <span className="text-xs text-white/20 font-medium">Sistema ocioso</span>;
  }
  if (status.tipo === "gerando") {
    return (
      <span className="flex items-center gap-2 text-xs text-[#FFC528] font-bold">
        <Spinner size={12} /> Renderizando…
      </span>
    );
  }
  if (status.tipo === "sucesso") {
    return (
      <span className="flex items-center gap-2 text-xs text-emerald-400 font-bold">
        <LucideIcons.CheckCircle2 size={16} /> Exportação concluída
      </span>
    );
  }
  return (
    <span className="flex items-start gap-2 text-xs text-red-400 max-w-md font-medium">
      <LucideIcons.AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
      <span>
        Erro: {status.msg}
      </span>
    </span>
  );
}

function Spinner({ size = 16 }: { size?: number }) {
  return (
    <svg
      className="animate-spin"
      style={{ width: size, height: size }}
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function GlobalStyles() {
  return (
    <style>{`
      .input-base {
        width: 100%;
        padding: 12px 16px;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.08);
        color: white;
        border-radius: 12px;
        font-size: 14px;
        transition: all 0.2s ease;
      }
      .input-base:focus {
        outline: none;
        border-color: #FFC528;
        background: rgba(255, 255, 255, 0.06);
        box-shadow: 0 0 0 4px rgba(255, 197, 40, 0.1);
      }
      .input-base:disabled {
        opacity: 0.3;
        cursor: not-allowed;
      }
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `}</style>
  );
}
