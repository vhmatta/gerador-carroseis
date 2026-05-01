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
    <div className="w-full min-h-screen bg-[var(--v6-bg-base)] text-[var(--v6-text-primary)] font-sans">
      {/* Header / Top Bar */}
      <header className="sticky top-0 z-[100] bg-[var(--v6-bg-base)]/80 backdrop-blur-md border-b border-[var(--v6-border)] px-6 py-3">
        <div className="max-w-[1800px] mx-auto flex items-center justify-between gap-4">
          {/* Logo / Brand Input */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#FFC528] rounded-lg">
              <Zap size={18} className="text-black fill-black" />
              <span className="font-black text-black tracking-tight text-sm">POTENCIAL</span>
            </div>
            <div className="h-6 w-[1px] bg-[var(--v6-border)]" />
            <div className="relative group">
              <input
                type="text"
                value={marca}
                onChange={(e) => setMarca(e.target.value)}
                className="bg-[var(--v6-bg-sunken)] border border-[var(--v6-border)] rounded-md px-3 py-1.5 text-xs focus:outline-none focus:border-[#FFC528] w-48 transition-all hover:border-gray-600"
                placeholder="SUA MARCA AQUI"
              />
              <div className="absolute left-3 -top-2 px-1 bg-[var(--v6-bg-base)] text-[9px] text-[var(--v6-text-muted)] font-bold uppercase tracking-wider opacity-0 group-focus-within:opacity-100 transition-opacity">
                Tagline da Marca
              </div>
            </div>
          </div>

          {/* Central Actions (History) */}
          <div className="hidden md:flex items-center gap-1 bg-[var(--v6-bg-sunken)] p-1 rounded-lg border border-[var(--v6-border)]">
            <HeaderActionBtn onClick={undo} disabled={!canUndo} title="Desfazer (Ctrl+Z)">
              <Undo2 size={16} />
            </HeaderActionBtn>
            <HeaderActionBtn onClick={redo} disabled={!canRedo} title="Refazer (Ctrl+Y)">
              <Redo2 size={16} />
            </HeaderActionBtn>
          </div>

          {/* Right Actions (Import/Export) */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPanelAtivo(panelAtivo === "cola" ? null : "cola")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all border ${
                panelAtivo === "cola" 
                  ? "bg-[#FFC528] text-black border-[#FFC528]" 
                  : "bg-[var(--v6-bg-sunken)] text-[var(--v6-text-secondary)] border-[var(--v6-border)] hover:text-white"
              }`}
            >
              <FileText size={14} />
              <span className="hidden sm:inline">Colar Texto</span>
            </button>

            <button
              onClick={() => setPanelAtivo(panelAtivo === "ia" ? null : "ia")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all border ${
                panelAtivo === "ia" 
                  ? "bg-[#FFC528] text-black border-[#FFC528]" 
                  : "bg-[var(--v6-bg-sunken)] text-[var(--v6-text-secondary)] border-[var(--v6-border)] hover:text-white"
              }`}
            >
              <Sparkles size={14} />
              <span className="hidden sm:inline">Gerar com IA</span>
            </button>

            <div className="h-6 w-[1px] bg-[var(--v6-border)] mx-1" />

            <button
              onClick={exportarTudo}
              disabled={exportando}
              className="flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-black bg-[#FFC528] text-black hover:bg-[#ffd55a] transition-all disabled:opacity-40 shadow-[0_0_20px_rgba(255,197,40,0.15)]"
            >
              {exportando ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Download size={14} />
              )}
              BAIXAR CARROSSEL
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-[1800px] mx-auto px-6 py-6 h-[calc(100vh-64px)] overflow-hidden">
        
        {/* Floating Overlay Panels */}
        <div className="relative">
          <Suspense fallback={
            <div className="absolute top-0 right-0 z-50 w-full max-w-xl bg-[var(--v6-bg-base)] border border-[var(--v6-border)] rounded-2xl p-12 flex flex-col items-center justify-center gap-4 animate-pulse">
              <Loader2 className="w-8 h-8 text-[#FFC528] animate-spin" />
              <p className="text-xs font-bold text-[var(--v6-text-muted)] uppercase tracking-widest">Carregando Módulo...</p>
            </div>
          }>
            {panelAtivo === "ia" && (
              <div className="absolute top-0 right-0 z-50 w-full max-w-xl animate-in slide-in-from-top-4 duration-300">
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
              <div className="absolute top-0 right-0 z-50 w-full max-w-xl animate-in slide-in-from-top-4 duration-300">
                <PastePanel 
                  onAplicar={aoAplicarCola} 
                  onClose={() => setPanelAtivo(null)} 
                />
              </div>
            )}
          </Suspense>
        </div>

        <div className="grid grid-cols-12 gap-6 h-full">
          {/* Col 1: Slide List (Sidebar) */}
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

          {/* Col 2: Preview Area (Center) */}
          <section className="col-span-12 md:col-span-6 flex flex-col h-full overflow-hidden">
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
          </section>

          {/* Col 3: Edit Panel (Right) */}
          <aside className="col-span-12 md:col-span-4 h-full overflow-y-auto pr-1">
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
