import type { ReactNode } from "react";
import Link from "next/link";
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
  return (
    <Link
      href={href}
      className={cn(
        "rounded-full border px-4 py-2 text-sm font-medium transition",
        active
          ? "border-slate-950 bg-slate-950 text-white"
          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-950"
      )}
    >
      {children}
    </Link>
  );
}
