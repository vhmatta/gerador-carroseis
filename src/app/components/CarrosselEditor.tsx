import { useState, useRef, useMemo, useCallback } from "react";
import {
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Download,
  Wand2,
  Loader2,
  Copy,
  Image as ImageIcon,
  Type,
  Layout,
  CheckCircle2,
  AlertCircle,
  GripVertical,
  Sparkles,
  ClipboardPaste,
  ClipboardCopy,
  ExternalLink,
  Palette,
  RotateCcw,
  FileText,
  X,
} from "lucide-react";
import CarrosselSlide, {
  SlideData,
  LayoutId,
  TemaId,
  FonteHeadline,
  criarSlideVazio,
} from "./CarrosselSlide";
import UnsplashSearch from "./UnsplashSearch";
import { baixarCarrosselZIP, baixarSlideUnico } from "../lib/gerarCarrossel";
import {
  gerarPromptParaIA,
  parsearRespostaIA,
  ErroParseIA,
  chamarIADireto,
} from "../lib/formatarCarrossel";
import {
  parsearTextoColado,
  sincronizarSlides,
  ErroParseTexto,
  EXEMPLO_TEXTO_COLADO,
} from "../lib/parsearTextoColado";
import { TEMAS_DISPONIVEIS, obterTema } from "./temas";
import {
  FONTE_LABELS,
  FONTE_FAMILIAS,
  PESO_LABELS,
  CAPS_LABELS,
  type FonteId,
  type PesoFonte,
  type ModoCaps,
  type TipografiaOverride,
  type ElementoTipo,
} from "./temas/tipos";

// ============================================================
// UTILS
// ============================================================

function uid() {
  return Math.random().toString(36).substring(2, 10);
}

function novoSlide(layout: LayoutId = "tipografia_pura"): SlideData {
  return criarSlideVazio(layout, "preto");
}

// Slides iniciais vêm do tema escolhido
function slidesIniciaisDoTema(temaId: TemaId): SlideData[] {
  const tema = obterTema(temaId);
  return tema.slidesExemplo.map((s) => ({ ...s, id: uid() }));
}

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

type Status =
  | { tipo: "idle" }
  | { tipo: "exportando"; atual: number; total: number }
  | { tipo: "sucesso"; msg: string }
  | { tipo: "erro"; msg: string };

export default function CarrosselEditor() {
  const [temaId, setTemaId] = useState<TemaId>("brands_decoded_classic");
  const [slides, setSlides] = useState<SlideData[]>(() => slidesIniciaisDoTema("brands_decoded_classic"));
  const [indiceAtivo, setIndiceAtivo] = useState(0);
  const [marca, setMarca] = useState("POTENCIAL · MERCADO");
  const [status, setStatus] = useState<Status>({ tipo: "idle" });
  const [temaIA, setTemaIA] = useState("");
  const [respostaIA, setRespostaIA] = useState("");
  const [mostrarPainelIA, setMostrarPainelIA] = useState(false);
  const [mostrarPainelCola, setMostrarPainelCola] = useState(false);
  const [textoColado, setTextoColado] = useState("");
  const [promptCopiado, setPromptCopiado] = useState(false);
  const [gerandoViaAPI, setGerandoViaAPI] = useState(false);
  const [modeloIA, setModeloIA] = useState("anthropic/claude-3.5-sonnet");
  // Chave manual OpenRouter (opcional). Persiste no localStorage do usuário.
  const [chaveManualIA, setChaveManualIA] = useState<string>(() => {
    try {
      return localStorage.getItem("openrouter_api_key_manual") || "";
    } catch {
      return "";
    }
  });
  const atualizarChaveManual = useCallback((nova: string) => {
    setChaveManualIA(nova);
    try {
      if (nova.trim()) {
        localStorage.setItem("openrouter_api_key_manual", nova.trim());
      } else {
        localStorage.removeItem("openrouter_api_key_manual");
      }
    } catch {
      // localStorage indisponível — não bloqueia uso
    }
  }, []);
  const slideRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const temaAtivo = useMemo(() => obterTema(temaId), [temaId]);
  const slideAtivo = slides[indiceAtivo];

  // Troca de tema: ao trocar, ajusta os slides pra usarem layouts válidos
  const trocarTema = useCallback((novoId: TemaId) => {
    const novoTema = obterTema(novoId);
    const layoutsValidos = novoTema.layouts.map((l) => l.id);
    setTemaId(novoId);
    // Mapeia layouts inválidos pro primeiro layout do novo tema
    setSlides((lista) =>
      lista.map((s) => ({
        ...s,
        layout: layoutsValidos.includes(s.layout) ? s.layout : novoTema.layouts[0].id,
      }))
    );
  }, []);

  const resetarParaExemplos = () => {
    if (!confirm("Isso vai substituir todos os slides pelos exemplos do tema atual. Continuar?")) return;
    setSlides(slidesIniciaisDoTema(temaId));
    setIndiceAtivo(0);
  };

  // ====== AÇÕES DE SLIDES ======
  const atualizarSlide = useCallback(
    (patch: Partial<SlideData>) => {
      setSlides((lista) =>
        lista.map((s, i) => (i === indiceAtivo ? { ...s, ...patch } : s))
      );
    },
    [indiceAtivo]
  );

  const adicionarSlide = (layout?: LayoutId) => {
    const layoutFinal = layout || temaAtivo.layouts[0].id;
    setSlides((lista) => {
      const novo = novoSlide(layoutFinal);
      const antes = lista.slice(0, indiceAtivo + 1);
      const depois = lista.slice(indiceAtivo + 1);
      return [...antes, novo, ...depois];
    });
    setIndiceAtivo((i) => i + 1);
  };

  const removerSlide = (i: number) => {
    if (slides.length <= 1) return;
    setSlides((lista) => lista.filter((_, idx) => idx !== i));
    setIndiceAtivo((cur) => {
      if (cur === i) return Math.max(0, cur - 1);
      if (cur > i) return cur - 1;
      return cur;
    });
  };

  const duplicarSlide = (i: number) => {
    setSlides((lista) => {
      const copia = { ...lista[i], id: uid() };
      return [...lista.slice(0, i + 1), copia, ...lista.slice(i + 1)];
    });
    setIndiceAtivo(i + 1);
  };

  const moverSlide = (de: number, para: number) => {
    if (para < 0 || para >= slides.length) return;
    setSlides((lista) => {
      const copia = [...lista];
      const [item] = copia.splice(de, 1);
      copia.splice(para, 0, item);
      return copia;
    });
    setIndiceAtivo(para);
  };

  // ====== FLUXO DE IA EXTERNA (copiar prompt + colar resposta) ======
  const promptGerado = useMemo(() => {
    if (!temaIA.trim()) return "";
    return gerarPromptParaIA({
      tema: temaIA,
      numeroSlides: slides.length,
      marca,
      temaVisual: temaAtivo,
    });
  }, [temaIA, slides.length, marca, temaAtivo]);

  const copiarPrompt = async () => {
    if (!promptGerado) return;
    try {
      await navigator.clipboard.writeText(promptGerado);
      setPromptCopiado(true);
      setTimeout(() => setPromptCopiado(false), 2500);
    } catch {
      setStatus({
        tipo: "erro",
        msg: "Não foi possível copiar automaticamente. Selecione o texto do prompt e copie manualmente.",
      });
    }
  };

  const formatarResposta = () => {
    try {
      const novos = parsearRespostaIA(respostaIA);
      // Preserva fotos já escolhidas nos slides existentes quando possível
      const comFotos: SlideData[] = novos.map((n, i) => ({
        ...n,
        fotoUrl: slides[i]?.fotoUrl || "",
        fotoUrl2: slides[i]?.fotoUrl2 || "",
      }));
      setSlides(comFotos);
      setIndiceAtivo(0);
      setRespostaIA("");
      setMostrarPainelIA(false);
      setStatus({
        tipo: "sucesso",
        msg: `${novos.length} slides formatados com sucesso!`,
      });
      setTimeout(() => setStatus({ tipo: "idle" }), 3000);
    } catch (err: any) {
      const msg =
        err instanceof ErroParseIA
          ? err.message
          : err?.message || "Erro ao processar a resposta.";
      setStatus({ tipo: "erro", msg });
    }
  };

  // ====== PROCESSAR TEXTO COLADO (modo offline, sem IA) ======
  const processarTextoColado = () => {
    if (!textoColado.trim()) {
      setStatus({ tipo: "erro", msg: "Cole algum conteúdo no campo." });
      return;
    }
    try {
      const { slides: novosSlides, avisos } = parsearTextoColado(textoColado);
      // Sincroniza com slides atuais (preserva fotos)
      const slidesFinais = sincronizarSlides(slides, novosSlides);
      setSlides(slidesFinais);
      setIndiceAtivo(0);
      setMostrarPainelCola(false);
      setTextoColado("");

      const numAdicionados = Math.max(0, novosSlides.length - slides.length);
      const numRemovidos = Math.max(0, slides.length - novosSlides.length);

      let msg = `${novosSlides.length} ${novosSlides.length === 1 ? "slide aplicado" : "slides aplicados"}`;
      if (numAdicionados > 0) msg += ` (+${numAdicionados} novos)`;
      if (numRemovidos > 0) msg += ` (-${numRemovidos} removidos)`;
      if (avisos.length > 0) msg += ` · ${avisos.length} ${avisos.length === 1 ? "aviso" : "avisos"}`;

      setStatus({ tipo: "sucesso", msg });
      setTimeout(() => setStatus({ tipo: "idle" }), 5000);

      // Mostra avisos no console pra debug
      if (avisos.length > 0) {
        console.warn("Avisos do parser:", avisos);
      }
    } catch (err: any) {
      const msg =
        err instanceof ErroParseTexto
          ? err.message
          : err?.message || "Erro ao processar o texto.";
      setStatus({ tipo: "erro", msg });
    }
  };

  // ====== GERAR VIA API DIRETA (Vercel Function + OpenRouter) ======
  const gerarViaAPI = async () => {
    if (!temaIA.trim()) {
      setStatus({ tipo: "erro", msg: "Descreva o tema antes de gerar." });
      return;
    }
    setGerandoViaAPI(true);
    try {
      const resultado = await chamarIADireto({
        tema: temaIA,
        numeroSlides: slides.length,
        marca,
        temaVisual: temaAtivo,
        modelo: modeloIA,
        apiKey: chaveManualIA.trim() || undefined,
      });
      // Preserva fotos existentes
      const comFotos: SlideData[] = resultado.slides.map((n, i) => ({
        ...n,
        fotoUrl: slides[i]?.fotoUrl || "",
        fotoUrl2: slides[i]?.fotoUrl2 || "",
      }));
      setSlides(comFotos);
      setIndiceAtivo(0);
      setRespostaIA("");
      setMostrarPainelIA(false);
      setStatus({
        tipo: "sucesso",
        msg: `${resultado.slides.length} slides gerados via ${resultado.modelo.split("/").pop()}!`,
      });
      setTimeout(() => setStatus({ tipo: "idle" }), 4000);
    } catch (err: any) {
      const msg =
        err instanceof ErroParseIA
          ? err.message
          : err?.message || "Erro ao chamar a API.";
      setStatus({ tipo: "erro", msg });
    } finally {
      setGerandoViaAPI(false);
    }
  };

  // ====== EXPORT ======
  const nomeArquivoZip = useMemo(() => {
    const primeira = slides[0]?.headline || "carrossel";
    const slug = primeira
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40);
    return `carrossel-${slug || "novo"}`;
  }, [slides]);

  const exportarTudo = async () => {
    setStatus({ tipo: "exportando", atual: 0, total: slides.length });
    const refs = slides
      .map((s, i) => {
        const element = slideRefs.current.get(s.id);
        return element ? { index: i, element } : null;
      })
      .filter((r): r is { index: number; element: HTMLDivElement } => r !== null);

    if (refs.length !== slides.length) {
      setStatus({
        tipo: "erro",
        msg: "Alguns slides não estão prontos ainda. Tente em 1-2 segundos.",
      });
      return;
    }

    await baixarCarrosselZIP({
      slides: refs,
      nomeBase: nomeArquivoZip,
      onProgress: (atual, total) => setStatus({ tipo: "exportando", atual, total }),
      onSuccess: () => {
        setStatus({ tipo: "sucesso", msg: "ZIP baixado com sucesso!" });
        setTimeout(() => setStatus({ tipo: "idle" }), 3000);
      },
      onError: (err) => setStatus({ tipo: "erro", msg: err.message }),
    });
  };

  const exportarSlideAtual = async () => {
    const element = slideRefs.current.get(slideAtivo.id);
    if (!element) {
      setStatus({ tipo: "erro", msg: "Slide não está pronto. Aguarde." });
      return;
    }
    setStatus({ tipo: "exportando", atual: 1, total: 1 });
    const nome = `${nomeArquivoZip}-slide-${String(indiceAtivo + 1).padStart(2, "0")}`;
    const ok = await baixarSlideUnico(element, nome);
    if (ok) {
      setStatus({ tipo: "sucesso", msg: "Slide baixado!" });
      setTimeout(() => setStatus({ tipo: "idle" }), 2500);
    } else {
      setStatus({ tipo: "erro", msg: "Erro ao gerar PNG." });
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#0f0f0f]">
      <div className="max-w-[1600px] mx-auto px-6 py-6 space-y-6">
        {/* Status bar */}
        <StatusBar status={status} onDismiss={() => setStatus({ tipo: "idle" })} />

        {/* Top actions */}
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <input
                type="text"
                value={marca}
                onChange={(e) => setMarca(e.target.value)}
                className="bg-[#1a1a1a] border border-gray-800 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFC528] font-mono tracking-wide"
                placeholder="MARCA · SEÇÃO"
              />
              <p className="text-[10px] text-gray-600 mt-1 uppercase tracking-wider">
                Aparece no topo de cada slide
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                setMostrarPainelCola((v) => !v);
                if (!mostrarPainelCola) setMostrarPainelIA(false);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all ${
                mostrarPainelCola
                  ? "bg-[#FFC528] text-black"
                  : "bg-[#1a1a1a] border border-gray-800 text-gray-300 hover:border-[#FFC528] hover:text-white"
              }`}
              title="Cole texto pronto e o app organiza nos slides"
            >
              <FileText size={16} />
              Colar conteúdo
            </button>
            <button
              onClick={() => {
                setMostrarPainelIA((v) => !v);
                if (!mostrarPainelIA) setMostrarPainelCola(false);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all ${
                mostrarPainelIA
                  ? "bg-[#FFC528] text-black"
                  : "bg-[#1a1a1a] border border-gray-800 text-gray-300 hover:border-[#FFC528] hover:text-white"
              }`}
            >
              <Sparkles size={16} />
              Formatar com IA
            </button>
            <button
              onClick={exportarSlideAtual}
              disabled={status.tipo === "exportando"}
              className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-[#1a1a1a] border border-gray-800 text-gray-300 hover:border-[#FFC528] hover:text-white transition-all disabled:opacity-40"
            >
              <Download size={16} />
              Baixar slide atual
            </button>
            <button
              onClick={exportarTudo}
              disabled={status.tipo === "exportando"}
              className="flex items-center gap-2 px-5 py-2 rounded-md text-sm font-bold bg-[#FFC528] text-black hover:bg-[#ffd55a] transition-all disabled:opacity-40 shadow-md"
            >
              {status.tipo === "exportando" ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Download size={16} />
              )}
              Baixar ZIP ({slides.length} slides)
            </button>
          </div>
        </div>

        {/* Painel de IA */}
        {mostrarPainelIA && (
          <PainelIA
            tema={temaIA}
            onTemaChange={setTemaIA}
            numSlides={slides.length}
            prompt={promptGerado}
            onCopiarPrompt={copiarPrompt}
            promptCopiado={promptCopiado}
            resposta={respostaIA}
            onRespostaChange={setRespostaIA}
            onFormatar={formatarResposta}
            onGerarViaAPI={gerarViaAPI}
            gerandoViaAPI={gerandoViaAPI}
            modeloIA={modeloIA}
            onModeloChange={setModeloIA}
            chaveManualIA={chaveManualIA}
            onChaveManualChange={atualizarChaveManual}
          />
        )}

        {/* Painel de Cola de Texto */}
        {mostrarPainelCola && (
          <PainelCola
            texto={textoColado}
            onTextoChange={setTextoColado}
            onAplicar={processarTextoColado}
            onFechar={() => setMostrarPainelCola(false)}
          />
        )}

        {/* Grid principal: lista de slides | preview grande | painel edição */}
        <div className="grid grid-cols-12 gap-4">
          {/* COLUNA 1 — Lista de slides */}
          <aside className="col-span-12 md:col-span-2">
            <div className="bg-[#141414] rounded-xl border border-gray-800 p-3 sticky top-24">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Slides ({slides.length})
                </h3>
              </div>

              <div className="space-y-1.5 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
                {slides.map((s, i) => (
                  <MiniSlide
                    key={s.id}
                    slide={s}
                    indice={i}
                    total={slides.length}
                    ativo={i === indiceAtivo}
                    temaId={temaId}
                    nomeLayout={temaAtivo.layouts.find(l => l.id === s.layout)?.nome || s.layout}
                    onClick={() => setIndiceAtivo(i)}
                    onRemover={() => removerSlide(i)}
                    onDuplicar={() => duplicarSlide(i)}
                    onMoverCima={() => moverSlide(i, i - 1)}
                    onMoverBaixo={() => moverSlide(i, i + 1)}
                    podeRemover={slides.length > 1}
                  />
                ))}
              </div>

              <button
                onClick={() => adicionarSlide()}
                className="w-full mt-3 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-bold bg-[#1f1f1f] border border-gray-800 text-gray-300 hover:bg-[#FFC528] hover:text-black hover:border-[#FFC528] transition-all"
              >
                <Plus size={14} />
                Novo slide
              </button>
            </div>
          </aside>

          {/* COLUNA 2 — Preview grande */}
          <section className="col-span-12 md:col-span-6">
            <div className="bg-[#141414] rounded-xl border border-gray-800 p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Preview · Slide {indiceAtivo + 1} de {slides.length}
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIndiceAtivo((i) => Math.max(0, i - 1))}
                    disabled={indiceAtivo === 0}
                    className="p-1.5 rounded-md bg-[#1f1f1f] text-gray-400 hover:text-white hover:bg-[#2a2a2a] disabled:opacity-30"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => setIndiceAtivo((i) => Math.min(slides.length - 1, i + 1))}
                    disabled={indiceAtivo === slides.length - 1}
                    className="p-1.5 rounded-md bg-[#1f1f1f] text-gray-400 hover:text-white hover:bg-[#2a2a2a] disabled:opacity-30"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              {/* Preview visível do slide ativo */}
              <div className="flex justify-center">
                <div
                  style={{
                    width: 540,
                    height: 675,
                    overflow: "hidden",
                    borderRadius: 8,
                    boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
                  }}
                >
                  <CarrosselSlide
                    slide={slideAtivo}
                    index={indiceAtivo}
                    total={slides.length}
                    marca={marca}
                    temaId={temaId}
                    escala={0.5}
                  />
                </div>
              </div>

              <p className="text-center text-[10px] text-gray-600 mt-3 font-mono">
                Saída: 1080 × 1350 px (Instagram 4:5)
              </p>
            </div>
          </section>

          {/* COLUNA 3 — Painel de edição */}
          <aside className="col-span-12 md:col-span-4">
            <div className="bg-[#141414] rounded-xl border border-gray-800 p-4 space-y-4 sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto">
              <PainelEdicao
                slide={slideAtivo}
                onChange={atualizarSlide}
                temaId={temaId}
                onTrocarTema={trocarTema}
                temaAtivo={temaAtivo}
              />
            </div>
          </aside>
        </div>

        {/* SLIDES OCULTOS EM ESCALA REAL (só pra captura do html-to-image) */}
        <div
          style={{
            position: "fixed",
            left: -10000,
            top: 0,
            pointerEvents: "none",
            opacity: 0,
          }}
          aria-hidden="true"
        >
          {slides.map((s, i) => (
            <div
              key={s.id}
              ref={(el) => {
                if (el) slideRefs.current.set(s.id, el);
                else slideRefs.current.delete(s.id);
              }}
            >
              <CarrosselSlide
                slide={s}
                index={i}
                total={slides.length}
                marca={marca}
                    temaId={temaId}
                escalaReal
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// STATUS BAR
// ============================================================
function StatusBar({ status, onDismiss }: { status: Status; onDismiss: () => void }) {
  if (status.tipo === "idle") return null;

  const configs = {
    exportando: {
      cor: "bg-[#FFC528]/10 border-[#FFC528]/40 text-[#FFC528]",
      icone: <Loader2 size={16} className="animate-spin" />,
      texto:
        status.tipo === "exportando"
          ? `Gerando slide ${status.atual} de ${status.total}...`
          : "",
    },
    sucesso: {
      cor: "bg-emerald-500/10 border-emerald-500/40 text-emerald-400",
      icone: <CheckCircle2 size={16} />,
      texto: status.tipo === "sucesso" ? status.msg : "",
    },
    erro: {
      cor: "bg-red-500/10 border-red-500/40 text-red-400",
      icone: <AlertCircle size={16} />,
      texto: status.tipo === "erro" ? status.msg : "",
    },
    idle: { cor: "", icone: null, texto: "" },
  };

  const cfg = configs[status.tipo];
  return (
    <div
      className={`flex items-center justify-between gap-3 border rounded-lg px-4 py-2.5 text-sm ${cfg.cor}`}
      role="status"
    >
      <div className="flex items-center gap-2 font-medium">
        {cfg.icone}
        <span>{cfg.texto}</span>
      </div>
      {status.tipo !== "exportando" && (
        <button onClick={onDismiss} className="text-xs opacity-70 hover:opacity-100">
          ✕
        </button>
      )}
    </div>
  );
}

// ============================================================
// MINI SLIDE (lista lateral)
// ============================================================
function MiniSlide({
  slide,
  indice,
  total,
  ativo,
  temaId,
  nomeLayout,
  onClick,
  onRemover,
  onDuplicar,
  onMoverCima,
  onMoverBaixo,
  podeRemover,
}: {
  slide: SlideData;
  indice: number;
  total: number;
  ativo: boolean;
  temaId: TemaId;
  nomeLayout: string;
  onClick: () => void;
  onRemover: () => void;
  onDuplicar: () => void;
  onMoverCima: () => void;
  onMoverBaixo: () => void;
  podeRemover: boolean;
}) {
  return (
    <div
      className={`group relative rounded-md border-2 transition-all overflow-hidden ${
        ativo
          ? "border-[#FFC528] bg-[#1f1f1f]"
          : "border-transparent bg-[#0f0f0f] hover:border-gray-700"
      }`}
    >
      <button
        onClick={onClick}
        className="w-full flex items-stretch gap-2 p-1.5 text-left"
        aria-label={`Slide ${indice + 1}`}
      >
        {/* Mini preview em miniatura real (escala 0.07) */}
        <div
          style={{
            width: 54,
            height: 67,
            overflow: "hidden",
            borderRadius: 4,
            flexShrink: 0,
            background: "#000",
          }}
        >
          <CarrosselSlide
            slide={slide}
            index={indice}
            total={total}
            marca=""
            temaId={temaId}
            escala={0.05}
          />
        </div>
        <div className="flex-1 min-w-0 py-0.5">
          <div className="text-xs font-bold text-white truncate">
            {String(indice + 1).padStart(2, "0")} · {nomeLayout}
          </div>
          <div className="text-[10px] text-gray-500 truncate leading-tight">
            {slide.headline.replace(/\n/g, " ") || slide.kicker || "Vazio"}
          </div>
        </div>
      </button>

      {/* Ações */}
      <div className="absolute right-1 top-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <IconBtn onClick={onMoverCima} disabled={indice === 0} title="Mover para cima">
          ↑
        </IconBtn>
        <IconBtn onClick={onMoverBaixo} disabled={indice === total - 1} title="Mover para baixo">
          ↓
        </IconBtn>
        <IconBtn onClick={onDuplicar} title="Duplicar">
          <Copy size={10} />
        </IconBtn>
        <IconBtn onClick={onRemover} disabled={!podeRemover} title="Remover" vermelho>
          <Trash2 size={10} />
        </IconBtn>
      </div>
    </div>
  );
}

function IconBtn({
  onClick,
  children,
  disabled,
  title,
  vermelho,
}: {
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  title: string;
  vermelho?: boolean;
}) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      disabled={disabled}
      title={title}
      className={`w-5 h-5 flex items-center justify-center rounded bg-black/70 text-white text-[10px] hover:bg-black disabled:opacity-30 ${
        vermelho ? "hover:bg-red-600" : ""
      }`}
    >
      {children}
    </button>
  );
}

// ============================================================
// PAINEL DE COLA DE TEXTO — formato rotulado, sem IA
// ============================================================
function PainelCola({
  texto,
  onTextoChange,
  onAplicar,
  onFechar,
}: {
  texto: string;
  onTextoChange: (v: string) => void;
  onAplicar: () => void;
  onFechar: () => void;
}) {
  const [mostrarExemplo, setMostrarExemplo] = useState(false);
  const numLinhas = texto.split("\n").length;
  const numSlidesEstimado = (() => {
    if (!texto.trim()) return 0;
    // Conta separadores explícitos
    const porSlideMarker = (texto.match(/^[\s]*(?:={3,}\s*)?(?:SLIDE)\s*(?:[#:.]?\s*\d+)?(?:\s*={3,})?[\s]*$/gim) || []).length;
    if (porSlideMarker > 0) return porSlideMarker;
    // Conta divisores ---
    const porDivisor = (texto.match(/^[\s]*-{3,}[\s]*$/gm) || []).length;
    if (porDivisor > 0) return porDivisor + 1;
    // Conta blocos separados por linha em branco dupla
    const porLinhaBranca = texto.split(/\n\s*\n\s*\n+/).filter(b => b.trim()).length;
    if (porLinhaBranca > 1) return porLinhaBranca;
    // Conta blocos por linha em branco simples (se cada um tem KICKER/HEADLINE)
    const blocos = texto.split(/\n\s*\n/).filter(b => b.trim());
    return blocos.length || 1;
  })();

  return (
    <div className="bg-gradient-to-br from-[#1a1a1a] to-[#141414] border border-[#FFC528]/30 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-[#FFC528]">
          <FileText size={18} />
          <h3 className="text-sm font-bold uppercase tracking-wider">
            Colar conteúdo
          </h3>
          <span className="text-[10px] text-gray-500 normal-case font-normal">
            · sem usar IA, organiza o texto direto nos slides
          </span>
        </div>
        <button
          onClick={onFechar}
          className="text-gray-500 hover:text-white transition-colors"
          title="Fechar"
        >
          <X size={18} />
        </button>
      </div>

      <p className="text-xs text-gray-400 leading-relaxed">
        Cole texto rotulado (formato <code className="text-[#FFC528]">KICKER:</code>, <code className="text-[#FFC528]">HEADLINE:</code>, <code className="text-[#FFC528]">CORPO:</code>...). 
        Separe slides com linha em branco dupla, <code className="text-[#FFC528]">---</code>, ou marcadores <code className="text-[#FFC528]">SLIDE 1</code>, <code className="text-[#FFC528]">SLIDE 2</code>.
        O número de slides do app é ajustado automaticamente.
      </p>

      {/* Stats */}
      <div className="flex items-center gap-4 text-[11px] text-gray-500">
        <span>📝 {numLinhas} {numLinhas === 1 ? "linha" : "linhas"}</span>
        <span>🎴 {numSlidesEstimado} {numSlidesEstimado === 1 ? "slide detectado" : "slides detectados"}</span>
        <button
          onClick={() => setMostrarExemplo((v) => !v)}
          className="ml-auto text-[#FFC528] hover:underline"
        >
          {mostrarExemplo ? "Esconder exemplo" : "Ver exemplo de formato"}
        </button>
      </div>

      {/* Exemplo */}
      {mostrarExemplo && (
        <div className="bg-[#0f0f0f] border border-gray-800 rounded-md p-4 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">
              Formato esperado
            </span>
            <button
              onClick={() => onTextoChange(EXEMPLO_TEXTO_COLADO)}
              className="text-[10px] text-[#FFC528] hover:underline"
            >
              Usar este exemplo
            </button>
          </div>
          <pre className="text-[11px] text-gray-400 font-mono whitespace-pre-wrap leading-relaxed">
{EXEMPLO_TEXTO_COLADO}
          </pre>
          <div className="text-[10px] text-gray-600 pt-2 border-t border-gray-800 space-y-1">
            <div><strong className="text-gray-400">Rótulos aceitos:</strong> KICKER, HEADLINE/TITULO, CORPO/TEXTO, DESTAQUE, NUMERO, LEGENDA, PILL/CTA, LAYOUT, CORFUNDO/FUNDO</div>
            <div><strong className="text-gray-400">Cores de fundo:</strong> preto, amarelo, bege, branco</div>
            <div><strong className="text-gray-400">Multi-linha:</strong> se um campo continua na linha de baixo, basta não começar com outro RÓTULO:</div>
          </div>
        </div>
      )}

      {/* Textarea */}
      <textarea
        value={texto}
        onChange={(e) => onTextoChange(e.target.value)}
        placeholder={`Cole seu conteúdo aqui. Por exemplo:

KICKER: TESE Nº 1
HEADLINE: Por décadas, algo foi assunto de poucos.
CORPO: Aqui você desenvolve o tema...
DESTAQUE: E então aconteceu a virada.

---

KICKER: O DADO
HEADLINE: +32%
CORPO: Justifique o número.`}
        rows={14}
        className="w-full bg-[#0f0f0f] border border-gray-800 rounded-md px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#FFC528] resize-y font-mono"
        spellCheck={false}
      />

      {/* Ações */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <p className="text-[10px] text-gray-600 flex-1 min-w-0">
          💡 Os slides existentes vão ser{" "}
          <strong className="text-gray-400">substituídos</strong>, mas as fotos
          já carregadas são <strong className="text-gray-400">preservadas</strong>.
        </p>
        <button
          onClick={() => onTextoChange("")}
          disabled={!texto}
          className="text-[11px] text-gray-500 hover:text-white px-3 py-2 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Limpar
        </button>
        <button
          onClick={onAplicar}
          disabled={!texto.trim()}
          className="flex items-center gap-2 px-5 py-2 rounded-md text-sm font-bold bg-[#FFC528] text-black hover:bg-[#ffd55a] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <CheckCircle2 size={16} />
          Aplicar {numSlidesEstimado > 0 ? `(${numSlidesEstimado} ${numSlidesEstimado === 1 ? "slide" : "slides"})` : ""}
        </button>
      </div>
    </div>
  );
}

// ============================================================
// PAINEL DE IA — API direta (Vercel) OU copiar prompt + colar
// ============================================================
function PainelIA({
  tema,
  onTemaChange,
  numSlides,
  prompt,
  onCopiarPrompt,
  promptCopiado,
  resposta,
  onRespostaChange,
  onFormatar,
  onGerarViaAPI,
  gerandoViaAPI,
  modeloIA,
  onModeloChange,
  chaveManualIA,
  onChaveManualChange,
}: {
  tema: string;
  onTemaChange: (v: string) => void;
  numSlides: number;
  prompt: string;
  onCopiarPrompt: () => void;
  promptCopiado: boolean;
  resposta: string;
  onRespostaChange: (v: string) => void;
  onFormatar: () => void;
  onGerarViaAPI: () => void;
  gerandoViaAPI: boolean;
  modeloIA: string;
  onModeloChange: (m: string) => void;
  chaveManualIA: string;
  onChaveManualChange: (v: string) => void;
}) {
  const temPrompt = Boolean(prompt);
  const temResposta = Boolean(resposta.trim());
  const [modoAvancado, setModoAvancado] = useState(false);
  const [mostrarChave, setMostrarChave] = useState(false);
  const [expandirChaveManual, setExpandirChaveManual] = useState(Boolean(chaveManualIA));

  return (
    <div className="bg-gradient-to-br from-[#1a1a1a] to-[#141414] border border-[#FFC528]/30 rounded-xl p-5 space-y-5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-[#FFC528]">
          <Sparkles size={18} />
          <h3 className="text-sm font-bold uppercase tracking-wider">
            Gerar com IA
          </h3>
        </div>
        <button
          onClick={() => setModoAvancado((v) => !v)}
          className="text-[10px] text-gray-500 hover:text-[#FFC528] underline"
        >
          {modoAvancado ? "Voltar ao modo simples" : "Modo avançado (copiar/colar)"}
        </button>
      </div>

      <p className="text-xs text-gray-400 leading-relaxed">
        Descreva o tema e clique em "Gerar" — a IA escreve o carrossel completo.
        Usa o endpoint <code className="text-[#FFC528] font-mono">/api/ia</code>{" "}
        (Vercel + OpenRouter). Se preferir usar uma IA grátis manualmente, ative o modo avançado.
      </p>

      {/* ============ TEMA ============ */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-[#FFC528] text-black text-xs font-black flex items-center justify-center">
            1
          </div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
            Descreva o tema
          </h4>
        </div>

        <textarea
          value={tema}
          onChange={(e) => onTemaChange(e.target.value)}
          placeholder="Ex: A psicologia por trás de por que brasileiros não investem — foco em provocar tomadores de decisão do mercado financeiro"
          rows={3}
          className="w-full bg-[#0f0f0f] border border-gray-800 rounded-md px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#FFC528] resize-none"
        />
      </div>

      {/* ============ MODO SIMPLES: GERAR VIA API ============ */}
      {!modoAvancado && (
        <div className="space-y-3 pt-2 border-t border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#FFC528] text-black text-xs font-black flex items-center justify-center">
              2
            </div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Escolha o modelo e gere
            </h4>
          </div>

          <select
            value={modeloIA}
            onChange={(e) => onModeloChange(e.target.value)}
            className="w-full bg-[#0f0f0f] border border-gray-800 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFC528]"
          >
            <optgroup label="💎 Premium (melhor qualidade)">
              <option value="anthropic/claude-3.5-sonnet">Claude 3.5 Sonnet (recomendado)</option>
              <option value="openai/gpt-4o">GPT-4o</option>
              <option value="anthropic/claude-3.5-haiku">Claude 3.5 Haiku (barato e ótimo)</option>
              <option value="openai/gpt-4o-mini">GPT-4o mini (barato)</option>
              <option value="google/gemini-flash-1.5">Gemini Flash 1.5 (rápido)</option>
              <option value="deepseek/deepseek-chat">DeepSeek Chat</option>
            </optgroup>
            <optgroup label="🆓 Grátis (tier gratuito OpenRouter)">
              <option value="deepseek/deepseek-r1:free">DeepSeek R1 (grátis · qualidade alta)</option>
              <option value="meta-llama/llama-3.3-70b-instruct:free">Llama 3.3 70B (grátis)</option>
              <option value="qwen/qwen-2.5-72b-instruct:free">Qwen 2.5 72B (grátis)</option>
              <option value="mistralai/mistral-nemo:free">Mistral Nemo (grátis · leve)</option>
              <option value="google/gemma-2-9b-it:free">Gemma 2 9B (grátis · leve)</option>
            </optgroup>
          </select>

          {/* ====== CHAVE MANUAL (toggle) ====== */}
          <div className="border border-gray-800 rounded-md overflow-hidden">
            <button
              onClick={() => setExpandirChaveManual((v) => !v)}
              className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-[#0f0f0f] hover:bg-[#141414] transition-colors text-xs"
            >
              <span className="flex items-center gap-2 text-gray-400">
                <span className="text-[#FFC528]">🔑</span>
                <span className="font-bold uppercase tracking-wider">
                  Chave manual (opcional)
                </span>
                {chaveManualIA && (
                  <span className="bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded text-[9px] font-bold">
                    ATIVA
                  </span>
                )}
              </span>
              <span className="text-gray-600 text-[10px]">
                {expandirChaveManual ? "▲ ocultar" : "▼ expandir"}
              </span>
            </button>

            {expandirChaveManual && (
              <div className="p-3 bg-[#0a0a0a] border-t border-gray-800 space-y-2">
                <p className="text-[10px] text-gray-500 leading-relaxed">
                  Cole sua chave do OpenRouter aqui se quiser usar a sua conta em vez
                  da configurada na Vercel. A chave fica salva no localStorage do seu
                  navegador (não vai pro repositório, log ou servidor além do OpenRouter).
                  Ideal pra escolher o modelo grátis sem rate-limit ou usar créditos próprios.
                </p>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type={mostrarChave ? "text" : "password"}
                      value={chaveManualIA}
                      onChange={(e) => onChaveManualChange(e.target.value)}
                      placeholder="sk-or-v1-..."
                      className="w-full bg-[#0f0f0f] border border-gray-800 rounded-md px-3 py-2 pr-9 text-xs text-white placeholder:text-gray-700 focus:outline-none focus:border-[#FFC528] font-mono"
                    />
                    <button
                      onClick={() => setMostrarChave((v) => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#FFC528] text-[10px]"
                      title={mostrarChave ? "Ocultar" : "Mostrar"}
                    >
                      {mostrarChave ? "🙈" : "👁️"}
                    </button>
                  </div>
                  {chaveManualIA && (
                    <button
                      onClick={() => onChaveManualChange("")}
                      className="px-3 py-2 bg-[#1a0f0f] border border-red-900/40 rounded-md text-[10px] text-red-400 hover:bg-red-900/20 hover:border-red-700 transition-colors font-bold uppercase tracking-wider"
                      title="Remover chave do localStorage"
                    >
                      Limpar
                    </button>
                  )}
                </div>
                <a
                  href="https://openrouter.ai/keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-[#FFC528] hover:underline inline-flex items-center gap-1"
                >
                  → Pegar/criar chave no OpenRouter
                </a>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-3 flex-wrap">
            <p className="text-[10px] text-gray-600 flex-1 min-w-0">
              {chaveManualIA
                ? "Usando sua chave manual (do navegador)"
                : <>Usando <code className="text-[#FFC528]">OPENROUTER_API_KEY</code> da Vercel</>}
            </p>
            <button
              onClick={onGerarViaAPI}
              disabled={!tema.trim() || gerandoViaAPI}
              className="flex items-center gap-2 px-5 py-2 rounded-md text-sm font-bold bg-[#FFC528] text-black hover:bg-[#ffd55a] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {gerandoViaAPI ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <Wand2 size={16} />
                  Gerar {numSlides} slides
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ============ MODO AVANÇADO: copiar prompt + colar resposta ============ */}
      {modoAvancado && (
        <>
      {/* ============ ETAPA 1: TEMA + PROMPT ============ */}
      <div className="space-y-3 pt-2 border-t border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-[#FFC528] text-black text-xs font-black flex items-center justify-center">
            1
          </div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
            Descreva o tema do carrossel
          </h4>
        </div>

        <textarea
          value={tema}
          onChange={(e) => onTemaChange(e.target.value)}
          placeholder="Ex: A psicologia por trás de por que brasileiros não investem — foco em provocar tomadores de decisão do mercado financeiro"
          rows={3}
          className="w-full bg-[#0f0f0f] border border-gray-800 rounded-md px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#FFC528] resize-none"
        />
      </div>

      {/* ============ ETAPA 2: COPIAR PROMPT ============ */}
      {temPrompt && (
        <div className="space-y-3 pt-4 border-t border-gray-800">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#FFC528] text-black text-xs font-black flex items-center justify-center">
                2
              </div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Copie o prompt e cole em uma IA grátis
              </h4>
            </div>

            <button
              onClick={onCopiarPrompt}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                promptCopiado
                  ? "bg-emerald-500 text-black"
                  : "bg-[#FFC528] text-black hover:bg-[#ffd55a]"
              }`}
            >
              {promptCopiado ? (
                <>
                  <CheckCircle2 size={12} />
                  Copiado!
                </>
              ) : (
                <>
                  <ClipboardCopy size={12} />
                  Copiar prompt
                </>
              )}
            </button>
          </div>

          {/* Preview do prompt em caixa com scroll */}
          <div className="relative">
            <textarea
              readOnly
              value={prompt}
              rows={6}
              className="w-full bg-[#0a0a0a] border border-gray-800 rounded-md px-3 py-2 text-[11px] text-gray-400 font-mono resize-none focus:outline-none focus:border-[#FFC528]"
              onFocus={(e) => e.currentTarget.select()}
            />
            <p className="text-[10px] text-gray-600 mt-2">
              {prompt.length} caracteres · vai gerar {numSlides} slides
            </p>
          </div>

          {/* Links rápidos pras IAs */}
          <div className="flex flex-wrap gap-2">
            <LinkIA
              href="https://claude.ai/new"
              nome="Claude"
              desc="Melhor qualidade editorial"
            />
            <LinkIA
              href="https://chatgpt.com/"
              nome="ChatGPT"
              desc="Mais disponibilidade"
            />
            <LinkIA
              href="https://gemini.google.com/app"
              nome="Gemini"
              desc="Google, grátis"
            />
          </div>
        </div>
      )}

      {/* ============ ETAPA 3: COLAR RESPOSTA ============ */}
      {temPrompt && (
        <div className="space-y-3 pt-4 border-t border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#FFC528] text-black text-xs font-black flex items-center justify-center">
              3
            </div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Cole a resposta da IA aqui
            </h4>
          </div>

          <textarea
            value={resposta}
            onChange={(e) => onRespostaChange(e.target.value)}
            placeholder='A IA vai responder com um array JSON começando com [ e terminando com ]. Cole a resposta inteira aqui — o app cuida do resto.'
            rows={6}
            className="w-full bg-[#0f0f0f] border border-gray-800 rounded-md px-3 py-2 text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-[#FFC528] resize-none font-mono"
          />

          <div className="flex items-center justify-between gap-3 flex-wrap">
            <p className="text-[10px] text-gray-600 flex-1 min-w-0">
              Aceita resposta com ou sem cercas ```json — o parser é tolerante.
            </p>
            <button
              onClick={onFormatar}
              disabled={!temResposta}
              className="flex items-center gap-2 px-5 py-2 rounded-md text-sm font-bold bg-[#FFC528] text-black hover:bg-[#ffd55a] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Wand2 size={16} />
              Formatar {numSlides} slides
            </button>
          </div>
        </div>
      )}
        </>
      )}

      <p className="text-[10px] text-gray-600 pt-2 border-t border-gray-800">
        💡 Dica: a resposta da IA substitui os textos atuais de todos os slides,
        mas preserva as fotos já escolhidas. Você pode editar tudo manualmente
        depois.
      </p>
    </div>
  );
}

function LinkIA({ href, nome, desc }: { href: string; nome: string; desc: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 px-3 py-2 rounded-md bg-[#0f0f0f] border border-gray-800 hover:border-[#FFC528] hover:bg-[#1a1a1a] transition-all group"
    >
      <ExternalLink size={12} className="text-gray-500 group-hover:text-[#FFC528]" />
      <div>
        <div className="text-xs font-bold text-white">{nome}</div>
        <div className="text-[10px] text-gray-500">{desc}</div>
      </div>
    </a>
  );
}

// ============================================================
// PAINEL DE EDIÇÃO (direita)
// ============================================================
function PainelEdicao({
  slide,
  onChange,
  temaId,
  onTrocarTema,
  temaAtivo,
}: {
  slide: SlideData;
  onChange: (patch: Partial<SlideData>) => void;
  temaId: TemaId;
  onTrocarTema: (id: TemaId) => void;
  temaAtivo: ReturnType<typeof obterTema>;
}) {
  const layoutAtual = temaAtivo.layouts.find((l) => l.id === slide.layout) || temaAtivo.layouts[0];
  const usaFoto = layoutAtual.usaFoto;
  const usaDuasFotos = Boolean(layoutAtual.usaDuasFotos);
  const coresFundoPermitidas = layoutAtual.coresFundoPermitidas || ["preto", "amarelo", "bege", "branco"];

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
                    <span className="w-3 h-3 rounded-sm" style={{ background: t.cores.preto, border: "1px solid #333" }} />
                    <span className="w-3 h-3 rounded-sm" style={{ background: t.cores.amarelo }} />
                    <span className="w-3 h-3 rounded-sm" style={{ background: t.cores.bege, border: "1px solid #333" }} />
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
                  c === "preto" ? "#0a0a0a"
                  : c === "amarelo" ? "#FFC528"
                  : c === "bege" ? "#F4F1EA"
                  : "#ffffff";
                return (
                  <button
                    key={c}
                    onClick={() => onChange({ corFundo: c })}
                    className={`h-10 rounded-md border-2 transition-all ${
                      ativo ? "border-[#FFC528] ring-2 ring-[#FFC528]/30" : "border-gray-800 hover:border-gray-600"
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

      {/* Cores personalizadas */}
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
          <Label icone={<ImageIcon size={12} />}>
            {usaDuasFotos ? "Foto 1 (topo)" : "Foto"}
          </Label>
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
// COLOR FIELD — color picker + input hex + sugestões do tema
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
      <div className="w-16 text-[11px] text-gray-400">{label}</div>
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
          <span className={`text-[9px] ${valor.length > maxLen * 0.85 ? "text-[#FFC528]" : "text-gray-600"}`}>
            {valor.length}/{maxLen}
          </span>
        )}
      </div>
      {multiline ? (
        <textarea rows={rows || 3} {...props} />
      ) : (
        <input type="text" {...props} />
      )}
      {dica && <p className="text-[10px] text-gray-600 mt-1">{dica}</p>}
    </div>
  );
}

// ============================================================
// PAINEL DE TIPOGRAFIA AVANÇADA (v7)
// Modo simples (sempre visível) + Modo avançado (expansível)
// ============================================================

const ELEMENTOS: { id: ElementoTipo; label: string; ehNumero?: boolean }[] = [
  { id: "kicker", label: "Kicker" },
  { id: "headline", label: "Headline" },
  { id: "corpo", label: "Corpo" },
  { id: "destaque", label: "Destaque" },
  { id: "numero", label: "Big Number", ehNumero: true },
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

  // Caps simples: 3 estados (padrão / CAPS / minúsculas)
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
    slide.tipoNumero !== undefined;

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

      {/* MODO SIMPLES — sempre visível */}
      <div className="space-y-3 bg-[#0a0a0a] border border-gray-800 rounded-md p-3">
        {/* Tamanho geral (slider) */}
        <SliderTamanhoGeral
          valor={escalaGeral}
          onChange={(v) => onChange({ escalaGeral: v === 1 ? undefined : v })}
        />

        {/* Caso (3 opções) */}
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

        {/* Fonte do headline */}
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

      {/* TOGGLE AVANÇADO */}
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

      {/* MODO AVANÇADO */}
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
        <span className="text-[10px] text-gray-500 uppercase tracking-wider">
          Tamanho geral
        </span>
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
  const campoOverride = `tipo${elementoId.charAt(0).toUpperCase() + elementoId.slice(1)}` as keyof SlideData;
  const override = (slide[campoOverride] as TipografiaOverride | undefined) || {};

  const tamanhoBase = ehNumero ? 240 : elementoId === "headline" ? 88 : elementoId === "kicker" ? 14 : 24;

  const aplicar = (patch: Partial<TipografiaOverride>) => {
    const novo = { ...override, ...patch };
    // Limpa propriedades undefined explicitamente pra não poluir o objeto
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
          {/* Tamanho (px absoluto) */}
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
                onChange={(e) => aplicar({ tamanhoPx: parseInt(e.target.value, 10), escala: undefined })}
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

          {/* Fonte */}
          <div>
            <div className="text-[9px] text-gray-500 uppercase tracking-wider mb-1">
              Fonte
            </div>
            <select
              value={override.fonte || ""}
              onChange={(e) => aplicar({ fonte: (e.target.value || undefined) as FonteId | undefined })}
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

          {/* Peso */}
          <div>
            <div className="text-[9px] text-gray-500 uppercase tracking-wider mb-1">
              Peso
            </div>
            <select
              value={override.peso ?? ""}
              onChange={(e) =>
                aplicar({ peso: e.target.value ? (parseInt(e.target.value, 10) as PesoFonte) : undefined })
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

          {/* Caps */}
          <div>
            <div className="text-[9px] text-gray-500 uppercase tracking-wider mb-1">
              Capitalização
            </div>
            <select
              value={override.caps || "padrao"}
              onChange={(e) =>
                aplicar({ caps: e.target.value === "padrao" ? undefined : (e.target.value as ModoCaps) })
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

          {/* Tracking */}
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
