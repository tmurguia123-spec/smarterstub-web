"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function FilterChip({
  href,
  active,
  children
}: {
  href: string;
  active?: boolean;
  children: ReactNode;
}) {
  const [isNavigating, setIsNavigating] = useState(false);

  function handleClick() {
    if (typeof window === "undefined" || active || isNavigating) {
      return;
    }

    const currentUrl = `${window.location.pathname}${window.location.search}`;

    if (currentUrl === href) {
      return;
    }

    // Match the search submit strategy: use a hard navigation so filtered /search states never retain
    // the previous tree while loading the next one.
    setIsNavigating(true);
    window.location.assign(href);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={active || isNavigating}
      className={cn(
        "rounded-full border px-4 py-2 text-sm font-medium transition disabled:cursor-default",
        active
          ? "border-slate-950 bg-slate-950 text-white"
          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-950 disabled:opacity-80"
      )}
    >
      {children}
    </button>
  );
}
