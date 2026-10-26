import { db } from "@/lib/db";
import { competitors, prompts, promptSets, runs, settings } from "@/lib/db/schema";
import { asc, eq } from "drizzle-orm";
import { ENGINES } from "@/lib/engines";
import type { EngineId } from "@/lib/engines/types";
import { detectMentions } from "@/lib/detection";

/** Returns the singleton settings row, creating it on first access. */
export async function getSettings() {
  const rows = await db.select().from(settings).limit(1);
  if (rows.length > 0) return rows[0];
  const [created] = await db.insert(settings).values({}).returning();
  return created;
}

/** Engines a run should use: what the user enabled, that is also configured. */
export function usableEngines(enabled: string[]): EngineId[] {
  const enabledIds = (enabled.length > 0
    ? enabled
    : Object.keys(ENGINES)
  ) as EngineId[];
  return enabledIds.filter((id) => ENGINES[id]?.isConfigured());
}

/**
 * Executes every prompt in a set against the given engines, detects
 * mentions/citations, and stores one run row per (prompt, engine) pair.
 * Sequential on purpose: keeps self-hosters friendly with provider rate limits.
 */
export async function runPromptSet(promptSetId: string, engineIds: EngineId[]) {
  const set = (
    await db.select().from(promptSets).where(eq(promptSets.id, promptSetId)).limit(1)
  )[0];
  if (!set) throw new Error(`prompt set ${promptSetId} not found`);

  const setPrompts = await db
    .select()
    .from(prompts)
    .where(eq(prompts.promptSetId, promptSetId))
    .orderBy(asc(prompts.position), asc(prompts.createdAt));
  if (setPrompts.length === 0) throw new Error("prompt set has no prompts");

  const s = await getSettings();
  const comps = await db.select().from(competitors);

  const brandAliases = [s.brandName, ...s.brandAliases].filter(Boolean);
  let stored = 0;

  for (const p of setPrompts) {
    for (const engineId of engineIds) {
      const adapter = ENGINES[engineId];
      const base = {
        promptId: p.id,
        promptSetId: set.id,
        promptText: p.text,
        engine: engineId,
      };

      if (!adapter) continue;

      if (!adapter.isConfigured()) {
        await db.insert(runs).values({
          ...base,
          status: "error",
          error: `${adapter.apiKeyEnv} is not set`,
        });
        stored++;
        continue;
      }

      try {
        const result = await adapter.run(p.text);
        const detection = detectMentions({
          text: result.text,
          brandAliases,
          ownDomain: s.domain,
          competitors: comps.map((c) => ({ id: c.id, aliases: [c.name, ...c.aliases] })),
          adapterCitations: result.citations,
        });
        await db.insert(runs).values({
          ...base,
          model: result.model,
          status: "success",
          responseText: result.text,
          latencyMs: result.latencyMs,
          ...detection,
        });
        stored++;
      } catch (err) {
        await db.insert(runs).values({
          ...base,
          status: "error",
          error: err instanceof Error ? err.message : String(err),
        });
        stored++;
      }
    }
  }

  return { stored, prompts: setPrompts.length, engines: engineIds.length };
}
