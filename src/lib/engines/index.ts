import { EngineAdapter, EngineId } from "./types";
import { openai } from "./openai";
import { perplexity } from "./perplexity";

export const ENGINES: Record<EngineId, EngineAdapter> = {
  openai,
  perplexity,
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
