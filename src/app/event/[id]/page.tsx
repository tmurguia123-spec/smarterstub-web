import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowDownRight,
  ArrowUpRight,
  BadgeCheck,
  CheckCircle2,
  Clock3,
  MapPin,
  ShieldCheck,
  Ticket,
  Wallet
} from "lucide-react";
import { ScoringExplainer } from "@/components/scoring-explainer";
import { DevSourceIndicator } from "@/components/dev-source-indicator";
import { ScorePill } from "@/components/score-pill";
import {
  getEventComparison,
  getEventRanking,
  getEventTrend,
  getListingInsight,
  getProvider,
  getVenue
} from "@/lib/mock-data";
import { getUnifiedEventById } from "@/lib/ticket-service";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

function getEventSourceLabel(id: string) {
  if (id.startsWith("fallback-")) return "Fallback Data";
  if (id.startsWith("ticketmaster-")) return "Ticketmaster";
  if (id.startsWith("seatgeek-")) return "SeatGeek";
  if (id.startsWith("stubhub-")) return "StubHub";
  return "Mixed";
}

function isEventLevelGuidance(listing: { inventoryPrecision?: "exact" | "event-level" }) {
  return listing.inventoryPrecision === "event-level";
}

export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await getUnifiedEventById(id);

  if (!event) {
    notFound();
  }

  const venue = getVenue(event.venueId);
  const comparison = getEventComparison(event);
  const ranking = getEventRanking(event);
  const trend = getEventTrend(event);
  const listings = [...event.listings].sort(
    (a, b) => getListingInsight(event, b).confidenceScore - getListingInsight(event, a).confidenceScore
  );
  const smartestListing = event.listings.find((listing) => listing.id === ranking.bestOverallBuy) ?? event.listings[0];
  const budgetListing = event.listings.find((listing) => listing.id === ranking.bestBudgetBuy) ?? event.listings[0];
  const premiumListing = event.listings.find((listing) => listing.id === ranking.bestPremiumValue) ?? event.listings[0];
  const trustedListing = event.listings.find((listing) => listing.id === ranking.mostTrustedSeller) ?? event.listings[0];
  const lowestFeeListing = event.listings.find((listing) => listing.id === ranking.lowestFees) ?? event.listings[0];
  const smartestInsight = getListingInsight(event, smartestListing);
  const maxFee = Math.max(...event.listings.map((listing) => listing.feeEstimate));
  const sourceLabel = getEventSourceLabel(event.id);
  const smartestProvider = getProvider(smartestListing.provider);
  const smartestIsGuidance = isEventLevelGuidance(smartestListing);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <div className="mb-4 lg:sticky lg:top-[72px] lg:z-30 lg:mb-6">
        <div className="rounded-[20px] border border-slate-200 bg-white px-3 py-3 sm:rounded-[24px] sm:px-4 sm:py-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <div className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-700 sm:px-3 sm:text-xs sm:tracking-[0.14em]">
                {smartestIsGuidance ? "Best current Ticketmaster value" : "Smartest Ticket to Buy"}
              </div>
              <div>
                <div className="text-xs text-slate-500 sm:text-sm">
                  {smartestIsGuidance ? "Current provider guidance" : "Best overall ticket"}
                </div>
                <div className="text-base font-semibold text-slate-950 sm:text-lg">
                  {smartestIsGuidance
                    ? smartestListing.provider
                    : `${smartestListing.provider} · Sec ${smartestListing.section}, Row ${smartestListing.row}`}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:min-w-[640px] lg:gap-3">
              <div className="rounded-2xl bg-slate-50 px-3 py-2.5 sm:px-4 sm:py-3">
                <div className="text-[10px] uppercase tracking-[0.14em] text-slate-400">
                  {smartestIsGuidance ? "Estimated total" : "Total"}
                </div>
                <div className="mt-1 text-base font-semibold text-slate-950 sm:text-lg">
                  {formatCurrency(smartestListing.totalPrice)}
                </div>
              </div>
              <div className="rounded-2xl bg-slate-50 px-3 py-2.5 sm:px-4 sm:py-3">
                <div className="text-[10px] uppercase tracking-[0.14em] text-slate-400">Confidence</div>
                <div className="mt-1 text-base font-semibold text-slate-950 sm:text-lg">
                  {smartestInsight.confidenceScore}
                </div>
              </div>
              <div className="rounded-2xl bg-slate-50 px-3 py-2.5 sm:px-4 sm:py-3">
                <div className="text-[10px] uppercase tracking-[0.14em] text-slate-400">Recommendation</div>
                <div className="mt-1 text-xs font-semibold text-teal-700 sm:text-sm">
                  {smartestInsight.recommendation}
                </div>
              </div>
              <div className="rounded-2xl bg-slate-50 px-3 py-2.5 sm:px-4 sm:py-3">
                <div className="text-[10px] uppercase tracking-[0.14em] text-slate-400">Provider</div>
                <div className="mt-1 text-xs font-semibold text-slate-950 sm:text-sm">
                  {smartestProvider?.name ?? smartestListing.provider}
                </div>
              </div>
            </div>

            <a
              href={smartestListing.purchaseUrl}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white sm:w-auto sm:px-5 sm:py-3"
            >
              {smartestIsGuidance ? "View live options on Ticketmaster" : "Buy Smartest Ticket"}
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
          {smartestIsGuidance ? (
            <p className="mt-2 text-[11px] leading-5 text-slate-500 sm:mt-3 sm:text-xs">
              Exact seats and availability are confirmed on Ticketmaster.
            </p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.08fr,0.92fr] lg:gap-8">
        <section className="overflow-hidden rounded-[34px] border border-slate-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
          <div className={`relative bg-gradient-to-br ${event.imageAccent} p-8 text-white sm:p-10`}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.28),transparent_28%),linear-gradient(180deg,transparent,rgba(15,23,42,0.28))]" />
            <div className="relative">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="inline-flex rounded-full bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur">
                    {event.category}
                  </div>
                  <DevSourceIndicator label={sourceLabel} />
                </div>
                <ScorePill score={smartestInsight.confidenceScore} />
              </div>
              <h1 className="mt-6 max-w-3xl font-[var(--font-display)] text-4xl font-bold tracking-tight sm:text-5xl">
                {event.title}
              </h1>
              <div className="mt-6 flex flex-wrap gap-4 text-sm text-white/90">
                <span>{formatDate(event.date)} · {event.time}</span>
                <span className="inline-flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {venue?.name ?? event.venueName ?? "Venue TBA"}, {event.city}, {event.state}
                </span>
              </div>

              <div className="mt-8 rounded-[28px] border border-white/10 bg-white/10 p-5 backdrop-blur">
                <div className="text-sm font-medium text-white/80">Buy now vs wait</div>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-white">
                    {trend.recommendation}
                  </span>
                  <span className="text-sm text-white/80">
                    {trend.changePct > 0 ? "+" : ""}
                    {trend.changePct}% vs recent market
                  </span>
                </div>
                <div className="mt-3 max-w-2xl text-sm leading-7 text-white/90">{trend.summary}</div>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-[28px] bg-white/10 p-5 backdrop-blur">
                  <div className="text-sm text-white/70">Lowest total</div>
                  <div className="mt-2 text-3xl font-semibold">
                    {formatCurrency(comparison.lowestTotalPrice)}
                  </div>
                </div>
                <div className="rounded-[28px] bg-white/10 p-5 backdrop-blur">
                  <div className="text-sm text-white/70">Best overall buy</div>
                  <div className="mt-2 text-2xl font-semibold">{smartestListing.provider}</div>
                </div>
                <div className="rounded-[28px] bg-white/10 p-5 backdrop-blur">
                  <div className="text-sm text-white/70">Savings vs average</div>
                  <div className="mt-2 text-3xl font-semibold">
                    {formatCurrency(smartestInsight.savingsVsAverage)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-8 p-6 sm:p-8">
            <div className="rounded-[30px] bg-slate-950 p-6 text-white shadow-[0_24px_60px_rgba(15,23,42,0.2)]">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-300">
                    {smartestIsGuidance ? "Best current Ticketmaster value" : "Smartest Ticket to Buy"}
                  </div>
                  <div className="mt-3 text-3xl font-semibold">{smartestListing.provider}</div>
                  <div className="mt-2 text-5xl font-semibold">{formatCurrency(smartestListing.totalPrice)}</div>
                </div>
                <div className="rounded-[24px] bg-white/10 p-4">
                  <div className="text-xs uppercase tracking-[0.16em] text-slate-400">Deal rating</div>
                  <div className="mt-2 text-2xl font-semibold">{smartestInsight.dealRating}</div>
                  <div className="mt-1 text-sm text-emerald-300">{smartestInsight.recommendation}</div>
                </div>
              </div>
              <div className="mt-5 rounded-[24px] border border-white/10 bg-white/5 p-5">
                <div className="text-sm font-medium text-white/80">Why it is recommended</div>
                <p className="mt-3 text-sm leading-7 text-slate-300">{smartestInsight.summary}</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-[20px] bg-white/5 p-4">
                    <div className="text-xs uppercase tracking-[0.16em] text-slate-400">Comparable seat savings</div>
                    <div className="mt-1 text-xl font-semibold text-emerald-300">
                      {formatCurrency(smartestInsight.savingsVsAverage)}
                    </div>
                  </div>
                  <div className="rounded-[20px] bg-white/5 p-4">
                    <div className="text-xs uppercase tracking-[0.16em] text-slate-400">Savings vs expensive option</div>
                    <div className="mt-1 text-xl font-semibold text-emerald-300">
                      {formatCurrency(smartestInsight.savingsVsHighest)}
                    </div>
                  </div>
                  <div className="rounded-[20px] bg-white/5 p-4">
                    <div className="text-xs uppercase tracking-[0.16em] text-slate-400">
                      {smartestIsGuidance ? "Availability" : "Seat preview"}
                    </div>
                    <div className="mt-1 text-xl font-semibold">
                      {smartestIsGuidance
                        ? "Confirmed on Ticketmaster"
                        : `Sec ${smartestListing.section}, Row ${smartestListing.row}`}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[0.9fr,1.1fr]">
              <div className="rounded-[30px] border border-slate-200 bg-slate-50 p-6">
                <div className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Score factor breakdown
                </div>
                <div className="mt-5 space-y-3">
                  {Object.entries(smartestInsight.scoreFactors).map(([factor, value]) => (
                    <div key={factor}>
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="capitalize text-slate-600">
                          {factor.replace(/([A-Z])/g, " $1")}
                        </span>
                        <span className="font-semibold text-slate-950">{value}</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-200">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500"
                          style={{ width: `${value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[30px] border border-slate-200 bg-slate-50 p-6">
                <div className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Smart deal labels
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {[
                    { label: "Best Budget Buy", listing: budgetListing },
                    { label: "Best Premium Value", listing: premiumListing },
                    {
                      label: "Lowest Total Price",
                      listing:
                        event.listings.find((listing) => listing.id === ranking.lowestTotalPrice) ??
                        event.listings[0]
                    },
                    { label: "Lowest Fees", listing: lowestFeeListing },
                    { label: "Most Trusted Seller", listing: trustedListing }
                  ].map(({ label, listing }) => {
                    return (
                      <div key={label} className="rounded-[22px] bg-white p-4 shadow-sm">
                        <div className="text-xs uppercase tracking-[0.16em] text-slate-400">{label}</div>
                        <div className="mt-2 font-semibold text-slate-950">{listing.provider}</div>
                        <div className="mt-1 text-sm text-slate-600">
                          {formatCurrency(listing.totalPrice)}
                          {isEventLevelGuidance(listing) ? " estimated total" : ` · Sec ${listing.section}`}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                {
                  icon: Ticket,
                  title: "Lowest sticker price",
                  body: `${formatCurrency(comparison.lowestBasePrice)} before fees`
                },
                {
                  icon: ShieldCheck,
                  title: "Most trusted seller",
                  body: `${trustedListing.provider} with trust score ${getProvider(trustedListing.provider)?.trustScore}`
                },
                {
                  icon: Clock3,
                  title: "Market timing",
                  body: trend.recommendation
                }
              ].map((item) => (
                <div key={item.title} className="rounded-[28px] border border-slate-200 bg-white p-5">
                  <item.icon className="h-5 w-5 text-teal-700" />
                  <div className="mt-3 font-semibold text-slate-950">{item.title}</div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="rounded-[34px] border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
            <div className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">
              Buy confidence summary
            </div>
            <div className="mt-4 space-y-4">
              {[
                [
                  smartestIsGuidance ? "Best Current Ticketmaster Value" : "Best Overall Buy",
                  `${smartestListing.provider} · ${smartestInsight.confidenceScore}`
                ],
                ["Best Budget Buy", `${budgetListing.provider} · ${formatCurrency(budgetListing.totalPrice)}`],
                [
                  "Best Premium Value",
                  isEventLevelGuidance(premiumListing)
                    ? `${premiumListing.provider} · Estimated total ${formatCurrency(premiumListing.totalPrice)}`
                    : `${premiumListing.provider} · Sec ${premiumListing.section}`
                ]
              ].map(([label, value]) => (
                <div key={label} className="rounded-[24px] bg-slate-50 p-4">
                  <div className="text-sm text-slate-500">{label}</div>
                  <div className="mt-1 text-lg font-semibold text-slate-950">{value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[34px] border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
            <ScoringExplainer />
          </div>

          <div className="rounded-[34px] border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">
              <BadgeCheck className="h-4 w-4" />
              Trust + reliability
            </div>
            <div className="mt-4 space-y-3">
              {[
                { slot: "smartest", listing: smartestListing },
                { slot: "trusted", listing: trustedListing },
                { slot: "lowest-fee", listing: lowestFeeListing }
              ].map(({ slot, listing }) => {
                const provider = getProvider(listing.provider);
                return (
                  <div key={`${slot}-${listing.id}`} className="rounded-[24px] bg-slate-50 p-4">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-slate-950">{listing.provider}</div>
                      <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                        {provider?.verifiedMarketplace ? "Verified marketplace" : "Marketplace"}
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-slate-600">
                      Trust {provider?.trustScore} · Refund {provider?.refundFlexibility} · Delivery {provider?.deliveryReliability}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-[34px] border border-slate-200 bg-gradient-to-br from-white to-orange-50 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-orange-600">
              <Wallet className="h-4 w-4" />
              Transparency
            </div>
            <div className="mt-4 rounded-[24px] bg-white p-5 shadow-sm">
              <div className="text-lg font-semibold text-slate-950">Estimated total cost is central</div>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                SmarterStub ranks listings on all-in price, fee drag, seat quality, and trust rather than base price alone.
              </p>
            </div>
          </div>
        </aside>
      </div>

      <section className="mt-8 rounded-[34px] border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)] sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">
              Ranked listings
            </div>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
              Smart Deal Ranking across every listing
            </h2>
          </div>
          <Link href="/search" className="text-sm font-semibold text-slate-950">
            Back to search
          </Link>
        </div>

        <div className="mt-8 space-y-4">
          {listings.map((listing) => {
            const insight = getListingInsight(event, listing);
            const provider = getProvider(listing.provider);
            const feeWidth = `${(listing.feeEstimate / maxFee) * 100}%`;

            const labels = [
              listing.id === ranking.bestOverallBuy && "Best Overall Buy",
              listing.id === ranking.bestBudgetBuy && "Best Budget Buy",
              listing.id === ranking.bestPremiumValue && "Best Premium Value",
              listing.id === ranking.lowestTotalPrice && "Lowest Total Price",
              listing.id === ranking.lowestFees && "Lowest Fees",
              listing.id === ranking.mostTrustedSeller && "Most Trusted Seller"
            ].filter(Boolean) as string[];

            return (
              <div
                key={listing.id}
                className={cn(
                  "rounded-[30px] border p-5 transition duration-300 hover:-translate-y-0.5 hover:shadow-lg",
                  listing.id === ranking.bestOverallBuy
                    ? "border-teal-200 bg-teal-50/60"
                    : "border-slate-200 bg-white"
                )}
              >
                <div className="grid gap-5 lg:grid-cols-[1.15fr,0.85fr,0.9fr]">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="text-xl font-semibold text-slate-950">{listing.provider}</div>
                      {labels.map((label) => (
                        <span
                          key={label}
                          className={cn(
                            "rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]",
                            label === "Best Overall Buy"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-700"
                          )}
                        >
                          {label}
                        </span>
                      ))}
                    </div>
                    <div className="mt-2 text-sm text-slate-600">{insight.summary}</div>
                    <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-500">
                      {isEventLevelGuidance(listing) ? (
                        <span>Exact seats and availability are confirmed on Ticketmaster.</span>
                      ) : (
                        <>
                          <span>Sec {listing.section}</span>
                          <span>Row {listing.row}</span>
                          <span>Qty {listing.quantity}</span>
                        </>
                      )}
                    </div>
                    <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-slate-950 px-3 py-1.5 text-xs font-semibold text-white">
                      <BadgeCheck className="h-3.5 w-3.5 text-teal-300" />
                      {provider?.verifiedMarketplace ? "Verified marketplace" : "Marketplace"}
                    </div>
                  </div>

                  <div className="rounded-[24px] bg-slate-50 p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-xs uppercase tracking-[0.16em] text-slate-400">Confidence</div>
                      <div className="text-sm font-semibold text-slate-950">{insight.dealRating}</div>
                    </div>
                    <div className="mt-4">
                      <ScorePill score={insight.confidenceScore} compact />
                    </div>
                    <div className="mt-4 grid gap-3">
                      {[
                        ["Base price", formatCurrency(listing.basePrice)],
                        ["Estimated fees", formatCurrency(listing.feeEstimate)],
                        ["Estimated total", formatCurrency(listing.totalPrice)]
                      ].map(([label, value]) => (
                        <div key={label} className="flex items-center justify-between text-sm">
                          <span className="text-slate-500">{label}</span>
                          <span className="font-semibold text-slate-950">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[24px] bg-slate-950 p-4 text-white">
                    <div className="text-xs uppercase tracking-[0.16em] text-slate-400">Decision engine</div>
                    <div className="mt-4 grid gap-3">
                      <div>
                        <div className="text-sm text-slate-400">Recommendation</div>
                        <div className="mt-1 text-xl font-semibold">{insight.recommendation}</div>
                      </div>
                      <div>
                        <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.16em] text-slate-400">
                          <span>Fee drag</span>
                          <span>{insight.feePercent}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-white/10">
                          <div
                            className="h-2 rounded-full bg-gradient-to-r from-orange-400 to-rose-500"
                            style={{ width: feeWidth }}
                          />
                        </div>
                      </div>
                      <div className="inline-flex items-center gap-2 text-sm text-emerald-300">
                        <ArrowDownRight className="h-4 w-4" />
                        Save {formatCurrency(insight.savingsVsAverage)} vs market average
                      </div>
                      <a
                        href={listing.purchaseUrl}
                        className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
                      >
                        {isEventLevelGuidance(listing) ? "View live options on Ticketmaster" : "Go to site"}
                        <ArrowUpRight className="h-4 w-4" />
                      </a>
                      {isEventLevelGuidance(listing) ? (
                        <div className="text-xs text-slate-400">
                          Exact seats and availability are confirmed on Ticketmaster.
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            "Buy Confidence Score combines total cost, fees, seat quality, trust, delivery, and comparable-seat value.",
            "Buy Now vs Wait uses mock historical pricing to estimate whether the market is rising or stable.",
            "Smart Deal Ranking makes SmarterStub feel like a decision engine rather than a simple listing aggregator."
          ].map((item) => (
            <div key={item} className="rounded-[28px] bg-slate-50 p-5 text-sm leading-6 text-slate-600">
              <CheckCircle2 className="h-5 w-5 text-teal-700" />
              <div className="mt-3">{item}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
