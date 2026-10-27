/** Shared class constants so every page looks consistent without a component zoo. */

export const cardClass = "rounded-lg border border-line bg-surface p-5";

export const inputClass =
  "w-full rounded-md border border-line bg-background px-3 py-2 text-sm text-foreground placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-brand/40";

export const buttonClass =
  "inline-flex items-center justify-center gap-2 rounded-md bg-btn px-3.5 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-btn-hover disabled:cursor-not-allowed disabled:opacity-50";

export const buttonSecondaryClass =
  "inline-flex items-center justify-center gap-2 rounded-md border border-line bg-background px-3 py-2 text-sm text-foreground shadow-sm transition-colors hover:bg-brand-soft hover:text-brand disabled:cursor-not-allowed disabled:opacity-50";

export const buttonDangerClass =
  "inline-flex items-center justify-center rounded-md border border-red-500/30 bg-background px-3 py-2 text-sm text-red-600 shadow-sm transition-colors hover:bg-red-500/10 dark:text-red-400";

export const labelClass = "block text-xs font-medium text-muted";

/** Wrapper for a label + control pair: gap instead of label margins. */
export const fieldClass = "flex flex-col gap-1.5";

export function badgeClass(tone: "green" | "red" | "gray" | "amber") {
  switch (tone) {
    case "green":
      return "inline-block rounded-full bg-success-soft px-2 py-0.5 text-xs font-medium text-success";
    case "red":
      return "inline-block rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-600 dark:text-red-400";
    case "amber":
      return "inline-block rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400";
    default:
      return "inline-block rounded-full bg-black/5 px-2 py-0.5 text-xs font-medium text-muted dark:bg-white/10";
  }
}
