import Link from "next/link";
import { ArrowUpRight, Calendar, MapPin, Ticket } from "lucide-react";
import { buildEventRoute } from "@/lib/ticket-service";
import { formatDate, formatPriceRange, formatTime } from "@/lib/utils";
import { LiveEvent } from "@/types";

export function EventCard({ event }: { event: LiveEvent }) {
  return (
    <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-teal-700">
          Live event
        </span>
        <span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">
          {event.source}
        </span>
      </div>

      <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">{event.title}</h2>

      <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
        <div className="inline-flex items-center gap-2">
          <Calendar className="h-4 w-4 text-slate-400" />
          {formatDate(event.date)} · {formatTime(event.time)}
        </div>
        <div className="inline-flex items-center gap-2">
          <MapPin className="h-4 w-4 text-slate-400" />
          {[event.venueName, event.city, event.state].filter(Boolean).join(", ") || "Venue TBD"}
        </div>
      </div>

      <div className="mt-5 rounded-[22px] bg-slate-50 p-4">
        <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
          Available pricing from backend source
        </div>
        <div className="mt-2 text-2xl font-semibold text-slate-950">
          {formatPriceRange(event.priceMin, event.priceMax)}
        </div>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          SmarterStub is showing source pricing from the current backend feed. No synthetic fee math or fake
          provider comparisons are included on this page.
        </p>
      </div>

      {event.performers ? (
        <p className="mt-4 text-sm leading-6 text-slate-600">
          <span className="font-semibold text-slate-950">Performers:</span> {event.performers}
        </p>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-3">
        <Link
          href={buildEventRoute(event)}
          className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
        >
          View event details
          <ArrowUpRight className="h-4 w-4" />
        </Link>
        {event.url ? (
          <a
            href={event.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-950"
          >
            Open source listing
            <Ticket className="h-4 w-4" />
          </a>
        ) : null}
      </div>
    </article>
  );
}
