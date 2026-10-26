import Link from "next/link";
import { getSettings } from "@/lib/runs";
import { getDashboardStats } from "@/lib/stats";
import { ENGINES } from "@/lib/engines";
import { Sparkline } from "@/components/sparkline";
import { badgeClass, cardClass } from "@/components/ui";

export const dynamic = "force-dynamic";

function StatCard(props: { label: string; value: string; sub?: string }) {
  return (
    <div className={cardClass}>
      <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
        {props.label}
      </p>
      <p className="mt-2 text-2xl font-semibold tracking-tight">{props.value}</p>
      {props.sub && (
        <p className="mt-1 text-xs text-neutral-400">{props.sub}</p>
      )}
    </div>
  );
}

export default async function DashboardPage() {
  const s = await getSettings();
  const stats = await getDashboardStats();

  if (!s.brandName) {
    return (
      <div className={cardClass}>
        <h1 className="text-lg font-semibold tracking-tight">
          Welcome to aeoscope
        </h1>
        <p className="mt-2 max-w-lg text-sm text-neutral-500 dark:text-neutral-400">
          Set up your brand, aliases, and competitors, then create a prompt set
          to start tracking whether AI engines mention and cite you.
        </p>
        <div className="mt-4 flex gap-3">
          <Link
            href="/settings"
            className="rounded-md bg-neutral-900 px-3.5 py-2 text-sm font-medium text-white hover:bg-neutral-700 dark:bg-white dark:text-neutral-900"
          >
            1. Configure your brand
          </Link>
          <Link
            href="/prompts"
            className="rounded-md border border-neutral-300 px-3.5 py-2 text-sm hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
          >
            2. Create a prompt set
          </Link>
        </div>
      </div>
    );
  }

  const hasData = stats.overall.total > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-baseline gap-3">
        <h1 className="text-xl font-semibold tracking-tight">
          Visibility for {s.brandName}
        </h1>
        <span className="text-sm text-neutral-400">last 30 days</span>
      </div>

      {!hasData ? (
        <div className={cardClass}>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            No results yet.{" "}
            <Link className="underline" href="/runs">
              Trigger a run
            </Link>{" "}
            — the mock engine works without any API keys.
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard
              label="Visibility score"
              value={`${Math.round(stats.overall.score * 100)}%`}
              sub={`${stats.overall.mentioned} of ${stats.overall.total} answers mention you`}
            />
            <StatCard
              label="Citations to your domain"
              value={String(stats.citationsToYou)}
              sub={s.domain ?? "set a domain in settings"}
            />
            <StatCard
              label="Engines with data"
              value={String(stats.perEngine.length)}
            />
          </div>

          <div className={cardClass}>
            <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              Daily visibility, last 14 days
            </p>
            <div className="mt-3 text-neutral-900 dark:text-white">
              <Sparkline days={stats.perDay} />
            </div>
            {stats.perDay.some((d) => d.total > 0) && (
              <div className="mt-1 flex justify-between text-[10px] text-neutral-400">
                <span>{stats.perDay[0].date}</span>
                <span>{stats.perDay[stats.perDay.length - 1].date}</span>
              </div>
            )}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className={cardClass}>
              <h2 className="text-sm font-semibold">Per engine</h2>
              <table className="mt-3 w-full text-sm">
                <tbody>
                  {stats.perEngine.map((e) => (
                    <tr
                      key={e.engine}
                      className="border-t border-neutral-100 dark:border-neutral-900"
                    >
                      <td className="py-2">
                        {ENGINES[e.engine as keyof typeof ENGINES]?.label ?? e.engine}
                      </td>
                      <td className="py-2 text-right tabular-nums">
                        {Math.round(e.score * 100)}%
                      </td>
                      <td className="py-2 text-right text-xs text-neutral-400">
                        {e.mentioned}/{e.total}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className={cardClass}>
              <h2 className="text-sm font-semibold">Share of voice</h2>
              <p className="mt-1 text-xs text-neutral-400">
                How often each competitor appears in answers alongside you.
              </p>
              {stats.share.length === 0 ? (
                <p className="mt-3 text-sm text-neutral-400">
                  Add competitors in settings to compare.
                </p>
              ) : (
                <ul className="mt-4 space-y-3">
                  <li>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{s.brandName} (you)</span>
                      <span className="tabular-nums text-neutral-400">
                        {stats.overall.mentioned}/{stats.overall.total}
                      </span>
                    </div>
                    <div className="mt-1 h-2 rounded bg-neutral-100 dark:bg-neutral-900">
                      <div
                        className="h-2 rounded bg-green-500"
                        style={{
                          width: `${Math.round(stats.overall.score * 100)}%`,
                        }}
                      />
                    </div>
                  </li>
                  {stats.share.map((c) => {
                    const pct =
                      stats.overall.total > 0
                        ? Math.round((c.mentioned / stats.overall.total) * 100)
                        : 0;
                    return (
                      <li key={c.id}>
                        <div className="flex justify-between text-sm">
                          <span>{c.name}</span>
                          <span className="tabular-nums text-neutral-400">
                            {c.mentioned}/{stats.overall.total}
                          </span>
                        </div>
                        <div className="mt-1 h-2 rounded bg-neutral-100 dark:bg-neutral-900">
                          <div
                            className="h-2 rounded bg-neutral-400"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>

          {stats.recent.length > 0 && (
            <div className={cardClass}>
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold">Latest answers</h2>
                <Link className="text-xs underline text-neutral-400" href="/runs">
                  view all
                </Link>
              </div>
              <ul className="mt-3 divide-y divide-neutral-100 dark:divide-neutral-900">
                {stats.recent.map((r) => (
                  <li
                    key={r.id}
                    className="flex flex-wrap items-center gap-2.5 py-2 text-sm"
                  >
                    <span className={badgeClass(r.mentioned ? "green" : "gray")}>
                      {r.mentioned ? "mentioned" : "not mentioned"}
                    </span>
                    <span className="text-neutral-500 dark:text-neutral-400">
                      {ENGINES[r.engine as keyof typeof ENGINES]?.label ?? r.engine}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-neutral-400">
                      {r.promptText}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}
