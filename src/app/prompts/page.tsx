import { db } from "@/lib/db";
import { promptSets, prompts } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { PromptSetsManager } from "./prompt-sets-manager";

export const dynamic = "force-dynamic";
export const metadata = { title: "Prompt sets" };

export default async function PromptSetsPage() {
  const sets = await db.select().from(promptSets).orderBy(desc(promptSets.createdAt));
  const allPrompts = await db.select().from(prompts).orderBy(prompts.position);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold tracking-tight">Prompt sets</h1>
        <p className="text-sm text-muted">
          The questions you want AI engines to answer, grouped so they run
          together. One prompt per line.
        </p>
      </div>
      <PromptSetsManager
        sets={sets.map((s) => ({
          id: s.id,
          name: s.name,
          description: s.description,
          schedule: s.schedule,
          enabled: s.enabled,
          prompts: allPrompts
            .filter((p) => p.promptSetId === s.id)
            .map((p) => ({ id: p.id, text: p.text })),
        }))}
      />
    </div>
  );
}
