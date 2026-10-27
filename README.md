# aeoscope

> Open-source, self-hosted AI visibility tracker (GEO/AEO). Find out whether ChatGPT, Perplexity, Gemini, Claude, and Google AI Overviews mention and cite your brand - before your competitors do.

**Status:** MVP - API and UI may still change.

---

## Why

Search is shifting from ten blue links to AI answers. Buyers increasingly ask ChatGPT, Perplexity, and Gemini "best [category] tool" - and if your product isn't in those answers, it doesn't exist. **GEO/AEO** (Generative Engine Optimization / AI Engine Optimization) is the practice of tracking and improving that visibility.

aeoscope is the open-source, self-hosted alternative to commercial platforms like Profound, Peec AI, and Otterly:

- **Self-hosted** - your data stays yours
- **BYOK** - bring your own API keys; query AI providers directly at cost, no markup
- **MIT licensed**

## How it works

1. **Define** your brand, competitors, and a prompt set (e.g. "best CRM for startups", "top project management tools")
2. **Schedule** aeoscope to query your chosen AI engines on those prompts (cron or manual "Run now")
3. **Detect** whether each response mentions your brand and cites your domain, and where competitors appear
4. **Visualize** your visibility score over time, per engine, per prompt - plus competitor share-of-voice

## Features

- Brand setup: name, aliases, website domain, competitor list
- Prompt set management with optional cron scheduling
- Provider adapters: OpenAI (ChatGPT), Perplexity, Gemini, Anthropic (Claude) - BYOK
- Local models via [Ollama](https://ollama.com) - no API keys, runs fully offline
- Manual trigger, run history, and a built-in scheduler
- Mention/citation detection: case-insensitive alias matching, cited-URL extraction, competitor share-of-voice
- Dashboard: visibility score over time, per-engine breakdown, share of voice
- Mock engine so you can try everything without a single API key
- One-command deploy: `docker compose up` (app + Postgres)

## Tech stack

TypeScript · Next.js · Postgres · Docker

## Getting started

Requirements: [Docker](https://docs.docker.com/get-docker/). (Node 22+ and a Postgres database also work - see Development below.)

```bash
git clone https://github.com/buildminimal/aeoscope.git
cd aeoscope
cp .env.example .env   # optional: add your AI provider API keys
docker compose up -d
```

Then open **http://localhost:3000**:

1. **Settings** - enter your brand name, aliases, domain, and enable engines
2. **Prompt sets** - add the questions buyers ask (e.g. "best crm for startups")
3. **Runs** - trigger a run and watch results come in

No API keys yet? Enable the **mock engine** - it simulates answers so you can explore the full workflow for free.

### Local models (Ollama)

aeoscope can also query models running on your own machine through [Ollama](https://ollama.com) - no API keys, no data leaving your network:

```bash
ollama pull llama3.2
```

Then enable the **Ollama** engine in Settings. Change the model with `OLLAMA_MODEL` in your `.env`. Keep in mind: hosted engines show what real users see in ChatGPT or Perplexity, while local models give you offline, zero-cost signals - they do not have web access.

### Scheduling

Give a prompt set a cron expression (e.g. `0 9 * * *`) and the built-in scheduler runs it automatically. Where a persistent scheduler is not possible, set `AEOSCOPE_SCHEDULER=off` and call `POST /api/cron` from an external cron, authenticated with the `x-cron-secret` header (set `CRON_SECRET` in your env).

### Development

```bash
npm install
npm run db:migrate   # apply migrations to your Postgres
npm run dev
```

Engines are queried through their official APIs with your own keys; default models can be overridden per engine in `.env` (see `.env.example`).

## Contributing

Contributions are welcome. Open an issue before submitting large changes.

## License

[MIT](LICENSE)
