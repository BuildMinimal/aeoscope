import { EngineAdapter, EngineResult, postJson } from "./types";

interface PerplexityResponse {
  choices?: { message?: { content?: string } }[];
  search_results?: { url?: string; title?: string }[];
}

export const perplexity: EngineAdapter = {
  id: "perplexity",
  label: "Perplexity",
  defaultModel: "sonar",
  apiKeyEnv: "PERPLEXITY_API_KEY",

  isConfigured() {
    return Boolean(process.env.PERPLEXITY_API_KEY);
  },

  async run(prompt, model): Promise<EngineResult> {
    const started = Date.now();
    const usedModel = model ?? process.env.PERPLEXITY_MODEL ?? this.defaultModel;
    const data = (await postJson(
      "perplexity",
      "https://api.perplexity.ai/chat/completions",
      { Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}` },
      { model: usedModel, messages: [{ role: "user", content: prompt }] },
    )) as PerplexityResponse;

    const text = data.choices?.[0]?.message?.content ?? "";
    if (!text) throw new Error("Perplexity returned an empty response");
    const citations = (data.search_results ?? [])
      .map((r) => r.url)
      .filter((u): u is string => Boolean(u));
    return { text, model: usedModel, latencyMs: Date.now() - started, citations };
  },
};
