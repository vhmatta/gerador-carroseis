import { useState } from "react";
import {
  Palette,
  Layout,
  Type,
  Image as ImageIcon,
  RotateCcw,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import UnsplashSearch from "../UnsplashSearch";
import { TEMAS_DISPONIVEIS, obterTema } from "../temas";
import {
  FONTE_LABELS,
  FONTE_FAMILIAS,
  PESO_LABELS,
  CAPS_LABELS,
  type SlideData,
  type TemaId,
  type FonteId,
  type PesoFonte,
  type ModoCaps,
  type TipografiaOverride,
  type ElementoTipo,
} from "../temas/tipos";

interface EditPanelProps {
  slide: SlideData;
  onChange: (patch: Partial<SlideData>) => void;
  temaId: TemaId;
  onTrocarTema: (id: TemaId) => void;
  temaAtivo: ReturnType<typeof obterTema>;
}

/**
 * Painel direito de edição do slide ativo.
 * Contém: tema, layout, cor de fundo, tipografia, textos, cores, foto.
 */
export default function EditPanel({
  slide,
  onChange,
  temaId,
  onTrocarTema,
  temaAtivo,
}: EditPanelProps) {
  const layoutAtual =
    temaAtivo.layouts.find((l) => l.id === slide.layout) || temaAtivo.layouts[0];
  const usaFoto = layoutAtual.usaFoto;
  const usaDuasFotos = Boolean(layoutAtual.usaDuasFotos);
  const coresFundoPermitidas =
    layoutAtual.coresFundoPermitidas || ["preto", "amarelo", "bege", "branco"];

  const cores = temaAtivo.cores;

  return (
    <div className="space-y-4">
      {/* Tema visual */}
      <div>
        <Label icone={<Palette size={12} />}>Tema visual</Label>
        <div className="grid grid-cols-1 gap-1.5">
          {TEMAS_DISPONIVEIS.map((t) => {
            const ativo = temaId === t.id;
            return (
              <button
                key={t.id}
                onClick={() => onTrocarTema(t.id)}
                className={`text-left px-3 py-2 rounded-md border transition-all ${
                  ativo
                    ? "bg-[#FFC528] text-black border-[#FFC528]"
                    : "bg-[#0f0f0f] border-gray-800 text-gray-300 hover:border-[#FFC528]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5">
                    <span
                      className="w-3 h-3 rounded-sm"
                      style={{ background: t.cores.preto, border: "1px solid #333" }}
                    />
                    <span className="w-3 h-3 rounded-sm" style={{ background: t.cores.amarelo }} />
                    <span
                      className="w-3 h-3 rounded-sm"
                      style={{ background: t.cores.bege, border: "1px solid #333" }}
                    />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wide">{t.nome}</span>
                </div>
                <div className={`text-[10px] mt-1 ${ativo ? "text-black/70" : "text-gray-500"}`}>
                  {t.descricao}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Layout (do tema ativo) */}
      <div>
        <Label icone={<Layout size={12} />}>Layout</Label>
        <div className="grid grid-cols-1 gap-1.5">
          {temaAtivo.layouts.map((l) => {
            const ativo = slide.layout === l.id;
            return (
              <button
                key={l.id}
                onClick={() => onChange({ layout: l.id })}
                className={`text-left px-3 py-2 rounded-md border transition-all ${
                  ativo
                    ? "bg-[#FFC528] text-black border-[#FFC528]"
                    : "bg-[#0f0f0f] border-gray-800 text-gray-300 hover:border-[#FFC528]"
                }`}
              >
                <div className="text-xs font-bold uppercase tracking-wide">{l.nome}</div>
                <div className={`text-[10px] mt-0.5 ${ativo ? "text-black/70" : "text-gray-500"}`}>
                  {l.descricao}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Cor de fundo */}
      {coresFundoPermitidas.length > 1 && (
        <div>
          <Label>Cor de fundo</Label>
          <div className="grid grid-cols-4 gap-1.5">
            {(["preto", "amarelo", "bege", "branco"] as const)
              .filter((c) => coresFundoPermitidas.includes(c))
              .map((c) => {
                const ativo = slide.corFundo === c;
                const bg =
                  c === "preto"
                    ? "#0a0a0a"
                    : c === "amarelo"
                    ? "#FFC528"
                    : c === "bege"
                    ? "#F4F1EA"
                    : "#ffffff";
                return (
                  <button
                    key={c}
                    onClick={() => onChange({ corFundo: c })}
                    className={`h-10 rounded-md border-2 transition-all ${
                      ativo
                        ? "border-[#FFC528] ring-2 ring-[#FFC528]/30"
                        : "border-gray-800 hover:border-gray-600"
                    }`}
                    style={{ background: bg }}
                    title={c}
                  />
                );
              })}
          </div>
        </div>
      )}

      {/* Painel de Tipografia (modo simples + avançado) */}
      <PainelTipografia slide={slide} onChange={onChange} temaAtivo={temaAtivo} />

      {/* Textos */}
      <div className="space-y-3">
        <Label icone={<Type size={12} />}>Textos</Label>

        <CampoTexto
          label="Kicker"
          dica="ex: TESE Nº 1, MITO, CONCLUSÃO"
          valor={slide.kicker}
          onChange={(v) => onChange({ kicker: v })}
          maxLen={80}
        />

        <CampoTexto
          label="Headline"
          dica="use ↵ Enter para quebrar linha"
          valor={slide.headline}
          onChange={(v) => onChange({ headline: v })}
          multiline
          rows={3}
          maxLen={200}
        />

        <CampoTexto
          label="Big Number"
          dica='Opcional. Ex: "+32%" — usado em alguns layouts'
          valor={slide.numero}
          onChange={(v) => onChange({ numero: v })}
          maxLen={12}
        />

        <CampoTexto
          label="Corpo"
          valor={slide.corpo}
          onChange={(v) => onChange({ corpo: v })}
          multiline
          rows={4}
          maxLen={500}
        />

        <CampoTexto
          label="Destaque"
          dica="Frase em cor de destaque"
          valor={slide.destaque}
          onChange={(v) => onChange({ destaque: v })}
          maxLen={180}
        />

        {usaDuasFotos && (
          <CampoTexto
            label="Legenda das fotos"
            valor={slide.legendaFoto}
            onChange={(v) => onChange({ legendaFoto: v })}
            maxLen={120}
          />
        )}
      </div>

      {/* Cores personalizadas dos textos editoriais */}
      <div className="space-y-2 pt-2 border-t border-gray-800">
        <div className="flex items-center justify-between">
          <Label icone={<Palette size={12} />}>Cores dos textos</Label>
          <button
            onClick={() =>
              onChange({
                corKicker: undefined,
                corHeadline: undefined,
                corDestaque: undefined,
              })
            }
            className="text-[10px] text-gray-500 hover:text-[#FFC528] flex items-center gap-1"
            title="Voltar às cores padrão do tema"
          >
            <RotateCcw size={10} />
            Resetar
          </button>
        </div>

        <ColorField
          label="Kicker"
          valor={slide.corKicker}
          fallback={cores.amarelo}
          tema={temaAtivo}
          onChange={(v) => onChange({ corKicker: v })}
        />
        <ColorField
          label="Headline"
          valor={slide.corHeadline}
          fallback={cores.amarelo}
          tema={temaAtivo}
          onChange={(v) => onChange({ corHeadline: v })}
        />
        <ColorField
          label="Destaque"
          valor={slide.corDestaque}
          fallback={cores.amarelo}
          tema={temaAtivo}
          onChange={(v) => onChange({ corDestaque: v })}
        />
      </div>

      {/* v7.5: Cores das legendas (topo + rodapé + numeração) */}
      <div className="space-y-2 pt-2 border-t border-gray-800">
        <div className="flex items-center justify-between">
          <Label icone={<Palette size={12} />}>Legendas (topo · rodapé)</Label>
          <button
            onClick={() =>
              onChange({
                corTopbar: undefined,
                corRodape: undefined,
                corNumero: undefined,
              })
            }
            className="text-[10px] text-gray-500 hover:text-[#FFC528] flex items-center gap-1"
            title="Voltar às cores padrão do tema"
          >
            <RotateCcw size={10} />
            Resetar
          </button>
        </div>

        <ColorField
          label="Topo"
          valor={slide.corTopbar}
          fallback={slide.corFundo === "preto" ? cores.amarelo : cores.preto}
          tema={temaAtivo}
          onChange={(v) => onChange({ corTopbar: v })}
        />
        <ColorField
          label="Rodapé"
          valor={slide.corRodape}
          fallback={slide.corFundo === "preto" ? cores.branco : cores.preto}
          tema={temaAtivo}
          onChange={(v) => onChange({ corRodape: v })}
        />
        <ColorField
          label="Numeração"
          valor={slide.corNumero}
          fallback={slide.corFundo === "preto" ? cores.amarelo : cores.preto}
          tema={temaAtivo}
          onChange={(v) => onChange({ corNumero: v })}
        />
        <p className="text-[10px] text-gray-600 leading-relaxed pl-1">
          Topo: marca + textos do cabeçalho. Rodapé: texto inferior (ex: "▶ BRANDS PAGE
          5/000"). Numeração: contador "01 / 06".
        </p>
      </div>

      {/* Pill de CTA */}
      <div className="space-y-2 pt-2 border-t border-gray-800">
        <label className="flex items-center gap-2 text-xs text-gray-300">
          <input
            type="checkbox"
            checked={slide.mostrarPill}
            onChange={(e) => onChange({ mostrarPill: e.target.checked })}
            className="accent-[#FFC528]"
          />
          Mostrar pill de CTA
        </label>
        {slide.mostrarPill && (
          <CampoTexto
            label="Texto do CTA"
            valor={slide.textoPill}
            onChange={(v) => onChange({ textoPill: v })}
            maxLen={40}
          />
        )}
      </div>

      {/* Foto(s) */}
      {usaFoto && (
        <div className="space-y-2 pt-2 border-t border-gray-800">
          <Label icone={<ImageIcon size={12} />}>{usaDuasFotos ? "Foto 1 (topo)" : "Foto"}</Label>
          <UnsplashSearch
            grupoIndex={0}
            valorAtual={slide.fotoUrl}
            onSelectImage={(url) => onChange({ fotoUrl: url })}
          />

          {usaDuasFotos && (
            <>
              <Label icone={<ImageIcon size={12} />}>Foto 2 (meio)</Label>
              <UnsplashSearch
                grupoIndex={1}
                valorAtual={slide.fotoUrl2}
                onSelectImage={(url) => onChange({ fotoUrl2: url })}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================
// COLOR FIELD
// ============================================================
function ColorField({
  label,
  valor,
  fallback,
  tema,
  onChange,
}: {
  label: string;
  valor: string | undefined;
  fallback: string;
  tema: ReturnType<typeof obterTema>;
  onChange: (v: string | undefined) => void;
}) {
  const corEfetiva = valor || fallback;
  const sugestoes = [
    tema.cores.amarelo,
    tema.cores.preto,
    tema.cores.branco,
    tema.cores.bege,
    "#FF4444",
    "#4CAF50",
  ];

  return (
    <div className="flex items-center gap-2">
      <div className="w-20 text-[11px] text-gray-400">{label}</div>
      <input
        type="color"
        value={corEfetiva}
        onChange={(e) => onChange(e.target.value)}
        className="w-8 h-8 rounded border border-gray-800 cursor-pointer bg-transparent"
        style={{ padding: 0 }}
      />
      <input
        type="text"
        value={corEfetiva}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 bg-[#0f0f0f] border border-gray-800 rounded-md px-2 py-1.5 text-[11px] text-white focus:outline-none focus:border-[#FFC528] font-mono uppercase"
        maxLength={7}
      />
      <div className="flex gap-0.5">
        {sugestoes.slice(0, 3).map((c) => (
          <button
            key={c}
            onClick={() => onChange(c)}
            className="w-5 h-5 rounded-sm border border-gray-800 hover:scale-110 transition-transform"
            style={{ background: c }}
            title={c}
          />
        ))}
      </div>
    </div>
  );
}

function Label({ children, icone }: { children: React.ReactNode; icone?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
      {icone}
      {children}
    </div>
  );
}

function CampoTexto({
  label,
  valor,
  onChange,
  multiline,
  rows,
  maxLen,
  dica,
}: {
  label: string;
  valor: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  rows?: number;
  maxLen?: number;
  dica?: string;
}) {
  const props = {
    value: valor,
    onChange: (e: React.ChangeEvent<any>) => onChange(e.target.value),
    maxLength: maxLen,
    className:
      "w-full bg-[#0f0f0f] border border-gray-800 rounded-md px-2.5 py-2 text-xs text-white focus:outline-none focus:border-[#FFC528] placeholder:text-gray-600 resize-none",
  };
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1">
        <label className="text-[11px] font-medium text-gray-400">{label}</label>
        {maxLen && (
          <span
            className={`text-[9px] ${
              valor.length > maxLen * 0.85 ? "text-[#FFC528]" : "text-gray-600"
            }`}
          >
            {valor.length}/{maxLen}
          </span>
        )}
      </div>
      {multiline ? <textarea rows={rows || 3} {...props} /> : <input type="text" {...props} />}
      {dica && <p className="text-[10px] text-gray-600 mt-1">{dica}</p>}
    </div>
  );
}

// ============================================================
// PAINEL DE TIPOGRAFIA AVANÇADA (v7)
// ============================================================

const ELEMENTOS: { id: ElementoTipo; label: string; ehNumero?: boolean }[] = [
  { id: "kicker", label: "Kicker" },
  { id: "headline", label: "Headline" },
  { id: "corpo", label: "Corpo" },
  { id: "destaque", label: "Destaque" },
  { id: "numero", label: "Big Number", ehNumero: true },
  { id: "pill", label: "Pill / CTA" },
];

function PainelTipografia({
  slide,
  onChange,
  temaAtivo,
}: {
  slide: SlideData;
  onChange: (patch: Partial<SlideData>) => void;
  temaAtivo: any;
}) {
  const [mostrarAvancado, setMostrarAvancado] = useState(false);
  const escalaGeral = slide.escalaGeral ?? 1;

  const fonteAtual = slide.fonteHeadline || temaAtivo.fonteHeadlineDefault;
  const headlineCapsAtual = slide.headlineCaps;

  const capsSimples: "padrao" | "caps" | "min" =
    headlineCapsAtual === undefined ? "padrao" : headlineCapsAtual ? "caps" : "min";

  const setCapsSimples = (modo: "padrao" | "caps" | "min") => {
    if (modo === "padrao") onChange({ headlineCaps: undefined });
    else if (modo === "caps") onChange({ headlineCaps: true });
    else onChange({ headlineCaps: false });
  };

  const resetar = () => {
    onChange({
      escalaGeral: undefined,
      fonteHeadline: undefined,
      headlineCaps: undefined,
      headlineEscala: undefined,
      tipoKicker: undefined,
      tipoHeadline: undefined,
      tipoCorpo: undefined,
      tipoDestaque: undefined,
      tipoNumero: undefined,
      tipoPill: undefined,
    });
  };

  const temAlgumOverride =
    slide.escalaGeral !== undefined ||
    slide.fonteHeadline !== undefined ||
    slide.headlineCaps !== undefined ||
    slide.headlineEscala !== undefined ||
    slide.tipoKicker !== undefined ||
    slide.tipoHeadline !== undefined ||
    slide.tipoCorpo !== undefined ||
    slide.tipoDestaque !== undefined ||
    slide.tipoNumero !== undefined ||
    slide.tipoPill !== undefined;

  return (
    <div className="space-y-3 pt-2 border-t border-gray-800">
      <div className="flex items-center justify-between">
        <Label icone={<Type size={12} />}>Tipografia</Label>
        {temAlgumOverride && (
          <button
            onClick={resetar}
            className="text-[10px] text-gray-500 hover:text-[#FFC528] flex items-center gap-1 transition-colors"
            title="Voltar todos os controles ao padrão do tema"
          >
            <RotateCcw size={10} />
            Resetar
          </button>
        )}
      </div>

      <div className="space-y-3 bg-[#0a0a0a] border border-gray-800 rounded-md p-3">
        <SliderTamanhoGeral
          valor={escalaGeral}
          onChange={(v) => onChange({ escalaGeral: v === 1 ? undefined : v })}
        />

        <div>
          <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1.5">
            Caso do headline
          </div>
          <div className="grid grid-cols-3 gap-1">
            <BotaoCaso ativo={capsSimples === "padrao"} onClick={() => setCapsSimples("padrao")}>
              Padrão
            </BotaoCaso>
            <BotaoCaso ativo={capsSimples === "caps"} onClick={() => setCapsSimples("caps")}>
              CAPS
            </BotaoCaso>
            <BotaoCaso ativo={capsSimples === "min"} onClick={() => setCapsSimples("min")}>
              minúsculas
            </BotaoCaso>
          </div>
        </div>

        <div>
          <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1.5">
            Fonte do headline
          </div>
          <select
            value={fonteAtual}
            onChange={(e) => onChange({ fonteHeadline: e.target.value as FonteId })}
            className="w-full bg-[#0f0f0f] border border-gray-800 rounded px-2.5 py-2 text-xs text-white focus:outline-none focus:border-[#FFC528]"
            style={{ fontFamily: FONTE_FAMILIAS[fonteAtual] }}
          >
            {(Object.keys(FONTE_LABELS) as FonteId[]).map((f) => (
              <option key={f} value={f} style={{ fontFamily: FONTE_FAMILIAS[f] }}>
                {FONTE_LABELS[f]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        onClick={() => setMostrarAvancado((v) => !v)}
        className="w-full flex items-center justify-between text-[11px] text-gray-400 hover:text-[#FFC528] transition-colors py-1.5 px-1"
      >
        <span className="flex items-center gap-1.5">
          <Sparkles size={11} />
          Tipografia avançada por elemento
        </span>
        <ChevronRight
          size={14}
          className={`transition-transform ${mostrarAvancado ? "rotate-90" : ""}`}
        />
      </button>

      {mostrarAvancado && (
        <div className="space-y-2">
          {ELEMENTOS.map((el) => (
            <SecaoElemento
              key={el.id}
              elementoId={el.id}
              label={el.label}
              ehNumero={el.ehNumero}
              slide={slide}
              onChange={onChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SliderTamanhoGeral({
  valor,
  onChange,
}: {
  valor: number;
  onChange: (v: number) => void;
}) {
  const pct = Math.round(valor * 100);
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] text-gray-500 uppercase tracking-wider">Tamanho geral</span>
        <span className="text-[10px] text-[#FFC528] font-mono">{pct}%</span>
      </div>
      <input
        type="range"
        min={70}
        max={150}
        step={5}
        value={pct}
        onChange={(e) => onChange(parseInt(e.target.value, 10) / 100)}
        className="w-full accent-[#FFC528]"
      />
    </div>
  );
}

function BotaoCaso({
  children,
  ativo,
  onClick,
}: {
  children: React.ReactNode;
  ativo: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`text-[10px] py-1.5 rounded transition-all ${
        ativo
          ? "bg-[#FFC528] text-black font-bold"
          : "bg-[#0f0f0f] border border-gray-800 text-gray-400 hover:border-gray-600"
      }`}
    >
      {children}
    </button>
  );
}

function SecaoElemento({
  elementoId,
  label,
  ehNumero,
  slide,
  onChange,
}: {
  elementoId: ElementoTipo;
  label: string;
  ehNumero?: boolean;
  slide: SlideData;
  onChange: (patch: Partial<SlideData>) => void;
}) {
  const [aberto, setAberto] = useState(false);
  const campoOverride = `tipo${
    elementoId.charAt(0).toUpperCase() + elementoId.slice(1)
  }` as keyof SlideData;
  const override = (slide[campoOverride] as TipografiaOverride | undefined) || {};

  const tamanhoBase = ehNumero
    ? 240
    : elementoId === "headline"
    ? 88
    : elementoId === "kicker"
    ? 14
    : elementoId === "pill"
    ? 14
    : 24;

  const aplicar = (patch: Partial<TipografiaOverride>) => {
    const novo = { ...override, ...patch };
    const limpo: TipografiaOverride = {};
    if (novo.escala !== undefined) limpo.escala = novo.escala;
    if (novo.tamanhoPx !== undefined) limpo.tamanhoPx = novo.tamanhoPx;
    if (novo.fonte !== undefined) limpo.fonte = novo.fonte;
    if (novo.peso !== undefined) limpo.peso = novo.peso;
    if (novo.caps !== undefined) limpo.caps = novo.caps;
    if (novo.tracking !== undefined) limpo.tracking = novo.tracking;

    onChange({
      [campoOverride]: Object.keys(limpo).length > 0 ? limpo : undefined,
    } as Partial<SlideData>);
  };

  const limpar = () => onChange({ [campoOverride]: undefined } as Partial<SlideData>);

  const temOverride = Object.keys(override).length > 0;

  return (
    <div className="bg-[#0a0a0a] border border-gray-800 rounded-md overflow-hidden">
      <button
        onClick={() => setAberto((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-2 hover:bg-[#0f0f0f] transition-colors"
      >
        <span className="text-[11px] font-bold text-gray-300 flex items-center gap-2">
          {label}
          {temOverride && (
            <span className="text-[8px] bg-[#FFC528] text-black px-1.5 py-0.5 rounded font-bold">
              EDITADO
            </span>
          )}
        </span>
        <ChevronRight
          size={12}
          className={`text-gray-500 transition-transform ${aberto ? "rotate-90" : ""}`}
        />
      </button>

      {aberto && (
        <div className="px-3 pb-3 pt-1 space-y-2.5 border-t border-gray-800">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] text-gray-500 uppercase tracking-wider">
                Tamanho ({tamanhoBase}px padrão)
              </span>
              <span className="text-[9px] text-gray-400 font-mono">
                {override.tamanhoPx ?? Math.round(tamanhoBase * (override.escala ?? 1))}px
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={Math.round(tamanhoBase * 0.4)}
                max={Math.round(tamanhoBase * 1.8)}
                step={1}
                value={override.tamanhoPx ?? Math.round(tamanhoBase * (override.escala ?? 1))}
                onChange={(e) =>
                  aplicar({ tamanhoPx: parseInt(e.target.value, 10), escala: undefined })
                }
                className="flex-1 accent-[#FFC528]"
              />
              <input
                type="number"
                value={override.tamanhoPx ?? Math.round(tamanhoBase * (override.escala ?? 1))}
                onChange={(e) => {
                  const v = parseInt(e.target.value, 10);
                  if (!isNaN(v)) aplicar({ tamanhoPx: v, escala: undefined });
                }}
                className="w-14 bg-[#0f0f0f] border border-gray-800 rounded px-1.5 py-1 text-[10px] text-white focus:outline-none focus:border-[#FFC528]"
              />
            </div>
          </div>

          <div>
            <div className="text-[9px] text-gray-500 uppercase tracking-wider mb-1">Fonte</div>
            <select
              value={override.fonte || ""}
              onChange={(e) =>
                aplicar({ fonte: (e.target.value || undefined) as FonteId | undefined })
              }
              className="w-full bg-[#0f0f0f] border border-gray-800 rounded px-2 py-1.5 text-[10px] text-white focus:outline-none focus:border-[#FFC528]"
            >
              <option value="">— padrão —</option>
              {(Object.keys(FONTE_LABELS) as FonteId[]).map((f) => (
                <option key={f} value={f}>
                  {FONTE_LABELS[f]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="text-[9px] text-gray-500 uppercase tracking-wider mb-1">Peso</div>
            <select
              value={override.peso ?? ""}
              onChange={(e) =>
                aplicar({
                  peso: e.target.value
                    ? (parseInt(e.target.value, 10) as PesoFonte)
                    : undefined,
                })
              }
              className="w-full bg-[#0f0f0f] border border-gray-800 rounded px-2 py-1.5 text-[10px] text-white focus:outline-none focus:border-[#FFC528]"
            >
              <option value="">— padrão —</option>
              {(Object.keys(PESO_LABELS) as unknown as PesoFonte[]).map((p) => (
                <option key={p} value={p}>
                  {PESO_LABELS[p]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="text-[9px] text-gray-500 uppercase tracking-wider mb-1">
              Capitalização
            </div>
            <select
              value={override.caps || "padrao"}
              onChange={(e) =>
                aplicar({
                  caps: e.target.value === "padrao" ? undefined : (e.target.value as ModoCaps),
                })
              }
              className="w-full bg-[#0f0f0f] border border-gray-800 rounded px-2 py-1.5 text-[10px] text-white focus:outline-none focus:border-[#FFC528]"
            >
              {(Object.keys(CAPS_LABELS) as ModoCaps[]).map((c) => (
                <option key={c} value={c}>
                  {CAPS_LABELS[c]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] text-gray-500 uppercase tracking-wider">
                Espaçamento
              </span>
              <span className="text-[9px] text-gray-400 font-mono">
                {override.tracking ?? 0}px
              </span>
            </div>
            <input
              type="range"
              min={-5}
              max={10}
              step={0.5}
              value={override.tracking ?? 0}
              onChange={(e) => aplicar({ tracking: parseFloat(e.target.value) || undefined })}
              className="w-full accent-[#FFC528]"
            />
          </div>

          {temOverride && (
            <button
              onClick={limpar}
              className="w-full text-[9px] text-gray-500 hover:text-[#FFC528] py-1 flex items-center justify-center gap-1 transition-colors"
            >
              <RotateCcw size={9} />
              Limpar este elemento
            </button>
          )}
        </div>
      )}
    </div>
  );
}
