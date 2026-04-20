import { toPng } from "html-to-image";
import JSZip from "jszip";

const BASE_WIDTH = 1080;
const BASE_HEIGHT = 1350;

/** Pré-carrega uma imagem forçando CORS anônimo. */
function preloadImage(src: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    if (!src.startsWith("data:")) {
      img.crossOrigin = "anonymous";
    }
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = src;
  });
}

async function preloadAllImages(container: HTMLElement): Promise<void> {
  const images = container.querySelectorAll("img");
  const urls = Array.from(images)
    .map((img) => img.src)
    .filter((src) => !!src);
  await Promise.all(urls.map(preloadImage));
}

/** Gera o dataURL PNG de um único slide. */
async function gerarSlideDataURL(elemento: HTMLElement): Promise<string> {
  await document.fonts.ready;
  await preloadAllImages(elemento);
  await new Promise((resolve) => requestAnimationFrame(resolve));

  const dataUrl = await toPng(elemento, {
    cacheBust: true,
    pixelRatio: 1,
    width: BASE_WIDTH,
    height: BASE_HEIGHT,
    backgroundColor: "#0a0a0a",
    skipFonts: false,
    fetchRequestInit: {
      cache: "no-cache",
      mode: "cors",
      credentials: "omit",
    },
    filter: (node: HTMLElement) => {
      if (node.tagName === "IFRAME") return false;
      if (node.tagName === "IMG") {
        const img = node as HTMLImageElement;
        if (img.src && (!img.complete || img.naturalWidth === 0)) {
          console.warn("[gerarCarrossel] Pulando imagem quebrada:", img.src);
          return false;
        }
      }
      return true;
    },
  });

  return dataUrl;
}

/** Converte dataURL em Blob. */
function dataUrlToBlob(dataUrl: string): Blob {
  const [header, base64] = dataUrl.split(",");
  const mimeMatch = header.match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : "image/png";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mime });
}

export interface SlideRef {
  index: number;
  element: HTMLDivElement;
}

export interface GerarCarrosselOpcoes {
  slides: SlideRef[];
  nomeBase: string;
  onProgress?: (atual: number, total: number) => void;
  onSuccess?: () => void;
  onError?: (err: Error) => void;
}

/**
 * Gera PNG de um único slide e dispara download.
 */
export async function baixarSlideUnico(
  elemento: HTMLElement,
  nomeArquivo: string
): Promise<boolean> {
  try {
    const dataUrl = await gerarSlideDataURL(elemento);
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = nomeArquivo.endsWith(".png") ? nomeArquivo : `${nomeArquivo}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  } catch (err) {
    console.error("[baixarSlideUnico] Erro:", err);
    return false;
  }
}

/**
 * Gera todos os slides, empacota num ZIP e dispara download.
 */
export async function baixarCarrosselZIP(opcoes: GerarCarrosselOpcoes): Promise<boolean> {
  const { slides, nomeBase, onProgress, onSuccess, onError } = opcoes;

  try {
    const zip = new JSZip();
    const pasta = zip.folder(nomeBase);
    if (!pasta) throw new Error("Falha ao criar pasta no ZIP.");

    for (let i = 0; i < slides.length; i++) {
      const { index, element } = slides[i];
      onProgress?.(i + 1, slides.length);

      const dataUrl = await gerarSlideDataURL(element);
      const blob = dataUrlToBlob(dataUrl);
      const nomeSlide = `slide_${String(index + 1).padStart(2, "0")}.png`;
      pasta.file(nomeSlide, blob);
    }

    // Gera e baixa o ZIP
    const conteudo = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(conteudo);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${nomeBase}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    onSuccess?.();
    return true;
  } catch (err: any) {
    const error = err instanceof Error ? err : new Error(String(err?.message || err));
    console.error("[baixarCarrosselZIP] Erro:", error);
    onError?.(error);
    return false;
  }
}
