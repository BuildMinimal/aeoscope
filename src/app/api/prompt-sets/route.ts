import { db } from "@/lib/db";
import { promptSets, prompts } from "@/lib/db/schema";
import { asStringArray, jsonError, readJson, requireString } from "@/lib/http";
import { scheduleSet } from "@/lib/scheduler";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const sets = await db.select().from(promptSets).orderBy(desc(promptSets.createdAt));
    const allPrompts = await db.select().from(prompts).orderBy(prompts.position);
    return Response.json({
      promptSets: sets.map((s) => ({
        ...s,
        prompts: allPrompts.filter((p) => p.promptSetId === s.id),
      })),
    });
  } catch (err) {
    return jsonError(err);
  }
}

export async function POST(req: Request) {
  try {
    const body = await readJson(req);
    const promptTexts = asStringArray(body.prompts);
    if (promptTexts.length === 0) throw new Error("at least one prompt is required");

    const [set] = await db
      .insert(promptSets)
      .values({
        name: requireString(body.name, "name"),
        description: typeof body.description === "string" ? body.description : null,
        schedule: typeof body.schedule === "string" && body.schedule.trim() ? body.schedule.trim() : null,
      })
      .returning();

    await db.insert(prompts).values(
      promptTexts.map((text, i) => ({
        promptSetId: set.id,
        text,
        position: i,
      })),
    );

    if (set.schedule) await scheduleSet(set.id, set.schedule);

    return Response.json({ promptSet: { ...set, prompts: promptTexts } }, { status: 201 });
  } catch (err) {
    return jsonError(err);
  }
}
