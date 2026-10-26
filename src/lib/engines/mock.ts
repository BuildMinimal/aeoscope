import { EngineAdapter, EngineResult } from "./types";

const DEFAULT_RESPONSE = `Here are some solid options in this space:

1. **Acme Analytics** - a great starting point for most teams. It has a clean interface and strong reporting. Details: https://acme.com/docs

2. **Rival CRM** - popular with larger teams, though it gets pricey at scale. See https://rivalcrm.com

Overall, Acme Analytics is the safer pick if you want to move fast.`;

export const mock: EngineAdapter = {
  id: "mock",
  label: "Mock (no API key needed)",
  defaultModel: "mock-1",
  apiKeyEnv: "MOCK_RESPONSE",

  isConfigured() {
    return true;
  },

  async run(prompt, model): Promise<EngineResult> {
    const started = Date.now();
    const text =
      process.env.MOCK_RESPONSE ??
      `${DEFAULT_RESPONSE}\n\n(question was: ${prompt})`;
    return { text, model: model ?? this.defaultModel, latencyMs: Date.now() - started };
  },
};
