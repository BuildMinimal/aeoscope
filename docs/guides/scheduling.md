# Scheduling

aeoscope can run your prompt sets automatically, so your visibility data accumulates without you pressing anything.

## Built-in scheduler

1. Open a prompt set (or create one) and give it a **cron expression**, e.g.:

   ```
   0 9 * * *
   ```

2. Save. The built-in scheduler picks it up immediately - no restart needed.

Cron expressions use the standard five fields (minute, hour, day of month, month, day of week) in **UTC**. Common examples:

| Expression | Meaning |
| --- | --- |
| `0 9 * * *` | every day at 09:00 UTC |
| `0 */6 * * *` | every 6 hours |
| `0 9 * * 1` | Mondays at 09:00 UTC |

Sets with a schedule can be paused with the **Pause** button; the schedule stays saved.

## External cron

If you prefer your own scheduler (system crontab, Kubernetes cron, or a platform like Vercel), disable the built-in one and call the cron endpoint yourself:

1. In `.env`:

   ```bash
   AEOSCOPE_SCHEDULER=off
   CRON_SECRET=some-long-random-string
   ```

2. Trigger runs externally:

   ```bash
   curl -X POST https://your-aeoscope.example.com/api/cron \
        -H "x-cron-secret: some-long-random-string"
   ```

This runs every enabled prompt set that has a schedule. The endpoint refuses to serve if `CRON_SECRET` is not set.
