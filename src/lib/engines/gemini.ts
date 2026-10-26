import { EngineAdapter, EngineResult, postJson } from "./types";

interface GeminiResponse {
  candidates?: { content?: { parts?: { text?: string }[] } }[];
}

export const gemini: EngineAdapter = {
  id: "gemini",
  label: "Google Gemini",
  defaultModel: "gemini-2.0-flash",
  apiKeyEnv: "GEMINI_API_KEY",

  isConfigured() {
    return Boolean(process.env.GEMINI_API_KEY);
  },

  async run(prompt, model): Promise<EngineResult> {
    const started = Date.now();
    const usedModel = model ?? process.env.GEMINI_MODEL ?? this.defaultModel;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${usedModel}:generateContent`;
    const data = (await postJson(
      "gemini",
      url,
      { "x-goog-api-key": process.env.GEMINI_API_KEY ?? "" },
      { contents: [{ parts: [{ text: prompt }] }] },
    )) as GeminiResponse;

    const text = (data.candidates?.[0]?.content?.parts ?? [])
      .map((p) => p.text ?? "")
      .join("");
    if (!text) throw new Error("Gemini returned an empty response");
    return { text, model: usedModel, latencyMs: Date.now() - started };
  },
};
