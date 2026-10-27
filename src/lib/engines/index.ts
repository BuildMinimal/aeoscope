import { EngineAdapter, EngineId } from "./types";
import { openai } from "./openai";
import { perplexity } from "./perplexity";
import { gemini } from "./gemini";
import { anthropic } from "./anthropic";
import { ollama } from "./ollama";
import { mock } from "./mock";

export const ENGINES: Record<EngineId, EngineAdapter> = {
  openai,
  perplexity,
  gemini,
  anthropic,
  ollama,
  mock,
};

export function listEngines() {
  return Object.values(ENGINES).map((e) => ({
    id: e.id,
    label: e.label,
    defaultModel: e.defaultModel,
    apiKeyEnv: e.apiKeyEnv,
    configured: e.isConfigured(),
  }));
}
