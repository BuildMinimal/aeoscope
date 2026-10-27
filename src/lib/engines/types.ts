export type EngineId =
  | "openai"
  | "perplexity"
  | "gemini"
  | "anthropic"
  | "ollama"
  | "custom"
  | "mock";

export interface EngineResult {
  text: string;
  model: string;
  latencyMs: number;
  /** Structured citations the engine reports alongside the answer (e.g. Perplexity search results). */
  citations?: string[];
}

export interface EngineAdapter {
  id: EngineId;
  label: string;
  defaultModel: string;
  /** Environment variable holding the API key for this engine. */
  apiKeyEnv: string;
  isConfigured(): boolean;
  run(prompt: string, model?: string): Promise<EngineResult>;
}

export class EngineError extends Error {
  constructor(
    public engine: EngineId,
    public status: number | undefined,
    message: string,
  ) {
    super(message);
    this.name = "EngineError";
  }
}

export async function postJson(
  engine: EngineId,
  url: string,
  headers: Record<string, string>,
  body: unknown,
) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(90_000),
  });
  if (!res.ok) {
    const snippet = (await res.text()).slice(0, 300);
    throw new EngineError(engine, res.status, `HTTP ${res.status}: ${snippet}`);
  }
  return res.json() as Promise<Record<string, unknown>>;
}
