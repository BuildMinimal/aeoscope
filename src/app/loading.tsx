import { cardClass } from "@/components/ui";

/** Shown instantly while a page's data is being fetched on the server. */
export default function Loading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="h-7 w-56 animate-pulse rounded-md bg-black/10 dark:bg-white/10" />
      <div className="grid gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className={`${cardClass} flex flex-col gap-3 animate-pulse`}>
            <div className="h-3 w-24 rounded bg-black/10 dark:bg-white/10" />
            <div className="h-7 w-16 rounded bg-black/10 dark:bg-white/10" />
          </div>
        ))}
      </div>
      <div className={`${cardClass} h-36 animate-pulse`} />
    </div>
  );
}
