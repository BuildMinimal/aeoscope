import { db } from "@/lib/db";
import { promptSets, runs } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { ENGINES } from "@/lib/engines";
import { badgeClass, cardClass } from "@/components/ui";
import { RunNow } from "./run-now";

export const dynamic = "force-dynamic";
export const metadata = { title: "Runs" };

export default async function RunsPage() {
  const rows = await db.select().from(runs).orderBy(desc(runs.createdAt)).limit(100);
  const sets = await db.select().from(promptSets).orderBy(desc(promptSets.createdAt));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Runs</h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Every stored AI answer, with what was detected in it.
        </p>
      </div>

      <RunNow
        sets={sets.map((s) => ({ id: s.id, name: s.name, enabled: s.enabled }))}
      />

      {rows.length === 0 ? (
        <div className={cardClass}>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            No runs yet. Trigger one above — the mock engine works without any
            API keys.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {rows.map((r) => (
            <li key={r.id} className={cardClass}>
              <details>
                <summary className="flex cursor-pointer flex-wrap items-center gap-2.5 text-sm [&::-webkit-details-marker]:hidden">
                  <span
                    className={badgeClass(
                      r.status === "error" ? "red" : r.mentioned ? "green" : "gray",
                    )}
                  >
                    {r.status === "error"
                      ? "error"
                      : r.mentioned
                        ? "mentioned"
                        : "not mentioned"}
                  </span>
                  <span className="font-medium">{ENGINES[r.engine as keyof typeof ENGINES]?.label ?? r.engine}</span>
                  <span className="text-neutral-400">{r.model}</span>
                  <span className="min-w-0 flex-1 truncate text-neutral-500 dark:text-neutral-400">
                    {r.promptText}
                  </span>
                  <span className="text-xs text-neutral-400">
                    {new Date(r.createdAt).toLocaleString()}
                    {r.latencyMs != null && ` · ${(r.latencyMs / 1000).toFixed(1)}s`}
                    {r.citations.length > 0 && ` · ${r.citations.length} citations`}
                  </span>
                </summary>

                {r.status === "error" ? (
                  <p className="mt-3 rounded-md bg-red-50 px-3 py-2 font-mono text-xs text-red-700 dark:bg-red-950 dark:text-red-300">
                    {r.error}
                  </p>
                ) : (
                  <div className="mt-3 space-y-3">
                    <pre className="max-h-64 overflow-auto whitespace-pre-wrap rounded-md bg-neutral-50 p-3 text-xs dark:bg-neutral-900">
                      {r.responseText}
                    </pre>
                    {r.citations.length > 0 && (
                      <div>
                        <p className={badgeClass("gray")}>citations</p>
                        <ul className="mt-2 space-y-1">
                          {r.citations.map((u) => (
                            <li key={u} className="truncate font-mono text-xs">
                              <a
                                className="text-blue-600 hover:underline dark:text-blue-400"
                                href={u}
                                target="_blank"
                                rel="noreferrer"
                              >
                                {u}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <p className="text-xs text-neutral-400">
                      {r.mentioned
                        ? `first mention at ${(100 * (r.mentionPosition ?? 0)).toFixed(0)}% into the answer`
                        : "brand not found in this answer"}
                      {r.citedOwnDomain && " · cited your domain"}
                    </p>
                  </div>
                )}
              </details>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
