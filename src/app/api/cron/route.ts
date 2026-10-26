import { db } from "@/lib/db";
import { promptSets } from "@/lib/db/schema";
import { jsonError } from "@/lib/http";
import { trigger } from "@/lib/scheduler";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * For external schedulers (Vercel cron, system crontab, etc.):
 * runs every enabled prompt set that has a cron expression.
 * Protect it by setting CRON_SECRET and sending it as the x-cron-secret header.
 */
export async function POST(req: Request) {
  try {
    const secret = process.env.CRON_SECRET;
    if (!secret) {
      return Response.json(
        { error: "CRON_SECRET is not set; this endpoint is disabled" },
        { status: 403 },
      );
    }
    if (req.headers.get("x-cron-secret") !== secret) {
      return Response.json({ error: "unauthorized" }, { status: 401 });
    }

    const sets = await db.select().from(promptSets);
    const scheduled = sets.filter((s) => s.enabled && s.schedule);
    await Promise.all(scheduled.map((s) => trigger(s.id)));
    return Response.json({ triggered: scheduled.length });
  } catch (err) {
    return jsonError(err);
  }
}
