import { EngineAdapter, EngineError, EngineResult } from "./types";

interface GeminiResponse {
  candidates?: {
    content?: { parts?: { text?: string }[] };
    groundingMetadata?: {
      groundingChunks?: { web?: { uri?: string } }[];
    };
  }[];
}

const SEARCH_ON = ["true", "1", "on"];

export const gemini: EngineAdapter = {
  id: "gemini",
  label: "Google Gemini",
  defaultModel: "gemini-3.8-flash",
  apiKeyEnv: "GEMINI_API_KEY",

  isConfigured() {
    return Boolean(process.env.GEMINI_API_KEY);
  },

  async run(prompt, model): Promise<EngineResult> {
    const started = Date.now();
    const usedModel = model ?? process.env.GEMINI_MODEL ?? this.defaultModel;

    // With search grounding on, Gemini answers from live Google results and
    // returns the sources as groundingMetadata - aeoscope's citation tracking
    // then works for Gemini the same way it does for Perplexity.
    const body: Record<string, unknown> = {
      contents: [{ parts: [{ text: prompt }] }],
    };
    if (SEARCH_ON.includes((process.env.GEMINI_SEARCH ?? "").toLowerCase())) {
      body.tools = [{ google_search: {} }];
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${usedModel}:generateContent`;
    const data = (await postJson(
      "gemini",
      url,
      { "x-goog-api-key": process.env.GEMINI_API_KEY ?? "" },
      body,
    )) as GeminiResponse;

    const candidate = data.candidates?.[0];
    const text = (candidate?.content?.parts ?? [])
      .map((p) => p.text ?? "")
      .join("");
    if (!text) throw new Error("Gemini returned an empty response");

    const citations = (candidate?.groundingMetadata?.groundingChunks ?? [])
      .map((c) => c.web?.uri)
      .filter((u): u is string => Boolean(u));

    return {
      text,
      model: usedModel,
      latencyMs: Date.now() - started,
      ...(citations.length > 0 ? { citations } : {}),
    };
  },
};
