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
CUSTOM_MODEL=local-model      # optional; LM Studio serves the loaded model
CUSTOM_API_KEY=               # only if your server requires a key
```

::: tip
If aeoscope itself runs in Docker, `localhost` inside the container is the container - not your machine. Point at your host instead, e.g. `http://host.docker.internal:1234/v1` (works on Docker Desktop for Windows and macOS).
:::

## What local models can and cannot tell you

- **Hosted engines with web access** (Perplexity especially) show what real users actually see when they ask about your category. That is the core AEO signal.
- **Local models** have no web access and fixed training data. They give you offline, zero-cost, unlimited-rate signals - useful for testing pipelines, comparing prompt phrasings, and keeping scheduled runs running cheaply between hosted checks.

Use both: local engines for volume, hosted engines for truth.
