# Local models

aeoscope can query models running on your own machine - no API keys, no data leaving your network. Two ways to connect:

## Ollama (zero configuration)

1. Install [Ollama](https://ollama.com) and pull a model:

   ```bash
   ollama pull llama3.2
   ```

2. Enable the **Ollama** engine in aeoscope's Settings. That is it - aeoscope talks to Ollama's default address (`http://127.0.0.1:11434`).

To use a different model, set it in your `.env`:

```bash
OLLAMA_MODEL=qwen2.5
```

## LM Studio, llama.cpp, vLLM, and everything else

Almost every local inference server exposes an OpenAI-compatible API. The **Custom** engine speaks that format, so one setting covers all of them.

**LM Studio:** load a model, then start the server from the *Developer* tab (default port 1234):

```bash
CUSTOM_BASE_URL=http://localhost:1234/v1
```

**llama.cpp server:**

```bash
CUSTOM_BASE_URL=http://localhost:8080/v1
```

**vLLM:**

```bash
CUSTOM_BASE_URL=http://localhost:8000/v1
```

**Ollama** also has an OpenAI-compatible endpoint, if you prefer to use it through the custom engine:

```bash
CUSTOM_BASE_URL=http://localhost:11434/v1
```

Then set the variables in your `.env`, restart aeoscope, and enable the **Custom** engine in Settings:

```bash
CUSTOM_BASE_URL=http://localhost:1234/v1
CUSTOM_MODEL=google/gemma-4-e4b  # the model's identifier in your server (see below)
CUSTOM_API_KEY=                  # only if your server requires a key
```

Set `CUSTOM_MODEL` to the exact identifier of a loaded model - in LM Studio you can find it in the *Developer* tab's server view or via `lms ls` (e.g. `google/gemma-4-e4b`, `qwen/qwen3.5-9b`). If unset, aeoscope sends `local-model`, which servers that always answer with their loaded model accept, but LM Studio can reject when it does not match.

## Running aeoscope in Docker

When aeoscope runs in Docker (`docker compose up`) and your model server runs directly on your machine, `localhost` inside the container refers to the container itself - not your machine. Point the base URL at the host using Docker's special `host.docker.internal` name:

| Server | On your machine | From aeoscope in Docker |
| --- | --- | --- |
| LM Studio | `http://localhost:1234/v1` | `http://host.docker.internal:1234/v1` |
| llama.cpp server | `http://localhost:8080/v1` | `http://host.docker.internal:8080/v1` |
| vLLM | `http://localhost:8000/v1` | `http://host.docker.internal:8000/v1` |
| Ollama | `http://localhost:11434` (Ollama engine) or `:11434/v1` (Custom engine) | `http://host.docker.internal:11434` or `:11434/v1` |

Two things make this painless:

- **A `localhost` URL still works.** When a request to a loopback address fails, aeoscope automatically retries once via `host.docker.internal` and logs a warning with the URL to set. Prefer the correct URL so the failed attempt is skipped.
- **Linux needs one extra toggle.** On Docker Desktop (Windows/macOS) everything above works as-is. On Linux, the provided `docker-compose.yml` maps `host.docker.internal` to the host, but a server bound to `127.0.0.1` only listens on loopback - enable its "serve on local network" option (bind to `0.0.0.0`) so Docker can reach it.

After changing `.env`, recreate the container with `docker compose up -d` - the container only reads environment variables when it is created.

## What local models can and cannot tell you

- **Hosted engines with web access** (Perplexity especially) show what real users actually see when they ask about your category. That is the core AEO signal.
- **Local models** have no web access and fixed training data. They give you offline, zero-cost, unlimited-rate signals - useful for testing pipelines, comparing prompt phrasings, and keeping scheduled runs running cheaply between hosted checks.

Use both: local engines for volume, hosted engines for truth.
