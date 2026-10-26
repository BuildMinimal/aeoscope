import { db } from "@/lib/db";
import { competitors } from "@/lib/db/schema";
import { asStringArray, jsonError, readJson } from "@/lib/http";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await readJson(req);
    const [row] = await db
      .update(competitors)
      .set({
        name: typeof body.name === "string" && body.name.trim() ? body.name.trim() : undefined,
        aliases: body.aliases !== undefined ? asStringArray(body.aliases) : undefined,
        domain:
          body.domain !== undefined
            ? typeof body.domain === "string" && body.domain.trim()
              ? body.domain.trim()
              : null
            : undefined,
      })
      .where(eq(competitors.id, id))
      .returning();
    if (!row) return Response.json({ error: "not found" }, { status: 404 });
    return Response.json({ competitor: row });
  } catch (err) {
    return jsonError(err);
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await db.delete(competitors).where(eq(competitors.id, id));
    return Response.json({ ok: true });
  } catch (err) {
    return jsonError(err);
  }
}
