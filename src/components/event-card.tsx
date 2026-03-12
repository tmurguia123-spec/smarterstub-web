import Link from "next/link";
import {
  ArrowDownRight,
  ArrowUpRight,
  BadgeCheck,
  Calendar,
  MapPin,
  ShieldCheck,
  Ticket
} from "lucide-react";
import { Event } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { getEventComparison, getEventRanking, getListingInsight, getProvider } from "@/lib/mock-data";
import { ScorePill } from "@/components/score-pill";

export function EventCard({ event }: { event: Event }) {
  const comparison = getEventComparison(event);
  const ranking = getEventRanking(event);
  const smartestListing = event.listings.find((listing) => listing.id === ranking.bestOverallBuy) ?? event.listings[0];
  const lowestFeeListing = event.listings.find((listing) => listing.id === ranking.lowestFees) ?? event.listings[0];
  const insight = getListingInsight(event, smartestListing);
  const provider = getProvider(smartestListing.provider);
  const priceDropPct = Math.round((comparison.savingsVsHighest / comparison.highestTotalPrice) * 100);

  return (
    <article className="group overflow-hidden rounded-[30px] border border-slate-200/80 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_70px_rgba(15,23,42,0.14)]">
      <div className={`relative h-56 bg-gradient-to-br ${event.imageAccent} p-6 text-white`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.3),transparent_28%),linear-gradient(180deg,transparent,rgba(15,23,42,0.28))]" />
        <div className="relative flex items-start justify-between gap-3">
          <div className="inline-flex rounded-full bg-white/18 px-3 py-1 text-xs font-medium backdrop-blur">
            {event.category}
          </div>
          <ScorePill score={insight.confidenceScore} compact />
        </div>
        <div className="relative mt-12 max-w-sm text-xl font-semibold leading-tight">{event.image}</div>
        <div className="relative mt-5 inline-flex items-center gap-2 rounded-full bg-emerald-400/18 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
          <ArrowDownRight className="h-3.5 w-3.5" />
          {priceDropPct}% below top market
        </div>
      </div>

      <div className="space-y-5 p-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-2xl font-semibold tracking-tight text-slate-950">{event.title}</h3>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-700">
              Best Overall Buy
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-700">
              {insight.dealRating}
            </span>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-slate-500">
            <span className="inline-flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {formatDate(event.date)} · {event.time}
            </span>
            <span className="inline-flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {event.city}, {event.state}
            </span>
          </div>
        </div>

        <div className="rounded-[28px] bg-gradient-to-br from-slate-50 to-white p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-xs uppercase tracking-[0.16em] text-slate-400">Smartest ticket to buy</div>
              <div className="mt-1 text-2xl font-semibold text-slate-950">
                {formatCurrency(smartestListing.totalPrice)}
              </div>
              <div className="mt-1 text-sm text-slate-500">
                Sec {smartestListing.section} · Row {smartestListing.row} · {smartestListing.provider}
              </div>
            </div>
            <div className="rounded-3xl bg-slate-950 px-4 py-3 text-white">
              <div className="text-xs uppercase tracking-[0.16em] text-slate-400">Rec</div>
              <div className="mt-1 text-sm font-semibold">{insight.recommendation}</div>
            </div>
          </div>
          <div className="mt-4 text-sm leading-6 text-slate-600">{insight.summary}</div>
        </div>

        <div className="grid gap-3 rounded-[28px] border border-slate-200/80 bg-white p-4 sm:grid-cols-3">
          <div>
            <div className="text-xs uppercase tracking-[0.16em] text-slate-400">Best score</div>
            <div className="mt-1 text-2xl font-semibold text-slate-950">{insight.confidenceScore}</div>
            <div className="mt-1 text-xs text-slate-500">Buy Confidence Score</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.16em] text-slate-400">Seat preview</div>
            <div className="mt-1 text-2xl font-semibold text-slate-950">Sec {smartestListing.section}</div>
            <div className="mt-1 text-xs text-slate-500">Row {smartestListing.row} · Qty {smartestListing.quantity}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.16em] text-slate-400">Compared</div>
            <div className="mt-1 inline-flex items-center gap-2 text-2xl font-semibold text-slate-950">
              <Ticket className="h-5 w-5 text-teal-600" />
              {comparison.comparedProviders}
            </div>
            <div className="mt-1 text-xs text-slate-500">
              Lowest fees from {formatCurrency(lowestFeeListing.feeEstimate)}
            </div>
          </div>
        </div>

        <div className="grid gap-4 rounded-[28px] border border-slate-200/80 bg-white p-4 sm:grid-cols-[1.3fr,0.7fr]">
          <div>
            <div className="text-xs uppercase tracking-[0.16em] text-slate-400">Why SmarterStub recommends it</div>
            <div className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-950">
              <BadgeCheck className="h-4 w-4 text-teal-600" />
              {provider?.name} verified marketplace
            </div>
            <div className="mt-2 flex items-center gap-2 text-sm text-emerald-700">
              <ArrowDownRight className="h-4 w-4" />
              Save {formatCurrency(insight.savingsVsAverage)} versus marketplace average
            </div>
            <div className="mt-2 flex items-center gap-2 text-sm text-slate-600">
              <ShieldCheck className="h-4 w-4 text-slate-400" />
              Most trusted seller, lowest fees, and premium value winners are ranked separately on detail
            </div>
          </div>
          <div className="rounded-3xl bg-slate-950 p-4 text-white">
            <div className="text-xs uppercase tracking-[0.16em] text-slate-400">Deal rating</div>
            <div className="mt-2 text-2xl font-semibold">{insight.dealRating}</div>
            <div className="mt-1 text-xs text-slate-400">Trust {provider?.trustScore ?? 90}</div>
          </div>
        </div>

        <Link
          href={`/event/${event.id}`}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-slate-950 via-slate-900 to-teal-900 px-5 py-3 text-sm font-semibold text-white transition duration-300 hover:gap-3 hover:shadow-lg"
        >
          See Smart Ranking
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}
