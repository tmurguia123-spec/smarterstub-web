import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, Calendar, MapPin, Tag } from "lucide-react";
import { EmailCaptureForm } from "@/components/email-capture-form";
import { buildEventRoute, getLiveEventByKey } from "@/lib/ticket-service";
import { getSiteUrl } from "@/lib/site-url";
import { formatDate, formatPriceRange, formatTime } from "@/lib/utils";

async function loadEvent(id: string) {
  return getLiveEventByKey(id);
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const event = await loadEvent(id);

  if (!event) {
    return {
      title: "Event not found | SmarterStub"
    };
  }

  const location = [event.venueName, event.city, event.state].filter(Boolean).join(", ");
  const canonicalPath = buildEventRoute(event);

  return {
    title: `${event.title} | SmarterStub`,
    description:
      location
        ? `${event.title} at ${location}. View live source details and sign up for alerts on SmarterStub.`
        : `View live source details for ${event.title} on SmarterStub.`,
    alternates: {
      canonical: canonicalPath
    },
    openGraph: {
      title: `${event.title} | SmarterStub`,
      description:
        location
          ? `${event.title} at ${location}. View live source details and sign up for alerts on SmarterStub.`
          : `View live source details for ${event.title} on SmarterStub.`,
      url: `${getSiteUrl()}${canonicalPath}`,
      type: "article"
    }
  };
}

export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await loadEvent(id);

  if (!event) {
    notFound();
  }

  const location = [event.venueName, event.city, event.state].filter(Boolean).join(", ") || "Venue TBD";

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-teal-700">
            Live event detail
          </span>
          <span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">
            {event.source}
          </span>
        </div>

        <h1 className="mt-5 font-[var(--font-display)] text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
          {event.title}
        </h1>

        <div className="mt-6 grid gap-4 text-sm text-slate-600 sm:grid-cols-2">
          <div className="inline-flex items-center gap-2 rounded-[20px] bg-slate-50 px-4 py-3">
            <Calendar className="h-4 w-4 text-slate-400" />
            {formatDate(event.date)} · {formatTime(event.time)}
          </div>
          <div className="inline-flex items-center gap-2 rounded-[20px] bg-slate-50 px-4 py-3">
            <MapPin className="h-4 w-4 text-slate-400" />
            {location}
          </div>
        </div>

        <div className="mt-6 rounded-[24px] bg-slate-950 p-6 text-white">
          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Current source price range</div>
          <div className="mt-2 text-4xl font-semibold">{formatPriceRange(event.priceMin, event.priceMax)}</div>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
            This page shows the live event data available from the backend source. Provider comparisons,
            fee breakdowns, and buy-now scoring are intentionally omitted until real listing-level data is available.
          </p>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
          <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Event details</h2>
            <div className="mt-5 grid gap-4 text-sm text-slate-600">
              <div>
                <div className="font-semibold text-slate-950">Performers</div>
                <div className="mt-1">{event.performers || "Performer details unavailable from source feed."}</div>
              </div>
              <div>
                <div className="font-semibold text-slate-950">Genre</div>
                <div className="mt-1">{event.genre || "Genre unavailable"}</div>
              </div>
              <div>
                <div className="font-semibold text-slate-950">Status</div>
                <div className="mt-1">{event.status || "Status unavailable"}</div>
              </div>
              <div>
                <div className="font-semibold text-slate-950">Source event id</div>
                <div className="mt-1 inline-flex items-center gap-2">
                  <Tag className="h-4 w-4 text-slate-400" />
                  {event.eventId}
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6">
            <EmailCaptureForm
              title="Track this event"
              description="Get notified about updates while SmarterStub rebuilds richer comparisons on top of verified data."
              buttonLabel="Track this event"
              successMessage="This event is now on your alert list."
              source="event-page"
              eventId={`${event.source}-${event.eventId}`}
              eventTitle={event.title}
              compact
            />

            <div className="rounded-[24px] border border-slate-200 bg-white p-6">
              <h2 className="text-xl font-semibold tracking-tight text-slate-950">What’s intentionally missing</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                SmarterStub removed fake fee estimates, synthetic seat sections, invented rankings, and demo-only
                “best deal” badges from the new frontend. This event page is limited to what the live backend can
                honestly support today.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href="/search"
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-950"
                >
                  Back to search
                </Link>
                {event.url ? (
                  <a
                    href={event.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
                  >
                    Open source listing
                    <ArrowUpRight className="h-4 w-4" />
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
