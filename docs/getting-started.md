# Getting started

aeoscope tracks whether AI engines mention and cite your brand. The core loop:

1. **Define** your brand, aliases, domain, and competitors in *Settings*
2. **Create a prompt set** with the questions buyers ask (e.g. "best crm for startups")
3. **Run** it against your chosen engines and watch the dashboard fill in
4. **Schedule** it with a cron expression so data accumulates daily

## Install with Docker (recommended)

Requirements: [Docker](https://docs.docker.com/get-docker/).

```bash
git clone https://github.com/buildminimal/aeoscope.git
cd aeoscope
cp .env.example .env   # optional: add your AI provider API keys
docker compose up -d
```

Open `http://localhost:3000`. The app applies its database migrations on startup - there is nothing else to set up.

::: tip Planning to use local AI servers (LM Studio, Ollama)?
If the app runs in Docker and your model server runs directly on your machine, `localhost` inside the container is not your machine - point the engine's base URL at `http://host.docker.internal:<port>` instead (e.g. `:1234` for LM Studio, `:11434` for Ollama). See [Local models](/guides/local-models#running-aeoscope-in-docker).
:::

## Install without Docker

Requirements: Node 22+ and a Postgres database.

```bash
git clone https://github.com/buildminimal/aeoscope.git
cd aeoscope
npm install
cp .env.example .env   # set DATABASE_URL to your Postgres
npm run db:migrate
npm run dev:next
```

## First run without any API keys

You do not need a single API key to try aeoscope:

1. In **Settings**, enter your brand name, an alias or two, your domain, and enable the **Mock** engine
2. In **Prompt sets**, create a set with one or two prompts
3. In **Runs**, press **Run now**

The mock engine returns a canned answer that mentions a sample brand, so you can see mentions, citations, and the dashboard working end to end.

## Add real engines

Enable the engines you want in **Settings** - each one only needs its API key in your `.env` file:

| Engine | Environment variable |
| --- | --- |
| OpenAI (ChatGPT) | `OPENAI_API_KEY` |
| Perplexity | `PERPLEXITY_API_KEY` |
| Google Gemini | `GEMINI_API_KEY` |
| Anthropic (Claude) | `ANTHROPIC_API_KEY` |
| Ollama (local) | nothing - see [Local models](/guides/local-models) |
| Custom OpenAI-compatible | `CUSTOM_BASE_URL` - see [Local models](/guides/local-models) |

::: tip
Perplexity is the strongest signal for AI search visibility: it searches the web before answering, which is closest to what a real user sees. Local models are offline and free, but do not have web access.
:::

## What the dashboard shows

- **Visibility score** - the share of answers (last 30 days) that mention your brand
- **Daily sparkline** - the last 14 days at a glance
- **Per engine** - your score on each engine separately
- **Share of voice** - how often competitors appear alongside you
- **Citations** - how many answers linked to your domain
