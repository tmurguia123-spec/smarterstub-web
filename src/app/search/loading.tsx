export default function SearchLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
        <div className="skeleton h-6 w-32 rounded-full" />
        <div className="mt-4 skeleton h-12 w-80 rounded-2xl" />
        <div className="mt-8 skeleton h-16 w-full rounded-[28px]" />
        <div className="mt-8 grid gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="rounded-3xl bg-slate-50 p-5">
              <div className="skeleton h-5 w-24 rounded-full" />
              <div className="mt-4 flex flex-wrap gap-2">
                {Array.from({ length: 4 }).map((__, chipIndex) => (
                  <div key={chipIndex} className="skeleton h-9 w-24 rounded-full" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="overflow-hidden rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="skeleton h-56 rounded-[24px]" />
            <div className="mt-6 skeleton h-8 w-3/4 rounded-2xl" />
            <div className="mt-3 skeleton h-5 w-1/2 rounded-full" />
            <div className="mt-6 skeleton h-28 rounded-[24px]" />
          </div>
        ))}
      </div>
    </div>
  );
}
