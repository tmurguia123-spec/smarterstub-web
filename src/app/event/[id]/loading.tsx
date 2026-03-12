export default function EventLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[1.15fr,0.85fr]">
        <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="skeleton h-72 rounded-[28px]" />
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="skeleton h-28 rounded-[24px]" />
            ))}
          </div>
        </div>
        <div className="space-y-6">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="skeleton h-6 w-32 rounded-full" />
              <div className="mt-4 skeleton h-32 rounded-[24px]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
