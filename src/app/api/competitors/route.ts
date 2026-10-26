import { db } from "@/lib/db";
import { competitors } from "@/lib/db/schema";
import { asStringArray, jsonError, readJson, requireString } from "@/lib/http";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await db.select().from(competitors).orderBy(desc(competitors.createdAt));
    return Response.json({ competitors: rows });
  } catch (err) {
    return jsonError(err);
  }
}

export async function POST(req: Request) {
  try {
    const body = await readJson(req);
    const [row] = await db
      .insert(competitors)
      .values({
        name: requireString(body.name, "name"),
        aliases: asStringArray(body.aliases),
        domain: typeof body.domain === "string" && body.domain.trim() ? body.domain.trim() : null,
      })
      .returning();
    return Response.json({ competitor: row }, { status: 201 });
  } catch (err) {
    return jsonError(err);
  }
}
