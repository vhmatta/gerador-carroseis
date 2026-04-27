/**
 * Vercel Function: /api/ia
 *
 * Proxy para OpenRouter — mantém a OPENROUTER_API_KEY segura no servidor.
 * Configure a chave em: Vercel Dashboard → Project → Settings → Environment Variables
 *   Nome: OPENROUTER_API_KEY
 *   Valor: sk-or-v1-...
 *
 * O frontend chama POST /api/ia com { prompt, model? } e recebe { texto } ou { error }.
 */

export const config = {
  runtime: "edge",
};

// Modelos sugeridos do OpenRouter. O usuário pode passar qualquer model slug válido.
const MODELOS_PERMITIDOS = [
  "anthropic/claude-3.5-sonnet",
  "anthropic/claude-3.5-haiku",
  "openai/gpt-4o",
  "openai/gpt-4o-mini",
  "google/gemini-2.0-flash-exp:free",
  "google/gemini-flash-1.5",
  "meta-llama/llama-3.3-70b-instruct",
  "meta-llama/llama-3.3-70b-instruct:free",
  "deepseek/deepseek-chat",
  "deepseek/deepseek-r1:free",
  "qwen/qwen-2.5-72b-instruct:free",
  "mistralai/mistral-nemo:free",
  "google/gemma-4-26b-a4b-it:free",
];

const MODELO_DEFAULT = "anthropic/claude-3.5-sonnet";

export default async function handler(req: Request): Promise<Response> {
  // CORS básico (útil em dev local)
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  if (req.method !== "POST") {
    return json({ error: "Use POST" }, 405);
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return json(
      {
        error:
          "OPENROUTER_API_KEY não configurada. Adicione em: Vercel Dashboard → Project → Settings → Environment Variables.",
      },
      500
    );
  }

  let body: { prompt?: string; model?: string; system?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: "JSON inválido no corpo da requisição." }, 400);
  }

  const prompt = (body.prompt || "").trim();
  if (!prompt) {
    return json({ error: "Campo 'prompt' é obrigatório." }, 400);
  }

  const modelSolicitado = body.model || MODELO_DEFAULT;
  // Permite qualquer modelo do OpenRouter, mas loga se estiver fora da lista conhecida
  const modelFinal = modelSolicitado;

  const systemPrompt =
    body.system ||
    "Você é um assistente que responde estritamente no formato solicitado pelo usuário. Se for pedido JSON, responda APENAS com o JSON puro, sem markdown, sem texto antes ou depois.";

  try {
    const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://gerador-potencial.vercel.app",
        "X-Title": "Gerador Potencial",
      },
      body: JSON.stringify({
        model: modelFinal,
        max_tokens: 4000,
        temperature: 0.7,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!resp.ok) {
      const texto = await resp.text().catch(() => "");
      return json(
        {
          error: `OpenRouter retornou ${resp.status}: ${texto.slice(0, 400)}`,
        },
        resp.status === 401 ? 401 : 502
      );
    }

    const data = await resp.json();
    const texto = data?.choices?.[0]?.message?.content;
    if (!texto || typeof texto !== "string") {
      return json({ error: "Resposta da IA vazia ou malformada." }, 502);
    }

    return json({ texto, modelo: modelFinal });
  } catch (err: any) {
    return json(
      { error: `Erro ao chamar OpenRouter: ${err?.message || String(err)}` },
      502
    );
  }
}

function json(data: any, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
