import Link from "next/link";
import { ArrowRight, Bell, Search, ShieldCheck } from "lucide-react";
import { EventCard } from "@/components/event-card";
import { EmailCaptureForm } from "@/components/email-capture-form";
import { SearchBar } from "@/components/search-bar";
import { searchLiveEvents } from "@/lib/ticket-service";
import type { LiveEvent } from "@/types";

const providerNotes = [
  "SmarterStub currently surfaces live backend event inventory and direct source links.",
  "Provider-by-provider fee comparisons should only return when the backend has real listing-level data.",
  "Alert signups remain available while richer comparison logic is rebuilt on top of trustworthy inputs."
];

const faqItems = [
  {
    question: "Why did the comparison UI change?",
    answer:
      "The new frontend is removing synthetic pricing, invented marketplace rankings, and demo-only listings so users only see information backed by the live data stack."
  },
  {
    question: "What still works today?",
    answer:
      "Search, live event discovery from the backend feed, event detail pages, direct source links, and alert signup capture are available now."
  },
  {
    question: "What comes next?",
    answer:
      "Real listing-level comparisons, marketplace normalization, and richer event pages should return only after those inputs are supplied by the backend with production-grade accuracy."
  }
];

export default async function HomePage() {
  const featuredEvents: LiveEvent[] = await searchLiveEvents();

  return (
    <div className="pb-16">
      <section className="border-b border-slate-200 bg-hero-grid">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr,0.9fr] lg:px-8 lg:py-24">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-4 py-2 text-sm font-semibold text-teal-700">
              SEO-first frontend migration
            </div>
            <div className="space-y-5">
              <h1 className="max-w-4xl font-[var(--font-display)] text-5xl font-bold tracking-tight text-slate-950 sm:text-6xl">
                Search live ticket events without fake pricing or demo inventory.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-600">
                SmarterStub is moving from the legacy React SPA to a crawlable Next.js frontend. This
                version keeps search, event pages, and alert signup while stripping out misleading mock
                comparisons.
              </p>
            </div>

            <SearchBar />

            <div className="flex flex-wrap gap-4">
              <Link
                href="/search"
                className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-6 py-3.5 text-sm font-semibold text-white"
              >
                Explore live events
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-950"
              >
                How the new frontend works
              </a>
            </div>
          </div>

          <div className="rounded-[32px] border border-slate-200 bg-white p-7 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
            <div className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">
              What is live right now
            </div>
            <div className="mt-6 grid gap-4">
              {[
                {
                  icon: Search,
                  title: "Backend-powered search",
                  body: "Search results now come from the existing FastAPI service instead of a hardcoded catalog."
                },
                {
                  icon: ShieldCheck,
                  title: "Honest event pages",
                  body: "Event detail pages show live source fields, source links, and alert signup without invented comparisons."
                },
                {
                  icon: Bell,
                  title: "Alert capture retained",
                  body: "Email signup stays active through the current Next.js alert route and storage flow."
                }
              ].map((item) => (
                <div key={item.title} className="rounded-[24px] bg-slate-50 p-5">
                  <item.icon className="h-5 w-5 text-teal-700" />
                  <div className="mt-3 text-lg font-semibold tracking-tight text-slate-950">{item.title}</div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <div className="text-sm font-semibold uppercase tracking-[0.22em] text-teal-700">
            Featured live events
          </div>
          <h2 className="mt-3 font-[var(--font-display)] text-4xl font-bold tracking-tight text-slate-950">
            Pulled from the current backend feed
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            These cards intentionally show only the source fields currently available from the live backend.
          </p>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {featuredEvents.slice(0, 4).map((event) => (
            <EventCard key={`${event.source}-${event.eventId}`} event={event} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <EmailCaptureForm
          title="Track ticket updates while the comparison layer is rebuilt"
          description="Sign up for alerts on events you care about. This keeps a useful conversion path live while the new frontend removes demo-only pricing claims."
          buttonLabel="Get alerts"
          successMessage="You’re signed up for SmarterStub alerts."
          source="homepage"
        />
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8" id="how-it-works">
        <div className="max-w-3xl">
          <div className="text-sm font-semibold uppercase tracking-[0.22em] text-teal-700">How it works</div>
          <h2 className="mt-3 font-[var(--font-display)] text-4xl font-bold tracking-tight text-slate-950">
            The Next.js app is now the SEO-friendly shell around the existing backend.
          </h2>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {[
            ["01", "Search requests go to the live backend", "The frontend fetches event data from the current FastAPI API instead of local fallback catalogs."],
            ["02", "Event detail pages resolve by source event id", "A minimal backend detail endpoint keeps individual event URLs honest and crawlable."],
            ["03", "Comparison UI only returns when data is real", "Synthetic listing math, mock historical trends, and fake provider rankings stay out of production pages."]
          ].map(([step, title, body]) => (
            <div key={step} className="rounded-[28px] border border-slate-200 bg-white p-6">
              <div className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">{step}</div>
              <div className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">{title}</div>
              <p className="mt-3 text-sm leading-7 text-slate-600">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="rounded-[32px] border border-slate-200 bg-white p-7">
          <div className="text-sm font-semibold uppercase tracking-[0.22em] text-teal-700">Provider coverage</div>
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {providerNotes.map((note) => (
              <div key={note} className="rounded-[24px] bg-slate-50 p-5 text-sm leading-7 text-slate-600">
                {note}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8" id="faq">
        <div className="max-w-3xl">
          <div className="text-sm font-semibold uppercase tracking-[0.22em] text-teal-700">FAQ</div>
          <h2 className="mt-3 font-[var(--font-display)] text-4xl font-bold tracking-tight text-slate-950">
            Direct answers about the migration
          </h2>
        </div>

        <div className="mt-10 grid gap-4">
          {faqItems.map((item) => (
            <div key={item.question} className="rounded-[28px] border border-slate-200 bg-white p-6">
              <h3 className="text-xl font-semibold tracking-tight text-slate-950">{item.question}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{item.answer}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
