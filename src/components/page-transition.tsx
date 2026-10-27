"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** Re-mounts its subtree on every route change so the page-enter animation replays. */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="page-enter">
      {children}
    </div>
  );
}
