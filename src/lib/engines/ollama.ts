import { EngineAdapter, EngineError, EngineResult } from "./types";
import { dockerHostHint, fetchFromLocalServer } from "./local-server";

interface OllamaResponse {
  message?: { content?: string };
}

export const ollama: EngineAdapter = {
  id: "ollama",
  label: "Ollama (local models)",
  defaultModel: "llama3.2",
  apiKeyEnv: "OLLAMA_BASE_URL",

  // No API key needed - only a running Ollama instance.
  isConfigured() {
    return true;
  },

  async run(prompt, model): Promise<EngineResult> {
    const started = Date.now();
    const base = (process.env.OLLAMA_BASE_URL ?? "http://127.0.0.1:11434")
      .trim()
      .replace(/\/+$/, "");
    const usedModel = model ?? process.env.OLLAMA_MODEL ?? this.defaultModel;

    const res = await fetchFromLocalServer(
      "ollama",
      base,
      "/api/chat",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: usedModel,
          messages: [{ role: "user", content: prompt }],
          stream: false,
        }),
        // local inference can be slow on modest hardware
        signal: AbortSignal.timeout(300_000),
      },
      (b) =>
        new EngineError(
          "ollama",
          undefined,
          `could not reach Ollama at ${b}. Is it running? (https://ollama.com)${dockerHostHint(b)}`,
        ),
    );

    if (!res.ok) {
      const snippet = (await res.text()).slice(0, 300);
      throw new EngineError("ollama", res.status, `HTTP ${res.status}: ${snippet}`);
    }

    const data = (await res.json()) as OllamaResponse;
    const text = data.message?.content ?? "";
    if (!text) throw new Error("Ollama returned an empty response");
    return { text, model: usedModel, latencyMs: Date.now() - started };
  },
};
