"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  badgeClass,
  buttonClass,
  buttonDangerClass,
  buttonSecondaryClass,
  cardClass,
  inputClass,
  labelClass,
} from "@/components/ui";

interface PromptItem {
  id: string;
  text: string;
}

interface SetItem {
  id: string;
  name: string;
  description: string | null;
  schedule: string | null;
  enabled: boolean;
  prompts: PromptItem[];
}

export function PromptSetsManager(props: { sets: SetItem[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [schedule, setSchedule] = useState("");
  const [promptsText, setPromptsText] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  async function create() {
    setCreating(true);
    setError(null);
    const res = await fetch("/api/prompt-sets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        description,
        schedule,
        prompts: promptsText,
      }),
    });
    setCreating(false);
    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      setError(data.error ?? "failed to create");
      return;
    }
    setName("");
    setDescription("");
    setSchedule("");
    setPromptsText("");
    router.refresh();
  }

  async function toggleEnabled(set: SetItem) {
    await fetch(`/api/prompt-sets/${set.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: !set.enabled }),
    });
    router.refresh();
  }

  async function remove(id: string) {
    await fetch(`/api/prompt-sets/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {props.sets.length === 0 && (
        <div className={cardClass}>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            No prompt sets yet. Create your first one below — for example
            &quot;category queries&quot; with prompts like &quot;best CRM for
            startups&quot; or &quot;top project management tools&quot;.
          </p>
        </div>
      )}

      {props.sets.map((s) =>
        editingId === s.id ? (
          <SetEditor
            key={s.id}
            set={s}
            onDone={() => setEditingId(null)}
          />
        ) : (
          <div key={s.id} className={cardClass}>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm font-medium">{s.name}</span>
              {s.schedule && (
                <span className={`${badgeClass("gray")} font-mono`}>{s.schedule}</span>
              )}
              {!s.enabled && <span className={badgeClass("amber")}>paused</span>}
              <span className="text-xs text-neutral-400">
                {s.prompts.length} prompt{s.prompts.length === 1 ? "" : "s"}
              </span>
              <span className="ml-auto flex items-center gap-2">
                <button
                  className={buttonSecondaryClass}
                  onClick={() => toggleEnabled(s)}
                >
                  {s.enabled ? "Pause" : "Resume"}
                </button>
                <button
                  className={buttonSecondaryClass}
                  onClick={() => setEditingId(s.id)}
                >
                  Edit
                </button>
                <button
                  className={buttonDangerClass}
                  onClick={() => remove(s.id)}
                >
                  delete
                </button>
              </span>
            </div>
            {s.description && (
              <p className="mt-1.5 text-sm text-neutral-500 dark:text-neutral-400">
                {s.description}
              </p>
            )}
            <ul className="mt-3 space-y-1.5">
              {s.prompts.map((p) => (
                <li
                  key={p.id}
                  className="text-sm text-neutral-600 dark:text-neutral-300"
                >
                  <span className="mr-2 text-neutral-300 dark:text-neutral-600">›</span>
                  {p.text}
                </li>
              ))}
            </ul>
          </div>
        ),
      )}

      <div className={cardClass}>
        <h2 className="text-sm font-semibold">New prompt set</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <label className={labelClass}>Name</label>
            <input
              className={inputClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Category queries"
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Description</label>
            <input
              className={inputClass}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="How buyers ask for tools in our category"
            />
          </div>
        </div>
        <div className="mt-4">
          <label className={labelClass}>Prompts (one per line)</label>
          <textarea
            className={`${inputClass} min-h-28 font-mono`}
            value={promptsText}
            onChange={(e) => setPromptsText(e.target.value)}
            placeholder={"best crm for startups\ntop project management tools for small teams"}
          />
        </div>
        <div className="mt-4">
          <label className={labelClass}>Schedule (optional cron)</label>
          <input
            className={`${inputClass} max-w-56 font-mono`}
            value={schedule}
            onChange={(e) => setSchedule(e.target.value)}
            placeholder="0 9 * * *"
          />
          <p className="mt-1 text-xs text-neutral-400">
            Runs automatically at this time (UTC). Leave empty for manual runs
            only.
          </p>
        </div>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        <button
          className={`${buttonClass} mt-4`}
          onClick={create}
          disabled={creating || !name.trim() || !promptsText.trim()}
        >
          {creating ? "Creating…" : "Create prompt set"}
        </button>
      </div>
    </div>
  );
}

/** Mounted only while editing, so its state is always fresh from server props. */
function SetEditor(props: { set: SetItem; onDone: () => void }) {
  const router = useRouter();
  const { set } = props;
  const [name, setName] = useState(set.name);
  const [schedule, setSchedule] = useState(set.schedule ?? "");
  const [promptsText, setPromptsText] = useState(
    set.prompts.map((p) => p.text).join("\n"),
  );
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    await fetch(`/api/prompt-sets/${set.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, schedule, prompts: promptsText }),
    });
    setSaving(false);
    router.refresh();
    props.onDone();
  }

  return (
    <div className={cardClass}>
      <div className="flex items-center gap-3">
        <h2 className="text-sm font-semibold">Edit: {set.name}</h2>
        <button
          className={`${buttonSecondaryClass} ml-auto`}
          onClick={props.onDone}
        >
          Cancel
        </button>
      </div>
      <div className="mt-4 space-y-3">
        <input
          className={inputClass}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className={`${inputClass} max-w-56 font-mono`}
          value={schedule}
          onChange={(e) => setSchedule(e.target.value)}
          placeholder="cron (optional)"
        />
        <textarea
          className={`${inputClass} min-h-28 font-mono`}
          value={promptsText}
          onChange={(e) => setPromptsText(e.target.value)}
        />
        <button className={buttonClass} onClick={save} disabled={saving}>
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>
    </div>
  );
}
