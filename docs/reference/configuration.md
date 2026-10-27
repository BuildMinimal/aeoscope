# Configuration

All configuration is done through environment variables (`.env` in the project root, or your process manager / `docker compose` environment).

## Database

| Variable | Default | Description |
| --- | --- | --- |
| `DATABASE_URL` | `postgresql://aeoscope:aeoscope@localhost:5432/aeoscope` | Postgres connection string |

The app applies its migrations automatically on startup.

## Engine API keys (BYOK)

Each hosted engine is enabled by setting its key; engines without a key are shown as unavailable in Settings.

| Variable | Enables |
| --- | --- |
| `OPENAI_API_KEY` | OpenAI (ChatGPT) |
| `PERPLEXITY_API_KEY` | Perplexity |
| `GEMINI_API_KEY` | Google Gemini |
| `ANTHROPIC_API_KEY` | Anthropic (Claude) |

The **mock** engine needs no key.

## Model overrides

Every engine has a sensible default model. Override per engine:

| Variable | Default |
| --- | --- |
| `OPENAI_MODEL` | `gpt-4o-mini` |
| `PERPLEXITY_MODEL` | `sonar` |
| `GEMINI_MODEL` | `gemini-3.8-flash` |
| `GEMINI_SEARCH` | off - set `true` to ground Gemini in live Google Search (adds source citations, billed by Google beyond its free tier) |
| `ANTHROPIC_MODEL` | `claude-sonnet-4-5` |
| `OLLAMA_MODEL` | `llama3.2` |
| `CUSTOM_MODEL` | `local-model` |

## Local servers

| Variable | Default | Description |
| --- | --- | --- |
| `OLLAMA_BASE_URL` | `http://127.0.0.1:11434` | Ollama address |
| `CUSTOM_BASE_URL` | - | OpenAI-compatible base URL, e.g. `http://localhost:1234/v1` for LM Studio. Setting it enables the Custom engine |
| `CUSTOM_API_KEY` | - | Only needed if your server requires auth |

See [Local models](/guides/local-models) for per-tool examples.

## Scheduler and cron endpoint

| Variable | Default | Description |
| --- | --- | --- |
| `CRON_SECRET` | - | Protects `POST /api/cron`. The endpoint is disabled when unset |
| `AEOSCOPE_SCHEDULER` | on | Set to `off` to disable the built-in scheduler |

See [Scheduling](/guides/scheduling).
