import type { Metadata } from "next";
import { EventCard } from "@/components/event-card";
import { EmailCaptureForm } from "@/components/email-capture-form";
import { SearchBar } from "@/components/search-bar";
import { getSiteUrl } from "@/lib/site-url";
import { searchLiveEvents } from "@/lib/ticket-service";
import type { LiveEvent } from "@/types";

function normalizeQuery(value: string | string[] | undefined) {
  return (typeof value === "string" ? value : "").replace(/\s+/g, " ").trim().slice(0, 60);
}

export async function generateMetadata({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const params = await searchParams;
  const query = normalizeQuery(params.q);
  const canonicalPath = query ? `/search?q=${encodeURIComponent(query)}` : "/search";

  return {
    title: query ? `Search results for ${query} | SmarterStub` : "Search live events | SmarterStub",
    description: query
      ? `Browse live event search results for ${query} from the current SmarterStub backend feed.`
      : "Search live events through the SEO-friendly SmarterStub frontend.",
    alternates: {
      canonical: canonicalPath
    },
    openGraph: {
      title: query ? `Search results for ${query} | SmarterStub` : "Search live events | SmarterStub",
      description: query
        ? `Browse live event search results for ${query} from the current SmarterStub backend feed.`
        : "Search live events through the SEO-friendly SmarterStub frontend.",
      url: `${getSiteUrl()}${canonicalPath}`
    }
  };
}

export default async function SearchPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const query = normalizeQuery(params.q);
  const events: LiveEvent[] = await searchLiveEvents({ query });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 sm:p-8">
        <div className="space-y-3">
          <div className="text-sm font-semibold uppercase tracking-[0.22em] text-teal-700">Live search</div>
          <h1 className="font-[var(--font-display)] text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">
            {query ? `Results for "${query}"` : "Search live ticket events"}
          </h1>
          <p className="max-w-3xl text-sm leading-7 text-slate-600">
            This page is intentionally limited to backend-sourced event fields. Marketplace rankings,
            fake savings claims, and synthetic provider comparisons have been removed.
          </p>
          <div className="rounded-[20px] bg-slate-50 px-5 py-4 text-sm text-slate-600">
            <span className="font-semibold text-slate-950">{events.length} events found.</span> Search
            results currently come from the live SeatGeek-backed backend endpoint.
          </div>
        </div>

        <div className="mt-8">
          <SearchBar defaultValue={query} compact />
        </div>
      </div>

      {events.length ? (
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {events.map((event) => (
            <EventCard key={`${event.source}-${event.eventId}`} event={event} />
          ))}
        </div>
      ) : (
        <div className="mt-8 grid gap-6">
          <div className="rounded-[28px] border border-slate-200 bg-white p-8">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">No live events found</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
              Try a broader artist, team, venue, or city search. If this event matters to you, leave an
              alert signup so SmarterStub can keep the interest signal.
            </p>
          </div>
          <EmailCaptureForm
            title="Get notified when matching events appear"
            description="We’ll keep your signup even if the current search returns no results."
            buttonLabel="Track this search"
            successMessage="Your search alert has been saved."
            source="search-no-results"
          />
        </div>
      )}
    </div>
  );
}
