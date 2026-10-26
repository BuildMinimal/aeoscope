import { db } from "@/lib/db";
import { competitors, runs } from "@/lib/db/schema";
import { and, desc, eq, gte } from "drizzle-orm";

export interface ScoreRow {
  total: number;
  mentioned: number;
  /** 0..1 */
  score: number;
}

function score(rows: { mentioned: boolean | null }[]): ScoreRow {
  const total = rows.length;
  const mentioned = rows.filter((r) => r.mentioned).length;
  return { total, mentioned, score: total > 0 ? mentioned / total : 0 };
}

const DAY_MS = 86_400_000;

/** Aggregates the last 30 days of successful runs for the dashboard. */
export async function getDashboardStats() {
  const since = new Date(Date.now() - 30 * DAY_MS);
  const successful = await db
    .select()
    .from(runs)
    .where(and(eq(runs.status, "success"), gte(runs.createdAt, since)))
    .orderBy(desc(runs.createdAt));

  const overall = score(successful);

  const byEngine = new Map<string, { mentioned: boolean | null }[]>();
  for (const r of successful) {
    const list = byEngine.get(r.engine) ?? [];
    list.push(r);
    byEngine.set(r.engine, list);
  }
  const perEngine = [...byEngine.entries()]
    .map(([engine, list]) => ({ engine, ...score(list) }))
    .sort((a, b) => b.score - a.score);

  // 14-day series, zero-filled so gaps in the data show as gaps
  const perDay: { date: string; total: number; mentioned: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const key = new Date(Date.now() - i * DAY_MS).toISOString().slice(0, 10);
    perDay.push({ date: key, total: 0, mentioned: 0 });
  }
  const dayIndex = new Map(perDay.map((d, i) => [d.date, i]));
  for (const r of successful) {
    const i = dayIndex.get(new Date(r.createdAt).toISOString().slice(0, 10));
    if (i !== undefined) {
      perDay[i].total++;
      if (r.mentioned) perDay[i].mentioned++;
    }
  }

  const comps = await db.select().from(competitors);
  const share = comps
    .map((c) => ({
      id: c.id,
      name: c.name,
      mentioned: successful.filter((r) => {
        const m = r.competitorMentions as Record<string, boolean> | null;
        return m?.[c.id] === true;
      }).length,
    }))
    .sort((a, b) => b.mentioned - a.mentioned);

  const citationsToYou = successful.filter((r) => r.citedOwnDomain).length;
  const recent = successful.slice(0, 5);

  return { overall, perEngine, perDay, share, citationsToYou, recent };
}
