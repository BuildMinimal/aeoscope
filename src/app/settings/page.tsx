import { getSettings } from "@/lib/runs";
import { listEngines } from "@/lib/engines";
import { db } from "@/lib/db";
import { competitors as competitorsTable } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { SettingsForm } from "./settings-form";
import { CompetitorsManager } from "./competitors-manager";

export const dynamic = "force-dynamic";
export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const s = await getSettings();
  const comps = await db
    .select()
    .from(competitorsTable)
    .orderBy(desc(competitorsTable.createdAt));

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted">
          Tell aeoscope who it is tracking. Brand name and aliases are matched
          case-insensitively in every AI response.
        </p>
      </div>

      <SettingsForm
        brandName={s.brandName}
        brandAliases={s.brandAliases}
        domain={s.domain}
        enabledEngines={s.enabledEngines}
        engines={listEngines().map((e) => ({
          id: e.id,
          label: e.label,
          configured: e.configured,
          apiKeyEnv: e.apiKeyEnv,
        }))}
      />

      <CompetitorsManager
        competitors={comps.map((c) => ({
          id: c.id,
          name: c.name,
          aliases: c.aliases,
          domain: c.domain,
        }))}
      />
    </div>
  );
}
