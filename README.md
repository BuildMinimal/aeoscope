# aeoscope

> Open-source, self-hosted AI visibility tracker (GEO/AEO). Find out whether ChatGPT, Perplexity, Gemini, Claude, and Google AI Overviews mention and cite your brand — before your competitors do.

**Status:** 🚧 work in progress — MVP in active development.

---

## Why

Search is shifting from ten blue links to AI answers. Buyers increasingly ask ChatGPT, Perplexity, and Gemini "best [category] tool" — and if your product isn't in those answers, it doesn't exist. **GEO/AEO** (Generative Engine Optimization / AI Engine Optimization) is the practice of tracking and improving that visibility.

aeoscope is the open-source, self-hosted alternative to commercial platforms like Profound, Peec AI, and Otterly:

- **Self-hosted** — your data stays yours
- **BYOK** — bring your own API keys; query AI providers directly at cost, no markup
- **MIT licensed**

## How it works

1. **Define** your brand, competitors, and a prompt set (e.g. "best CRM for startups", "top project management tools")
2. **Schedule** aeoscope to query your chosen AI engines on those prompts (cron or manual "Run now")
3. **Detect** whether each response mentions your brand, cites your domain, in what position, and with what sentiment
4. **Visualize** your visibility score over time, per engine, per prompt — plus competitor share-of-voice

## Features (in development)

- Workspace setup: brand name, aliases, competitor list, domains
- Prompt set management (CRUD, grouping/tags)
- Provider adapters: OpenAI (ChatGPT), Perplexity, Gemini, Anthropic (Claude) — BYOK
- Scheduled runs + manual trigger, run history
- Mention/citation detection: exact + fuzzy brand matching, cited-URL extraction
- Dashboard: visibility score over time, per-engine breakdown, per-prompt results
- One-command deploy: `docker compose up` (app + Postgres)

## Tech stack

TypeScript · Next.js · Postgres · Docker

## Getting started

Documentation will ship with the first release. Planned quick start:

```bash
git clone https://github.com/buildminimal/aeoscope.git
cd aeoscope
cp .env.example .env   # add your AI provider API keys
docker compose up -d
```

## Contributing

Contributions are welcome. Once the MVP lands, open an issue before submitting large changes.

## License

[MIT](LICENSE)
