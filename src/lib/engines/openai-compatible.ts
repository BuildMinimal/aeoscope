import { EngineAdapter, EngineError, EngineResult } from "./types";
import { dockerHostHint, fetchFromLocalServer } from "./local-server";

interface ChatResponse {
  choices?: { message?: { content?: string } }[];
}

/**
 * Works with any OpenAI-compatible endpoint, which is the de-facto standard
 * for local inference servers: LM Studio (http://localhost:1234/v1),
 * llama.cpp server, vLLM, Jan, LocalAI, GPT4All, and Ollama's /v1.
 */
export const openaiCompatible: EngineAdapter = {
  id: "custom",
  label: "Custom (OpenAI-compatible)",
  defaultModel: "local-model",
  apiKeyEnv: "CUSTOM_BASE_URL",

  isConfigured() {
    return Boolean(process.env.CUSTOM_BASE_URL);
  },

  async run(prompt, model): Promise<EngineResult> {
    const started = Date.now();
    const base = (process.env.CUSTOM_BASE_URL ?? "").trim().replace(/\/+$/, "");
    const usedModel = model ?? process.env.CUSTOM_MODEL ?? this.defaultModel;

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    const apiKey = process.env.CUSTOM_API_KEY?.trim();
    if (apiKey) {
      headers.Authorization = `Bearer ${apiKey}`;
    }

    const res = await fetchFromLocalServer(
      "custom",
      base,
      "/chat/completions",
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          model: usedModel,
          messages: [{ role: "user", content: prompt }],
        }),
        // local inference can be slow on modest hardware
        signal: AbortSignal.timeout(300_000),
      },
      (b) =>
        new EngineError(
          "custom",
          undefined,
          `could not reach ${b}/chat/completions. Is the server running?${dockerHostHint(b)}`,
        ),
    );

    if (!res.ok) {
      const snippet = (await res.text()).slice(0, 300);
      throw new EngineError("custom", res.status, `HTTP ${res.status}: ${snippet}`);
    }

    const data = (await res.json()) as ChatResponse;
    const text = data.choices?.[0]?.message?.content ?? "";
    if (!text) throw new Error("the server returned an empty response");
    return { text, model: usedModel, latencyMs: Date.now() - started };
  },
};
