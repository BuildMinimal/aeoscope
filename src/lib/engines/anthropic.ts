import { EngineAdapter, EngineResult, postJson } from "./types";

interface AnthropicResponse {
  content?: { type?: string; text?: string }[];
}

export const anthropic: EngineAdapter = {
  id: "anthropic",
  label: "Anthropic (Claude)",
  defaultModel: "claude-sonnet-4-5",
  apiKeyEnv: "ANTHROPIC_API_KEY",

  isConfigured() {
    return Boolean(process.env.ANTHROPIC_API_KEY);
  },

  async run(prompt, model): Promise<EngineResult> {
    const started = Date.now();
    const usedModel = model ?? process.env.ANTHROPIC_MODEL ?? this.defaultModel;
    const data = (await postJson(
      "anthropic",
      "https://api.anthropic.com/v1/messages",
      {
        "x-api-key": process.env.ANTHROPIC_API_KEY ?? "",
        "anthropic-version": "2023-06-01",
      },
      {
        model: usedModel,
        max_tokens: 1024,
        messages: [{ role: "user", content: prompt }],
      },
    )) as AnthropicResponse;

    const text = (data.content ?? [])
      .filter((b) => b.type === "text")
      .map((b) => b.text ?? "")
      .join("");
    if (!text) throw new Error("Anthropic returned an empty response");
    return { text, model: usedModel, latencyMs: Date.now() - started };
  },
};
