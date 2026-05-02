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
    <div className="w-full min-h-screen bg-[#0f0f0f]">
      <div className="max-w-[1400px] mx-auto px-6 py-8 space-y-6">
        {/* Preview da Capa */}
        <section
          aria-label="Preview da capa"
          className="bg-[#141414] rounded-xl border border-gray-800 p-6 overflow-hidden"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white font-['Archivo',sans-serif]">
              Preview
            </h2>
            <span className="text-xs text-gray-500 font-mono">Saída: 1280 × 720 px</span>
          </div>
          <div className="flex justify-center overflow-hidden">
            <div
              style={{
                transform: "scale(0.5)",
                transformOrigin: "top center",
                width: "1280px",
                height: "360px",
              }}
            >
              <div ref={capaRef}>
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
          className="bg-[#141414] rounded-xl border border-gray-800 p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-[#FFC528] flex items-center justify-center">
              <LucideIcons.Settings size={16} className="text-black" />
            </div>
            <h2 className="text-xl font-semibold text-white font-['Archivo',sans-serif]">
              Configuração
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Coluna esquerda */}
            <div className="space-y-5">
              {/* Número e Ícone */}
              <div className="grid grid-cols-2 gap-4">
                <FieldWrapper label="Número da edição" htmlFor="numero">
                  <input
                    id="numero"
                    type="text"
                    value={numero}
                    onChange={(e) => setNumero(e.target.value.replace(/[^\d]/g, ""))}
                    className="input-base"
                    placeholder="49"
                    maxLength={4}
                  />
                </FieldWrapper>

                <FieldWrapper label="Ícone" htmlFor="icone">
                  <SelectIconeComPreview
                    id="icone"
                    valor={iconeEscolhido}
                    onChange={setIconeEscolhido}
                  />
                </FieldWrapper>
              </div>

              {/* Título */}
              <FieldWrapper
                label="Título principal"
                htmlFor="titulo"
                hint={
                  <span className={tituloLongo ? "text-amber-400" : "text-gray-500"}>
                    {caracteresTitulo} caracteres {tituloLongo && " — pode quebrar visualmente acima de 80"}
                  </span>
                }
              >
                <textarea
                  id="titulo"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  rows={3}
                  className="input-base resize-none"
                  placeholder="Ex: Mercado B2C: o uso estratégico e consciente do parcelamento"
                />
              </FieldWrapper>

              {/* Legendas */}
              <div className="space-y-4 bg-[#0f0f0f] rounded-lg p-4 border border-gray-800">
                <h3 className="text-sm font-semibold text-gray-300">Legendas sobre a foto</h3>

                <ToggleField
                  id="usarLegenda1"
                  label="Linha 1 (texto leve)"
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
                  label="Linha 2 (negrito, destaque)"
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
            <div className="space-y-4">
              <FieldWrapper
                label="URL da foto"
                htmlFor="foto"
                hint="Cole URL externa (Unsplash) ou caminho /assets/..."
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

              <UnsplashSearch
                onSelectImage={(url) => setFotoUrl(url)}
                grupoIndex={0}
                valorAtual={fotoUrl}
              />
            </div>
          </div>

          {/* Barra de ação */}
          <div className="mt-6 pt-6 border-t border-gray-800 flex items-center justify-between gap-4 flex-wrap">
            <StatusBadge status={status} />

            <button
              onClick={gerarImagem}
              disabled={status.tipo === "gerando" || !titulo.trim()}
              className="px-6 py-3 bg-[#FFC528] text-black rounded-lg hover:bg-[#FFD04F] active:bg-[#E8B320] transition-colors font-bold shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status.tipo === "gerando" ? (
                <>
                  <Spinner />
                  Gerando imagem...
                </>
              ) : (
                <>
                  <LucideIcons.Download size={18} />
                  Baixar PNG
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
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-300">
        {label}
      </label>
      {children}
      {hint && <div className="text-xs">{hint}</div>}
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
    <div className="space-y-2">
      <label className="flex items-center gap-2 cursor-pointer select-none">
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="w-4 h-4 accent-[#FFC528] rounded"
        />
        <span className="text-sm text-gray-300">{label}</span>
      </label>
      {children}
    </div>
  );
}

function StatusBadge({ status }: { status: Status }) {
  if (status.tipo === "idle") {
    return <span className="text-xs text-gray-500">Pronto para gerar</span>;
  }
  if (status.tipo === "gerando") {
    return (
      <span className="flex items-center gap-2 text-xs text-[#FFC528]">
        <Spinner size={12} /> Processando imagem…
      </span>
    );
  }
  if (status.tipo === "sucesso") {
    return (
      <span className="flex items-center gap-2 text-xs text-emerald-400">
        <LucideIcons.CheckCircle2 size={14} /> Imagem baixada com sucesso!
      </span>
    );
  }
  return (
    <span className="flex items-start gap-2 text-xs text-red-400 max-w-md">
      <LucideIcons.AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
      <span>
        <strong>Erro:</strong> {status.msg}
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
        padding: 10px 12px;
        background: #1f1f1f;
        border: 1px solid #333;
        color: white;
        border-radius: 8px;
        font-size: 14px;
        transition: border-color 0.15s, background 0.15s;
      }
      .input-base:focus {
        outline: none;
        border-color: #FFC528;
        background: #242424;
      }
      .input-base:disabled {
        background: #141414;
        color: #555;
        cursor: not-allowed;
      }
    `}</style>
  );
}
