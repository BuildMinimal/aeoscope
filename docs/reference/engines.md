# Engines

An *engine* is one AI provider aeoscope queries. Each run stores one answer per (prompt, engine) pair, so you can compare engines side by side.

| Engine | Setup | Web access | Citations | Notes |
| --- | --- | --- | --- | --- |
| Mock | none | no | simulated | canned answer for trying aeoscope out |
| OpenAI (ChatGPT) | `OPENAI_API_KEY` | no | from answer text | general assistant answers |
| Perplexity | `PERPLEXITY_API_KEY` | yes | structured + from text | closest to AI search; recommended core signal |
| Gemini | `GEMINI_API_KEY` | optional (`GEMINI_SEARCH=true`) | with grounding | Google Search grounding returns live sources as citations |
| Anthropic (Claude) | `ANTHROPIC_API_KEY` | no | from answer text | |
| Ollama | running Ollama, no key | no | from answer text | local, zero cost |
| Custom | `CUSTOM_BASE_URL` | depends | from answer text | any OpenAI-compatible server (LM Studio, llama.cpp, vLLM, ...) |

## How detection works

For every stored answer aeoscope detects:

- **Mention** - does the answer contain your brand name or any alias? (case-insensitive, word-bounded, plural-tolerant)
- **Position** - where the first mention occurs, as a percentage into the answer
- **Citations** - every URL in the answer, plus structured citations the engine reports (Perplexity)
- **Own domain cited** - whether any citation is on your domain or a subdomain
- **Competitor mentions** - which of your competitors appear in the same answer

::: warning
Hosted chat models answer from training data, not live search (Perplexity excepted). Treat non-Perplexity hosted engines as "brand awareness in the model" rather than live search visibility. [Local models](/guides/local-models) are one step further removed.
:::

## Adding a new engine

Engines are small TypeScript adapters in `src/lib/engines/`. Implement the `EngineAdapter` interface (an `id`, a label, `isConfigured()`, and a `run(prompt)` that returns text plus optional citations), register it in `src/lib/engines/index.ts`, and add the engine id to the `EngineId` union in `types.ts`. PRs welcome.
