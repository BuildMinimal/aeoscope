# HTTP API

All endpoints are JSON in / JSON out. The same API the UI uses, so you can automate aeoscope from scripts.

## Settings

### `GET /api/settings`

Returns the workspace settings and which engines are available:

```json
{
  "settings": {
    "brandName": "Acme Analytics",
    "brandAliases": ["Acme"],
    "domain": "acme.com",
    "enabledEngines": ["mock"]
  },
  "engines": [
    { "id": "openai", "label": "OpenAI (ChatGPT)", "configured": true, "apiKeyEnv": "OPENAI_API_KEY" }
  ]
}
```

### `PUT /api/settings`

Update settings. `brandAliases` and `enabledEngines` accept arrays or comma-separated strings.

```json
{
  "brandName": "Acme Analytics",
  "brandAliases": "Acme, AcmeAnalytics",
  "domain": "acme.com",
  "enabledEngines": ["mock", "perplexity"]
}
```

## Competitors

- `GET /api/competitors` - list
- `POST /api/competitors` - create: `{ "name": "Rival CRM", "aliases": "Rival", "domain": "rivalcrm.com" }`
- `PUT /api/competitors/:id` - update (partial)
- `DELETE /api/competitors/:id` - remove

## Prompt sets

- `GET /api/prompt-sets` - list, each with its prompts
- `POST /api/prompt-sets` - create: `{ "name": "Category queries", "prompts": "best crm for startups\ntop pm tools", "schedule": "0 9 * * *" }`
- `PUT /api/prompt-sets/:id` - update fields and/or replace prompts (send `prompts` as a newline-separated string)
- `DELETE /api/prompt-sets/:id` - remove (run history is kept)

## Runs

### `GET /api/runs?limit=50&promptSetId=...`

Recent runs, newest first. Each run includes `engine`, `status`, `responseText`, `mentioned`, `mentionPosition`, `citations`, `citedOwnDomain`, and `competitorMentions`.

### `POST /api/runs`

Trigger a run of a whole prompt set against all enabled, configured engines. Runs sequentially; can take a while for large sets.

```json
{ "promptSetId": "..." }
```

## Cron trigger

### `POST /api/cron`

Runs every enabled prompt set that has a schedule. Requires the `x-cron-secret` header matching `CRON_SECRET`; disabled when `CRON_SECRET` is unset. See [Scheduling](/guides/scheduling).
