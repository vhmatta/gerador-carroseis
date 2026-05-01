import type { TemaConfig, LayoutRenderProps, SlideData } from "./tipos";
import { criarSlideVazio, resolverFonteHeadline } from "./tipos";
import {
  Topbar,
  Kicker,
  Headline,
  Corpo,
  Destaque,
  Pill,
  FotoOuPlaceholder,
  BigNumber,
} from "./primitivos";

// ============================================================
// TEMA 1 — BRANDS DECODED CLASSIC
// Fundo preto dominante, amarelo como accent.
// Tipografia pesada (Archivo Black), sem cantos arredondados.
// ============================================================

const CORES = {
  preto: "#050505",
  branco: "#ffffff",
  bege: "#F4F1EA",
  amarelo: "#FFC528",
};

// ============================================================
// LAYOUTS
// ============================================================

function LayoutFotoCheia({ slide, tema, marca, numero, coresResolvidas }: LayoutRenderProps) {
  const fonteHeadline = resolverFonteHeadline(slide, tema);
  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: CORES.preto }}>
      <FotoOuPlaceholder
        url={slide.fotoUrl}
        largura={1080}
        altura={1350}
        accent={CORES.amarelo}
        style={{ position: "absolute", inset: 0 }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.55) 50%, rgba(0,0,0,0.96) 100%)",
        }}
      />
      <Topbar cor={CORES.amarelo} marca={marca} numero={numero} />
      <div style={{ position: "absolute", bottom: 90, left: 56, right: 56, color: CORES.branco }}>
        <Kicker texto={slide.kicker} cor={coresResolvidas.kicker} accent={CORES.amarelo} slide={slide}/>
        <Headline texto={slide.headline} cor={coresResolvidas.headline} tamanho={98} fontFamily={fonteHeadline}
          slide={slide}
        />
        {slide.destaque && (
          <div style={{ marginTop: 22 }}>
            <Destaque texto={slide.destaque} cor={coresResolvidas.destaque} fontFamily={fonteHeadline} slide={slide}/>
          </div>
        )}
        {slide.mostrarPill && slide.textoPill && (
          <div style={{ marginTop: 26 }}>
            <Pill texto={slide.textoPill} corFundo={CORES.amarelo} corTexto={CORES.preto} />
          </div>
        )}
      </div>
    </div>
  );
}

function LayoutSplitHorizontal({ slide, tema, marca, numero, coresResolvidas }: LayoutRenderProps) {
  const fonteHeadline = resolverFonteHeadline(slide, tema);
  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: CORES.preto }}>
      <FotoOuPlaceholder
        url={slide.fotoUrl}
        largura={1080}
        altura={620}
        accent={CORES.amarelo}
        style={{ position: "absolute", top: 0, left: 0 }}
      />
      <Topbar cor={CORES.amarelo} marca={marca} numero={numero} />
      <div
        style={{
          position: "absolute",
          top: 660,
          left: 56,
          right: 56,
          bottom: 70,
          color: CORES.branco,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Kicker texto={slide.kicker} cor={coresResolvidas.kicker} accent={CORES.amarelo} slide={slide}/>
        <Headline texto={slide.headline} cor={coresResolvidas.headline === CORES.amarelo ? CORES.branco : coresResolvidas.headline} tamanho={64} fontFamily={fonteHeadline}
          slide={slide}
        />
        {slide.corpo && (
          <div style={{ marginTop: 24 }}>
            <Corpo texto={slide.corpo} cor={CORES.branco} fontFamily={tema.fonteCorpo} slide={slide}/>
          </div>
        )}
        {slide.destaque && (
          <div style={{ marginTop: 20 }}>
            <Destaque texto={slide.destaque} cor={coresResolvidas.destaque} fontFamily={fonteHeadline} slide={slide}/>
          </div>
        )}
      </div>
    </div>
  );
}

function LayoutSplitInvertido({ slide, tema, marca, numero, coresResolvidas }: LayoutRenderProps) {
  const fonteHeadline = resolverFonteHeadline(slide, tema);
  // Fundo aqui é sempre amarelo (é a marca dessa variação)
  const fundo = CORES.amarelo;
  const textoClaro = CORES.preto;
  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: fundo }}>
      <FotoOuPlaceholder
        url={slide.fotoUrl}
        largura={1080}
        altura={560}
        accent={CORES.amarelo}
        style={{ position: "absolute", bottom: 0, left: 0 }}
      />
      <Topbar cor={textoClaro} marca={marca} numero={numero} />
      <div style={{ position: "absolute", top: 120, left: 56, right: 56, color: textoClaro }}>
        <Kicker texto={slide.kicker} cor={slide.corKicker || textoClaro} accent={CORES.preto} slide={slide}/>
        <Headline texto={slide.headline} cor={slide.corHeadline || textoClaro} tamanho={70} fontFamily={fonteHeadline}
          slide={slide}
        />
        {slide.corpo && (
          <div style={{ marginTop: 22, maxWidth: 900 }}>
            <Corpo texto={slide.corpo} cor={textoClaro} fontFamily={tema.fonteCorpo} slide={slide}/>
          </div>
        )}
      </div>
    </div>
  );
}

function LayoutTipografiaPura({ slide, tema, marca, numero, coresResolvidas }: LayoutRenderProps) {
  const fonteHeadline = resolverFonteHeadline(slide, tema);
  const fundoEAmarelo = slide.corFundo === "amarelo";
  const fundo = fundoEAmarelo ? CORES.amarelo : CORES.preto;
  const cor = fundoEAmarelo ? CORES.preto : CORES.branco;
  const headlineCor = slide.corHeadline || (fundoEAmarelo ? CORES.preto : CORES.amarelo);
  const accentDivider = fundoEAmarelo ? CORES.preto : CORES.amarelo;
  const temBigNumber = Boolean(slide.numero?.trim());

  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: fundo }}>
      <Topbar cor={cor} marca={marca} numero={numero} />
      <div style={{ position: "absolute", top: 130, left: 56, right: 56, color: cor }}>
        <Kicker texto={slide.kicker} cor={slide.corKicker || cor} accent={accentDivider} slide={slide}/>
        {!temBigNumber && (
          <Headline texto={slide.headline} cor={headlineCor} tamanho={96} fontFamily={fonteHeadline}
          slide={slide}
        />
        )}
      </div>
      {temBigNumber && (
        <div style={{ position: "absolute", top: 340, left: 56, right: 56 }}>
          <BigNumber texto={slide.numero} cor={headlineCor} fontFamily={fonteHeadline} slide={slide}/>
        </div>
      )}
      <div style={{ position: "absolute", bottom: 110, left: 56, right: 56, color: cor }}>
        {slide.destaque && (
          <div style={{ marginBottom: 22 }}>
            <Destaque texto={slide.destaque} cor={slide.corDestaque || accentDivider} fontFamily={fonteHeadline} slide={slide}/>
          </div>
        )}
        <Corpo texto={slide.corpo} cor={cor} fontFamily={tema.fonteCorpo} slide={slide}/>
      </div>
    </div>
  );
}

function LayoutDuplaFoto({ slide, tema, marca, numero, coresResolvidas }: LayoutRenderProps) {
  const fonteHeadline = resolverFonteHeadline(slide, tema);
  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: CORES.preto }}>
      <div style={{ position: "absolute", top: 100, left: 56 }}>
        <FotoOuPlaceholder url={slide.fotoUrl} largura={968} altura={440} accent={CORES.amarelo} borderRadius={4} />
      </div>
      <div style={{ position: "absolute", top: 560, left: 56 }}>
        <FotoOuPlaceholder url={slide.fotoUrl2} largura={968} altura={360} accent={CORES.amarelo} borderRadius={4} />
      </div>
      <Topbar cor={CORES.amarelo} marca={marca} numero={numero} />
      <div style={{ position: "absolute", bottom: 70, left: 56, right: 56, color: CORES.branco }}>
        {slide.kicker && (
          <div
            style={{
              fontSize: 13,
              fontWeight: 800,
              letterSpacing: "3px",
              textTransform: "uppercase",
              color: slide.corKicker || CORES.amarelo,
              marginBottom: 10,
            }}
          >
            {slide.kicker}
          </div>
        )}
        {slide.headline && (
          <Headline
            texto={slide.headline}
            cor={slide.corHeadline || CORES.amarelo}
            tamanho={44}
            uppercase={false}
            fontFamily={fonteHeadline}
          slide={slide}
        />
        )}
        {slide.legendaFoto && (
          <div
            style={{
              marginTop: 14,
              fontSize: 18,
              fontFamily: tema.fonteCorpo,
              color: CORES.branco,
              opacity: 0.7,
              fontStyle: "italic",
            }}
          >
            {slide.legendaFoto}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// EXPORT
// ============================================================

export const TEMA_BRANDS_DECODED_CLASSIC: TemaConfig = {
  id: "brands_decoded_classic",
  nome: "Brands Decoded Classic",
  descricao: "Preto dominante, amarelo como accent, tipografia pesada",
  cores: CORES,
  fonteHeadlineDefault: "archivo",
  fonteCorpo: "'Archivo', 'Inter', sans-serif",
  corKickerDefault: CORES.amarelo,
  corHeadlineDefault: CORES.amarelo,
  corDestaqueDefault: CORES.amarelo,
  layouts: [
    {
      id: "foto_cheia",
      nome: "Foto Cheia",
      descricao: "Capa com foto de fundo e título sobre overlay",
      usaFoto: true,
      render: (p) => <LayoutFotoCheia {...p} />,
    },
    {
      id: "split_horizontal",
      nome: "Split Horizontal",
      descricao: "Foto no topo (46%) + texto embaixo",
      usaFoto: true,
      render: (p) => <LayoutSplitHorizontal {...p} />,
    },
    {
      id: "split_invertido",
      nome: "Split Invertido",
      descricao: "Texto em cima (fundo amarelo) + foto embaixo",
      usaFoto: true,
      render: (p) => <LayoutSplitInvertido {...p} />,
    },
    {
      id: "tipografia_pura",
      nome: "Tipografia Pura",
      descricao: "Só texto, headline gigante ou big number",
      usaFoto: false,
      coresFundoPermitidas: ["preto", "amarelo"],
      render: (p) => <LayoutTipografiaPura {...p} />,
    },
    {
      id: "dupla_foto",
      nome: "Dupla Foto",
      descricao: "Duas fotos empilhadas + legenda",
      usaFoto: true,
      usaDuasFotos: true,
      render: (p) => <LayoutDuplaFoto {...p} />,
    },
  ],
  slidesExemplo: [
    {
      ...criarSlideVazio("foto_cheia", "preto"),
      kicker: "TESE EDITORIAL Nº 1",
      headline: "Seu título\nentra aqui.",
      destaque: "E o complemento provocativo aparece embaixo.",
    },
    {
      ...criarSlideVazio("tipografia_pura", "amarelo"),
      kicker: "O DESLOCAMENTO",
      headline: "Por décadas,\nalgo foi\nassunto de\npoucos.",
      corpo: "Aqui você desenvolve o contexto histórico do tema em 2-3 frases.",
      destaque: "E então aconteceu a virada.",
    },
    {
      ...criarSlideVazio("tipografia_pura", "preto"),
      kicker: "O DADO QUE VIROU A CHAVE",
      numero: "+32%",
      destaque: "foi a métrica que ninguém estava acompanhando.",
      corpo: "Justifique o número com 2-3 frases de contexto.",
    },
    {
      ...criarSlideVazio("split_horizontal", "preto"),
      kicker: "PERFIL",
      headline: "Quem é esse novo protagonista?",
      corpo: "Descreva o perfil em uma linha corrida — dados demográficos, comportamentais, de consumo.",
      destaque: "Não é amador. É autodidata.",
    },
    {
      ...criarSlideVazio("tipografia_pura", "amarelo"),
      kicker: "CONCLUSÃO",
      headline: "Não é o\nfuturo.\nÉ o presente.",
      corpo: "Feche com a virada conceitual que sintetiza todo o argumento.",
    },
    {
      ...criarSlideVazio("foto_cheia", "preto"),
      kicker: "SIGA, SALVE, COMPARTILHE",
      headline: "Continue\npor dentro.",
      destaque: "Novos estudos toda semana.",
      mostrarPill: true,
      textoPill: "@SUA_MARCA · SIGA",
    },
  ],
};
