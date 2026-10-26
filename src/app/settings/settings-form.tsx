"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { buttonClass, inputClass, labelClass, cardClass } from "@/components/ui";

interface EngineInfo {
  id: string;
  label: string;
  configured: boolean;
  apiKeyEnv: string;
}

export function SettingsForm(props: {
  brandName: string;
  brandAliases: string[];
  domain: string | null;
  enabledEngines: string[];
  engines: EngineInfo[];
}) {
  const router = useRouter();
  const [brandName, setBrandName] = useState(props.brandName);
  const [aliases, setAliases] = useState(props.brandAliases.join(", "));
  const [domain, setDomain] = useState(props.domain ?? "");
  const [enabled, setEnabled] = useState<string[]>(props.enabledEngines);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    setSaving(true);
    setSaved(false);
    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        brandName,
        brandAliases: aliases,
        domain,
        enabledEngines: enabled,
      }),
    });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 2000);
    }
  }

  function toggleEngine(id: string) {
    setEnabled((cur) =>
      cur.includes(id) ? cur.filter((e) => e !== id) : [...cur, id],
    );
  }

  return (
    <div className={cardClass}>
      <h2 className="text-sm font-semibold">Brand</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Brand name</label>
          <input
            className={inputClass}
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            placeholder="Acme Analytics"
          />
        </div>
        <div>
          <label className={labelClass}>Aliases (comma separated)</label>
          <input
            className={inputClass}
            value={aliases}
            onChange={(e) => setAliases(e.target.value)}
            placeholder="Acme, AcmeAnalytics"
          />
        </div>
        <div>
          <label className={labelClass}>Website domain (for citation tracking)</label>
          <input
            className={inputClass}
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="acme.com"
          />
        </div>
      </div>

      <h2 className="mt-6 text-sm font-semibold">Engines to query</h2>
      <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
        Keys come from your .env file (BYOK). The mock engine needs no key and
        is useful for trying aeoscope out.
      </p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {props.engines.map((e) => (
          <label
            key={e.id}
            className={`flex items-center gap-3 rounded-md border px-3 py-2.5 text-sm ${
              enabled.includes(e.id)
                ? "border-neutral-900 dark:border-neutral-300"
                : "border-neutral-200 dark:border-neutral-800"
            } ${e.configured ? "cursor-pointer" : "opacity-50"}`}
          >
            <input
              type="checkbox"
              className="accent-neutral-900 dark:accent-white"
              checked={enabled.includes(e.id)}
              disabled={!e.configured}
              onChange={() => toggleEngine(e.id)}
            />
            <span className="flex-1">{e.label}</span>
            {!e.configured && (
              <span className="text-xs text-neutral-400">set {e.apiKeyEnv}</span>
            )}
          </label>
        ))}
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button className={buttonClass} onClick={save} disabled={saving}>
          {saving ? "Saving…" : "Save settings"}
        </button>
        {saved && (
          <span className="text-sm text-green-600 dark:text-green-400">Saved</span>
        )}
      </div>
    </div>
  );
}
