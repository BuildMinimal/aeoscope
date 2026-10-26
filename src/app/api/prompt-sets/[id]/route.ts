import { db } from "@/lib/db";
import { promptSets, prompts } from "@/lib/db/schema";
import { asStringArray, jsonError, readJson } from "@/lib/http";
import { scheduleSet, unscheduleSet } from "@/lib/scheduler";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await readJson(req);

    const [row] = await db
      .update(promptSets)
      .set({
        name: typeof body.name === "string" && body.name.trim() ? body.name.trim() : undefined,
        description:
          body.description !== undefined
            ? typeof body.description === "string"
              ? body.description
              : null
            : undefined,
        schedule:
          body.schedule !== undefined
            ? typeof body.schedule === "string" && body.schedule.trim()
              ? body.schedule.trim()
              : null
            : undefined,
        enabled: typeof body.enabled === "boolean" ? body.enabled : undefined,
      })
      .where(eq(promptSets.id, id))
      .returning();
    if (!row) return Response.json({ error: "not found" }, { status: 404 });

    if (body.prompts !== undefined) {
      const promptTexts = asStringArray(body.prompts);
      await db.delete(prompts).where(eq(prompts.promptSetId, id));
      if (promptTexts.length > 0) {
        await db.insert(prompts).values(
          promptTexts.map((text, i) => ({ promptSetId: id, text, position: i })),
        );
      }
    }

    if (row.enabled && row.schedule) {
      await scheduleSet(row.id, row.schedule);
    } else {
      unscheduleSet(row.id);
    }

    return Response.json({ promptSet: row });
  } catch (err) {
    return jsonError(err);
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await db.delete(promptSets).where(eq(promptSets.id, id));
    unscheduleSet(id);
    return Response.json({ ok: true });
  } catch (err) {
    return jsonError(err);
  }
}
