import cron from "node-cron";
import { db } from "@/lib/db";
import { promptSets } from "@/lib/db/schema";
import { getSettings, runPromptSet, usableEngines } from "@/lib/runs";
import type { EngineId } from "@/lib/engines/types";

const jobs = new Map<string, cron.ScheduledTask>();
const inFlight = new Set<string>();

async function trigger(setId: string) {
  if (inFlight.has(setId)) return; // previous run still going
  inFlight.add(setId);
  try {
    const s = await getSettings();
    const engines = usableEngines(s.enabledEngines);
    if (engines.length === 0) return;
    await runPromptSet(setId, engines);
  } catch (err) {
    console.error(`[scheduler] run of ${setId} failed:`, err);
  } finally {
    inFlight.delete(setId);
  }
}

export async function scheduleSet(setId: string, expression: string) {
  if (!cron.validate(expression)) return false;
  unscheduleSet(setId);
  const task = cron.schedule(expression, () => void trigger(setId));
  jobs.set(setId, task);
  return true;
}

export function unscheduleSet(setId: string) {
  jobs.get(setId)?.stop();
  jobs.delete(setId);
}

/** (Re)schedules every enabled prompt set that has a cron expression. */
export async function scheduleAll() {
  const sets = await db.select().from(promptSets);
  for (const set of sets) {
    if (set.enabled && set.schedule) {
      await scheduleSet(set.id, set.schedule);
    } else {
      unscheduleSet(set.id);
    }
  }
}
