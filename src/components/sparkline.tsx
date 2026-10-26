interface DayPoint {
  date: string;
  total: number;
  mentioned: number;
}

/** Tiny dependency-free sparkline of daily visibility scores (0-100%). */
export function Sparkline({ days }: { days: DayPoint[] }) {
  const n = days.length;
  if (n < 2 || days.every((d) => d.total === 0)) return null;

  const x = (i: number) => (i / (n - 1)) * 100;
  const y = (d: DayPoint) => 28 - (d.mentioned / d.total) * 26;

  const points = days
    .map((d, i) => (d.total > 0 ? `${x(i).toFixed(1)},${y(d).toFixed(1)}` : null))
    .filter((p): p is string => p !== null);

  if (points.length < 2) return null;

  return (
    <svg
      viewBox="0 0 100 30"
      preserveAspectRatio="none"
      className="h-16 w-full"
      aria-hidden
    >
      <polyline
        points={points.join(" ")}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
