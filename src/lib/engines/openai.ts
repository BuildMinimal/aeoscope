import { EngineAdapter, EngineResult, postJson } from "./types";

interface OpenAIResponse {
  choices?: { message?: { content?: string } }[];
}

export const openai: EngineAdapter = {
  id: "openai",
  label: "OpenAI (ChatGPT)",
  defaultModel: "gpt-4o-mini",
  apiKeyEnv: "OPENAI_API_KEY",

  isConfigured() {
    return Boolean(process.env.OPENAI_API_KEY);
  },

  async run(prompt, model): Promise<EngineResult> {
    const started = Date.now();
    const usedModel = model ?? process.env.OPENAI_MODEL ?? this.defaultModel;
    const data = (await postJson(
      "openai",
      "https://api.openai.com/v1/chat/completions",
      { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      {
        model: usedModel,
        messages: [{ role: "user", content: prompt }],
      },
    )) as OpenAIResponse;

    const text = data.choices?.[0]?.message?.content ?? "";
    if (!text) throw new Error("OpenAI returned an empty response");
    return { text, model: usedModel, latencyMs: Date.now() - started };
  },
};
