import { cn } from "@/lib/utils";

export function ScorePill({
  score,
  label = "Buy Confidence Score",
  compact = false
}: {
  score: number;
  label?: string;
  compact?: boolean;
}) {
  const tone =
    score >= 90
      ? "from-emerald-500 to-teal-500"
      : score >= 78
        ? "from-teal-500 to-cyan-500"
        : score >= 60
          ? "from-amber-400 to-orange-500"
          : "from-rose-500 to-red-500";

  return (
    <div
      className={cn(
        "inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/80 px-3 py-2 text-slate-950 backdrop-blur",
        compact && "px-2.5 py-1.5"
      )}
    >
      <div className="relative h-10 w-10">
        <div className="absolute inset-0 rounded-full bg-slate-100" />
        <div
          className={cn("absolute inset-0 rounded-full bg-gradient-to-br", tone)}
          style={{ clipPath: `inset(${100 - score}% 0 0 0 round 999px)` }}
        />
        <div className="absolute inset-1 grid place-items-center rounded-full bg-white text-xs font-semibold text-slate-950">
          {score}
        </div>
      </div>
      <div className="text-left">
        <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
          {label}
        </div>
        <div className={cn("text-sm font-semibold", compact && "text-xs")}>
          Smart Deal Ranking
        </div>
      </div>
    </div>
  );
}
