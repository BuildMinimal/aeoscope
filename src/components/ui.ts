/** Shared class constants so every page looks consistent without a component zoo. */

export const cardClass =
  "rounded-lg border border-neutral-200 dark:border-neutral-800 p-5";

export const inputClass =
  "w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-600";

export const buttonClass =
  "inline-flex items-center justify-center gap-2 rounded-md bg-neutral-900 text-white px-3.5 py-2 text-sm font-medium hover:bg-neutral-700 disabled:opacity-50 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-300";

export const buttonSecondaryClass =
  "inline-flex items-center justify-center gap-2 rounded-md border border-neutral-300 dark:border-neutral-700 px-3 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-50";

export const buttonDangerClass =
  "inline-flex items-center justify-center rounded-md px-2 py-1 text-xs text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950";

export const labelClass =
  "block text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400 mb-1.5";

export function badgeClass(tone: "green" | "red" | "gray" | "amber") {
  switch (tone) {
    case "green":
      return "inline-block rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-0.5 text-xs font-medium";
    case "red":
      return "inline-block rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 px-2 py-0.5 text-xs font-medium";
    case "amber":
      return "inline-block rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 px-2 py-0.5 text-xs font-medium";
    default:
      return "inline-block rounded-full bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 px-2 py-0.5 text-xs font-medium";
  }
}
