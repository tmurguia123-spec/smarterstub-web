import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.3fr,1fr,1fr,1fr] lg:px-8">
        <div className="space-y-4">
          <div className="text-xl font-semibold tracking-tight text-slate-950">SmarterStub</div>
          <p className="max-w-sm text-sm leading-6 text-slate-600">
            Compare ticket prices across top marketplaces in one search and see the smartest
            all-in deal faster.
          </p>
        </div>
        <div className="space-y-3 text-sm text-slate-600">
          <div className="font-semibold text-slate-950">Product</div>
          <Link href="/search">Search</Link>
          <Link href="/#how-it-works">How it Works</Link>
          <Link href="/#faq">FAQ</Link>
        </div>
        <div className="space-y-3 text-sm text-slate-600">
          <div className="font-semibold text-slate-950">Categories</div>
          <div>Concerts</div>
          <div>Sports</div>
          <div>Comedy</div>
          <div>Theater</div>
        </div>
        <div className="space-y-3 text-sm text-slate-600">
          <div className="font-semibold text-slate-950">Trust</div>
          <div>Live backend event inventory</div>
          <div>Alert signup capture</div>
          <div>SEO-first frontend architecture</div>
        </div>
      </div>
    </footer>
  );
}
