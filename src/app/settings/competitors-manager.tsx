"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  buttonClass,
  buttonDangerClass,
  buttonSecondaryClass,
  cardClass,
  inputClass,
  labelClass,
} from "@/components/ui";

interface CompetitorItem {
  id: string;
  name: string;
  aliases: string[];
  domain: string | null;
}

export function CompetitorsManager(props: { competitors: CompetitorItem[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [aliases, setAliases] = useState("");
  const [domain, setDomain] = useState("");
  const [adding, setAdding] = useState(false);

  async function add() {
    if (!name.trim()) return;
    setAdding(true);
    await fetch("/api/competitors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, aliases, domain }),
    });
    setAdding(false);
    setName("");
    setAliases("");
    setDomain("");
    router.refresh();
  }

  async function remove(id: string) {
    await fetch(`/api/competitors/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className={cardClass}>
      <h2 className="text-sm font-semibold">Competitors</h2>
      <p className="mt-1 text-xs text-muted">
        Tracked to measure share of voice: how often they show up next to you
        in AI answers.
      </p>

      {props.competitors.length > 0 && (
        <ul className="mt-4 divide-y divide-line">
          {props.competitors.map((c) => (
            <li key={c.id} className="flex items-center gap-3 py-2.5 text-sm">
              <span className="font-medium">{c.name}</span>
              {c.aliases.length > 0 && (
                <span className="text-xs text-faint">
                  aka {c.aliases.join(", ")}
                </span>
              )}
              {c.domain && (
                <span className="ml-auto font-mono text-xs text-faint">
                  {c.domain}
                </span>
              )}
              <button className={buttonDangerClass} onClick={() => remove(c.id)}>
                remove
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 grid gap-3 sm:grid-cols-4">
        <div className="sm:col-span-1">
          <label className={labelClass}>Name</label>
          <input
            className={inputClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Rival CRM"
          />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>Aliases (comma separated)</label>
          <input
            className={inputClass}
            value={aliases}
            onChange={(e) => setAliases(e.target.value)}
            placeholder="Rival, RivalCRM"
          />
        </div>
        <div className="sm:col-span-1">
          <label className={labelClass}>Domain</label>
          <input
            className={inputClass}
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="rivalcrm.com"
          />
        </div>
      </div>
      <button
        className={`mt-4 ${name.trim() && !adding ? buttonClass : buttonSecondaryClass}`}
        onClick={add}
        disabled={adding || !name.trim()}
      >
        {adding ? "Adding…" : "Add competitor"}
      </button>
    </div>
  );
}
