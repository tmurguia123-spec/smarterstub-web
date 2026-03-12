export function DevSourceIndicator({ label }: { label: string }) {
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div className="rounded-full border border-dashed border-slate-300 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-500">
      Source: {label}
    </div>
  );
}
