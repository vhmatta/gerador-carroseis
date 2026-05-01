import React, { useState, useRef, useMemo, useCallback, useEffect, lazy, Suspense } from "react";
import { 
  Download, 
  Sparkles, 
  FileText, 
  Plus, 
  Settings2,
  Share2,
  Trash2,
  Undo2,
  Redo2,
  Keyboard,
  Info,
  Loader2
} from "lucide-react";
import { toast } from "sonner";

// Componentes Core
import CarrosselSlide, { 
  SlideData, 
  TemaId, 
  LayoutId,
  criarSlideVazio 
} from "./CarrosselSlide";
import { TEMAS_DISPONIVEIS, obterTema } from "./temas";

// Novos Componentes Modulares
import { SlideList } from "./SlideList";
import { SlidePreview } from "./SlidePreview";
import { EditPanel } from "./EditPanel";

// Lazy-loaded Panels
const IAPanel = lazy(() => import("./IAPanel").then(m => ({ default: m.IAPanel })));
const PastePanel = lazy(() => import("./PastePanel").then(m => ({ default: m.PastePanel })));

// Hooks
import { useLocalStorage } from "../lib/useLocalStorage";
import { useUndoRedo } from "../lib/useUndoRedo";
import { useKeyboardShortcuts } from "../lib/useKeyboardShortcuts";
import { useConfirm } from "./ui/ConfirmModal";

// Libs
import { baixarCarrosselZIP, baixarSlideUnico } from "../lib/gerarCarrossel";
import { sincronizarSlides } from "../lib/parsearTextoColado";

// ============================================================
// CONSTANTES & UTILS
// ============================================================

const DEFAULT_TEMA: TemaId = "brands_decoded_classic";
const DEFAULT_MARCA = "POTENCIAL · MERCADO";

function uid() {
  return Math.random().toString(36).substring(2, 10);
}

function slidesIniciaisDoTema(temaId: TemaId): SlideData[] {
  const tema = obterTema(temaId);
  return tema.slidesExemplo.map((s) => ({ ...s, id: uid() }));
}

// ============================================================
// COMPONENTE PRINCIPAL (v7 - 2026 Modernized)
// ============================================================

export default function CarrosselEditor() {
  // --- Estados Persistentes ---
  const [temaId, setTemaId] = useLocalStorage<TemaId>("editor_tema_id", DEFAULT_TEMA);
  const [marca, setMarca] = useLocalStorage<string>("editor_marca", DEFAULT_MARCA);
  const [formato, setFormato] = useState<"1:1" | "4:5" | "9:16" | "16:9">("4:5");
  
  // --- Estado do Carrossel (com Undo/Redo) ---
  const {
    state: slides,
    setState: setSlides,
    undo,
    redo,
    canUndo,
    canRedo,
    reset: resetSlides
  } = useUndoRedo<SlideData[]>(slidesIniciaisDoTema(DEFAULT_TEMA));

  // --- Estados de UI ---
  const [indiceAtivo, setIndiceAtivo] = useState(0);
  const [panelAtivo, setPanelAtivo] = useState<"ia" | "cola" | null>(null);
  const [exportando, setExportando] = useState(false);
  
  // Referências para captura de imagem
  const slideRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const { confirm, modal } = useConfirm();

  // --- Memos ---
  const temaAtivo = useMemo(() => obterTema(temaId), [temaId]);
  const slideAtivo = slides[indiceAtivo] || slides[0];

  // --- Callbacks de Gerenciamento ---
  
  const adicionarSlide = useCallback((layout?: LayoutId) => {
    const layoutFinal = layout || temaAtivo.layouts[0].id;
    const novo = criarSlideVazio(layoutFinal, "preto");
    novo.id = uid();
    
    setSlides((lista) => {
      const antes = lista.slice(0, indiceAtivo + 1);
      const depois = lista.slice(indiceAtivo + 1);
      return [...antes, novo, ...depois];
    });
    setIndiceAtivo((i) => i + 1);
    toast.success("Slide adicionado");
  }, [indiceAtivo, temaAtivo, setSlides]);

  const removerSlide = useCallback(async (i: number) => {
    if (slides.length <= 1) return;
    
    const ok = await confirm({
      title: "Remover Slide",
      message: `Tem certeza que deseja remover o slide ${i + 1}?`,
      variant: "danger"
    });
    
    if (!ok) return;

    setSlides((lista) => lista.filter((_, idx) => idx !== i));
    setIndiceAtivo((cur) => {
      if (cur === i) return Math.max(0, cur - 1);
      if (cur > i) return cur - 1;
      return cur;
    });
    toast.info("Slide removido");
  }, [slides.length, confirm, setSlides]);

  const duplicarSlide = useCallback((i: number) => {
    setSlides((lista) => {
      const copia = { ...lista[i], id: uid() };
      return [...lista.slice(0, i + 1), copia, ...lista.slice(i + 1)];
    });
    setIndiceAtivo(i + 1);
    toast.success("Slide duplicado");
  }, [setSlides]);

  const moverSlide = useCallback((de: number, para: number) => {
    if (para < 0 || para >= slides.length) return;
    setSlides((lista) => {
      const copia = [...lista];
      const [item] = copia.splice(de, 1);
      copia.splice(para, 0, item);
      return copia;
    });
    setIndiceAtivo(para);
  }, [slides.length, setSlides]);

  const atualizarSlide = useCallback((patch: Partial<SlideData>) => {
    setSlides((lista) =>
      lista.map((s, i) => (i === indiceAtivo ? { ...s, ...patch } : s))
    );
  }, [indiceAtivo, setSlides]);

  const trocarTema = useCallback(async (novoId: TemaId) => {
    const novoTema = obterTema(novoId);
    const layoutsValidos = novoTema.layouts.map((l) => l.id);
    
    setTemaId(novoId);
    setSlides((lista) =>
      lista.map((s) => ({
        ...s,
        layout: layoutsValidos.includes(s.layout) ? s.layout : novoTema.layouts[0].id,
      }))
    );
    toast.info(`Tema alterado para: ${novoTema.nome}`);
  }, [setTemaId, setSlides]);

  const resetarProjeto = useCallback(async () => {
    const ok = await confirm({
      title: "Resetar Projeto",
      message: "Isso apagará todas as alterações e voltará aos slides de exemplo. Continuar?",
      variant: "warning"
    });
    
    if (ok) {
      resetSlides(slidesIniciaisDoTema(temaId));
      setIndiceAtivo(0);
      toast("Projeto resetado");
    }
  }, [confirm, resetSlides, temaId]);

  // --- Integração com Painéis ---

  const aoAplicarIA = useCallback((novosSlides: SlideData[]) => {
    // Preserva fotos se possível
    const comFotos: SlideData[] = novosSlides.map((n, i) => ({
      ...n,
      fotoUrl: slides[i]?.fotoUrl || n.fotoUrl || "",
      fotoUrl2: slides[i]?.fotoUrl2 || n.fotoUrl2 || "",
    }));
    setSlides(comFotos);
    setIndiceAtivo(0);
    setPanelAtivo(null);
    toast.success(`${novosSlides.length} slides gerados com sucesso!`);
  }, [slides, setSlides]);

  const aoAplicarCola = useCallback((novosSlides: SlideData[]) => {
    const slidesFinais = sincronizarSlides(slides, novosSlides);
    setSlides(slidesFinais);
    setIndiceAtivo(0);
    setPanelAtivo(null);
    toast.success("Conteúdo aplicado!");
  }, [slides, setSlides]);

  // --- Exportação ---

  const exportarTudo = async () => {
    setExportando(true);
    try {
      const refs = slides
        .map((s, i) => {
          const element = slideRefs.current.get(s.id);
          return element ? { index: i, element } : null;
        })
        .filter((r): r is { index: number; element: HTMLDivElement } => r !== null);

      if (refs.length !== slides.length) {
        toast.error("Erro: slides não renderizados. Tente novamente.");
        return;
      }

      const nomeBase = slides[0]?.headline.slice(0, 30).replace(/[^a-z0-9]/gi, "-") || "carrossel";

      await baixarCarrosselZIP({
        slides: refs,
        nomeBase: `carrossel-${nomeBase.toLowerCase()}`,
        onProgress: (atual, total) => {
          // Opcional: progresso detalhado
        },
        onSuccess: () => toast.success("ZIP exportado com sucesso!"),
        onError: (err) => toast.error(`Erro na exportação: ${err.message}`),
      });
    } finally {
      setExportando(false);
    }
  };

  const exportarAtual = async () => {
    const element = slideRefs.current.get(slideAtivo.id);
    if (!element) return;
    
    const ok = await baixarSlideUnico(element, `slide-${indiceAtivo + 1}`);
    if (ok) toast.success("Slide baixado!");
    else toast.error("Falha ao gerar imagem");
  };

  // --- Atalhos de Teclado ---
  useKeyboardShortcuts({
    onUndo: undo,
    onRedo: redo,
    onAddSlide: () => adicionarSlide(),
    onDeleteSlide: () => removerSlide(indiceAtivo),
    onDuplicateSlide: () => duplicarSlide(indiceAtivo),
    onNextSlide: () => setIndiceAtivo(prev => Math.min(slides.length - 1, prev + 1)),
    onPrevSlide: () => setIndiceAtivo(prev => Math.max(0, prev - 1)),
    onSave: () => toast.info("Projeto salvo automaticamente"),
  });

  // --- Render ---

  return (
    <div className="w-full min-h-screen bg-[#050505] text-white/90 font-sans">
      {/* Header / Top Bar - Simplificado para sumir com o App.tsx Header */}
      <header className="sticky top-0 z-[100] bg-[#050505]/80 backdrop-blur-md border-b border-white/5 px-6 py-4">
        <div className="max-w-[1800px] mx-auto flex items-center justify-between gap-4">
          {/* Logo / Brand Input */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-6 bg-[#FFC528] rounded-full" />
              <h1 className="text-lg font-bold tracking-tight font-['Archivo']">Editor de Carrossel</h1>
            </div>
            <div className="h-6 w-[1px] bg-white/10" />
            <div className="relative group">
              <input
                type="text"
                value={marca}
                onChange={(e) => setMarca(e.target.value)}
                className="bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-[#FFC528] w-64 transition-all"
                placeholder="SUA MARCA AQUI"
              />
              <span className="absolute -top-2 left-3 bg-[#050505] px-1 text-[9px] font-bold text-white/20 uppercase tracking-widest">Branding Principal</span>
            </div>
          </div>

          {/* Right Actions (Import/Export) */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-white/[0.03] p-1 rounded-xl border border-white/5 mr-2">
              <HeaderActionBtn onClick={undo} disabled={!canUndo} title="Desfazer (Ctrl+Z)">
                <Undo2 size={16} />
              </HeaderActionBtn>
              <HeaderActionBtn onClick={redo} disabled={!canRedo} title="Refazer (Ctrl+Y)">
                <Redo2 size={16} />
              </HeaderActionBtn>
            </div>

            <button
              onClick={() => setPanelAtivo(panelAtivo === "cola" ? null : "cola")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                panelAtivo === "cola" 
                  ? "bg-[#FFC528] text-black border-[#FFC528]" 
                  : "bg-white/[0.03] text-white/60 border-white/10 hover:text-white"
              }`}
            >
              <FileText size={14} />
              Colar Conteúdo
            </button>

            <button
              onClick={() => setPanelAtivo(panelAtivo === "ia" ? null : "ia")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                panelAtivo === "ia" 
                  ? "bg-[#FFC528] text-black border-[#FFC528]" 
                  : "bg-white/[0.03] text-white/60 border-white/10 hover:text-white"
              }`}
            >
              <Sparkles size={14} />
              Gerador IA
            </button>

            <div className="h-6 w-[1px] bg-white/10 mx-1" />

            <button
              onClick={exportarTudo}
              disabled={exportando}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black bg-[#FFC528] text-black hover:bg-[#ffd55a] transition-all disabled:opacity-30 shadow-[0_10px_20px_rgba(255,197,40,0.1)]"
            >
              {exportando ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Download size={14} />
              )}
              EXPORTAR TUDO (ZIP)
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-[1800px] mx-auto px-6 py-8 h-[calc(100vh-76px)] overflow-hidden">
        
        {/* Floating Overlay Panels */}
        <div className="relative">
          <Suspense fallback={<div className="p-20 text-center text-white/20">Carregando...</div>}>
            {panelAtivo === "ia" && (
              <div className="absolute top-0 right-0 z-50 w-full max-w-xl shadow-2xl">
                <IAPanel 
                  numSlides={slides.length} 
                  temaVisual={temaAtivo}
                  marca={marca}
                  onAplicar={aoAplicarIA} 
                  onClose={() => setPanelAtivo(null)} 
                />
              </div>
            )}
            {panelAtivo === "cola" && (
              <div className="absolute top-0 right-0 z-50 w-full max-w-xl shadow-2xl">
                <PastePanel 
                  onAplicar={aoAplicarCola} 
                  onClose={() => setPanelAtivo(null)} 
                />
              </div>
            )}
          </Suspense>
        </div>

        <div className="grid grid-cols-12 gap-8 h-full">
          {/* Col 1: Slide List (Sidebar) */}
          <div className="col-span-12 md:col-span-2">
            <SlideList 
              slides={slides}
              indiceAtivo={indiceAtivo}
              temaId={temaId}
              layoutNome={(s) => obterTema(temaId).layouts.find(l => l.id === s.layout)?.nome || "Layout"}
              onSelect={setIndiceAtivo}
              onRemover={removerSlide}
              onDuplicar={duplicarSlide}
              onMover={moverSlide}
              onAdicionarSlide={() => adicionarSlide()}
            />
          </div>

          {/* Col 2: Preview Area (Center) */}
          <section className="col-span-12 md:col-span-6 flex flex-col h-full bg-[#0a0a0a] rounded-3xl border border-white/5 p-8 shadow-inner overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-bold text-white/20 uppercase tracking-widest">Visualização em Tempo Real</h3>
              <div className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-mono text-white/40">
                SLIDE {indiceAtivo + 1} / {slides.length}
              </div>
            </div>
            
            <div className="flex-1 flex flex-col overflow-hidden">
              <SlidePreview 
                slide={slideAtivo}
                index={indiceAtivo}
                total={slides.length}
                marca={marca}
                temaId={temaId}
                formato={formato}
                onFormatoChange={setFormato}
                onPrev={() => setIndiceAtivo(i => Math.max(0, i - 1))}
                onNext={() => setIndiceAtivo(i => Math.min(slides.length - 1, i + 1))}
                onExport={exportarAtual}
                podePrev={indiceAtivo > 0}
                podeNext={indiceAtivo < slides.length - 1}
              />
            </div>
          </section>

          {/* Col 3: Edit Panel (Right) */}
          <aside className="col-span-12 md:col-span-4 h-full overflow-y-auto bg-[#0a0a0a] rounded-3xl border border-white/5 p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-1.5 h-6 bg-[#FFC528] rounded-full" />
              <h2 className="text-xl font-bold font-['Archivo']">Design & Conteúdo</h2>
            </div>
            <EditPanel 
              slide={slideAtivo}
              onChange={atualizarSlide}
              temaId={temaId}
              onTrocarTema={trocarTema}
              onReset={resetarProjeto}
            />
          </aside>
        </div>
      </main>

      {/* Hidden Render Container (for export) */}
      <div className="fixed -left-[10000px] top-0 pointer-events-none opacity-0" aria-hidden="true">
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

      {/* Global Modals */}
      {modal}
    </div>
  );
}

function HeaderActionBtn({ 
  children, 
  onClick, 
  disabled, 
  title 
}: { 
  children: React.ReactNode; 
  onClick: () => void; 
  disabled?: boolean;
  title: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="p-2 rounded-md text-[var(--v6-text-muted)] hover:text-white hover:bg-[var(--v6-bg-elevated)] disabled:opacity-20 transition-all"
    >
      {children}
    </button>
  );
}
