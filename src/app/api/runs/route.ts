import { db } from "@/lib/db";
import { runs } from "@/lib/db/schema";
import { jsonError, readJson } from "@/lib/http";
import { getSettings, runPromptSet, usableEngines } from "@/lib/runs";
import { desc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const promptSetId = url.searchParams.get("promptSetId");
    const limit = Math.min(Number(url.searchParams.get("limit") ?? 50) || 50, 500);

    const base = db.select().from(runs);
    const rows = promptSetId
      ? await base
          .where(eq(runs.promptSetId, promptSetId))
          .orderBy(desc(runs.createdAt))
          .limit(limit)
      : await base.orderBy(desc(runs.createdAt)).limit(limit);

    return Response.json({ runs: rows });
  } catch (err) {
    return jsonError(err);
  }
}

/**
 * Triggers a run of a prompt set against all usable engines.
 * Runs sequentially and returns when done; large sets can take a while.
 */
export async function POST(req: Request) {
  try {
    const body = await readJson(req);
    const promptSetId =
      typeof body.promptSetId === "string" ? body.promptSetId : "";
    if (!promptSetId) return Response.json({ error: "promptSetId is required" }, { status: 400 });

    const s = await getSettings();
    const engines = usableEngines(s.enabledEngines);
    if (engines.length === 0) {
      return Response.json(
        {
          error:
            "no engines available. Add an API key in .env and enable the engine in settings.",
        },
        { status: 400 },
      );
    }

    const result = await runPromptSet(promptSetId, engines);
    return Response.json(result);
  } catch (err) {
    return jsonError(err);
  }
}
