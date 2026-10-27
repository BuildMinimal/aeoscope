"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { buttonClass, cardClass } from "@/components/ui";

export function RunNow(props: {
  sets: { id: string; name: string; enabled: boolean }[];
}) {
  const router = useRouter();
  const [selected, setSelected] = useState(props.sets[0]?.id ?? "");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (props.sets.length === 0) {
    return (
      <div className={cardClass}>
        <p className="text-sm text-muted">
          Create a prompt set first - runs are always for a whole set.
        </p>
      </div>
    );
  }

  async function run() {
    if (!selected) return;
    setRunning(true);
    setResult(null);
    setError(null);
    try {
      const res = await fetch("/api/runs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ promptSetId: selected }),
      });
      const data = (await res.json()) as {
        stored?: number;
        error?: string;
      };
      if (!res.ok) {
        setError(data.error ?? "run failed");
      } else {
        setResult(`stored ${data.stored} results`);
        router.refresh();
      }
    } catch {
      setError("network error");
    }
    setRunning(false);
  }

  return (
    <div className={cardClass}>
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-48">
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted">
            Prompt set
          </label>
          <select
            className="w-full rounded-md border border-line bg-transparent px-3 py-2 text-sm"
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
          >
            {props.sets.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <button className={buttonClass} onClick={run} disabled={running || !selected}>
          {running ? "Running - this can take a minute…" : "Run now"}
        </button>
      </div>
      <p className="mt-2 text-xs text-faint">
        Queries every enabled engine with every prompt in the set, sequentially.
      </p>
      {result && (
        <p className="mt-2 text-sm text-success">{result}</p>
      )}
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
