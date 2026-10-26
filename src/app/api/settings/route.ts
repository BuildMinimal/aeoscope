import { db } from "@/lib/db";
import { settings } from "@/lib/db/schema";
import { getSettings } from "@/lib/runs";
import { listEngines } from "@/lib/engines";
import { asStringArray, jsonError, readJson } from "@/lib/http";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const s = await getSettings();
    return Response.json({ settings: s, engines: listEngines() });
  } catch (err) {
    return jsonError(err);
  }
}

export async function PUT(req: Request) {
  try {
    const body = await readJson(req);
    const s = await getSettings();
    const [updated] = await db
      .update(settings)
      .set({
        brandName: typeof body.brandName === "string" ? body.brandName.trim() : s.brandName,
        brandAliases: asStringArray(body.brandAliases),
        domain: typeof body.domain === "string" && body.domain.trim() ? body.domain.trim() : null,
        enabledEngines: asStringArray(body.enabledEngines),
        updatedAt: new Date(),
      })
      .where(eq(settings.id, s.id))
      .returning();
    return Response.json({ settings: updated });
  } catch (err) {
    return jsonError(err);
  }
}
