import Link from "next/link";
import { Search, Ticket } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-white">
            <Ticket className="h-5 w-5" />
          </div>
          <div>
            <div className="text-lg font-semibold tracking-tight text-slate-950">SmarterStub</div>
            <div className="text-xs text-slate-500">Search once, compare everywhere</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
          <Link href="/#how-it-works" className="transition hover:text-slate-950">
            How it Works
          </Link>
          <Link href="/search" className="transition hover:text-slate-950">
            Explore Events
          </Link>
          <Link href="/#faq" className="transition hover:text-slate-950">
            FAQ
          </Link>
        </nav>

        <Link
          href="/search"
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:border-slate-300 hover:bg-slate-50"
        >
          <Search className="h-4 w-4" />
          Start Searching
        </Link>
      </div>
    </header>
  );
}
