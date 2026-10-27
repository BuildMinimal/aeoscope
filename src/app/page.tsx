import Link from "next/link";
import { getSettings } from "@/lib/runs";
import { getDashboardStats } from "@/lib/stats";
import { ENGINES } from "@/lib/engines";
import { Sparkline } from "@/components/sparkline";
import { badgeClass, buttonClass, buttonSecondaryClass, cardClass, labelClass } from "@/components/ui";

export const dynamic = "force-dynamic";

function StatCard(props: { label: string; value: string; sub?: string }) {
  return (
    <div className={`${cardClass} flex flex-col gap-1.5`}>
      <p className={labelClass}>{props.label}</p>
      <p className="text-2xl font-semibold tracking-tight">{props.value}</p>
      {props.sub && <p className="text-xs text-faint">{props.sub}</p>}
    </div>
  );
}

export default async function DashboardPage() {
  const s = await getSettings();
  const stats = await getDashboardStats();

  if (!s.brandName) {
    return (
      <div className={`${cardClass} flex flex-col gap-3`}>
        <h1 className="text-lg font-semibold tracking-tight">
          Welcome to aeoscope
        </h1>
        <p className="max-w-lg text-sm text-muted">
          Set up your brand, aliases, and competitors, then create a prompt set
          to start tracking whether AI engines mention and cite you.
        </p>
        <div className="flex gap-3">
          <Link href="/settings" className={buttonClass}>
            1. Configure your brand
          </Link>
          <Link href="/prompts" className={buttonSecondaryClass}>
            2. Create a prompt set
          </Link>
        </div>
      </div>
    );
  }

  const hasData = stats.overall.total > 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-baseline gap-3">
        <h1 className="text-xl font-semibold tracking-tight">
          Visibility for {s.brandName}
        </h1>
        <span className="text-sm text-faint">last 30 days</span>
      </div>

      {!hasData ? (
        <div className={cardClass}>
          <p className="text-sm text-muted">
            No results yet.{" "}
            <Link className="underline" href="/runs">
              Trigger a run
            </Link>{" "}
            - the mock engine works without any API keys.
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

          <div className={`${cardClass} flex flex-col gap-2`}>
            <p className={labelClass}>Daily visibility, last 14 days</p>
            <div className="text-brand">
              <Sparkline days={stats.perDay} />
            </div>
            {stats.perDay.some((d) => d.total > 0) && (
              <div className="flex justify-between text-[10px] text-faint">
                <span>{stats.perDay[0].date}</span>
                <span>{stats.perDay[stats.perDay.length - 1].date}</span>
              </div>
            )}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className={`${cardClass} flex flex-col gap-3`}>
              <h2 className="text-sm font-semibold">Per engine</h2>
              <table className="w-full text-sm">
                <tbody>
                  {stats.perEngine.map((e) => (
                    <tr
                      key={e.engine}
                      className="border-t border-line"
                    >
                      <td className="py-2">
                        {ENGINES[e.engine as keyof typeof ENGINES]?.label ?? e.engine}
                      </td>
                      <td className="py-2 text-right tabular-nums">
                        {Math.round(e.score * 100)}%
                      </td>
                      <td className="py-2 text-right text-xs text-faint">
                        {e.mentioned}/{e.total}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className={`${cardClass} flex flex-col gap-2`}>
              <h2 className="text-sm font-semibold">Share of voice</h2>
              <p className="text-xs text-faint">
                How often each competitor appears in answers alongside you.
              </p>
              {stats.share.length === 0 ? (
                <p className="text-sm text-faint">
                  Add competitors in settings to compare.
                </p>
              ) : (
                <ul className="flex flex-col gap-3">
                  <li className="flex flex-col gap-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{s.brandName} (you)</span>
                      <span className="tabular-nums text-faint">
                        {stats.overall.mentioned}/{stats.overall.total}
                      </span>
                    </div>
                    <div className="h-2 rounded bg-black/5 dark:bg-white/10">
                      <div
                        className="h-2 rounded bg-btn"
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
                      <li key={c.id} className="flex flex-col gap-1">
                        <div className="flex justify-between text-sm">
                          <span>{c.name}</span>
                          <span className="tabular-nums text-faint">
                            {c.mentioned}/{stats.overall.total}
                          </span>
                        </div>
                        <div className="h-2 rounded bg-black/5 dark:bg-white/10">
                          <div
                            className="h-2 rounded bg-faint"
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
            <div className={`${cardClass} flex flex-col gap-3`}>
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold">Latest answers</h2>
                <Link className="text-xs underline text-brand" href="/runs">
                  view all
                </Link>
              </div>
              <ul className="divide-y divide-line">
                {stats.recent.map((r) => (
                  <li
                    key={r.id}
                    className="flex flex-wrap items-center gap-2.5 py-2 text-sm"
                  >
                    <span className={badgeClass(r.mentioned ? "green" : "gray")}>
                      {r.mentioned ? "mentioned" : "not mentioned"}
                    </span>
                    <span className="text-muted">
                      {ENGINES[r.engine as keyof typeof ENGINES]?.label ?? r.engine}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-faint">
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
