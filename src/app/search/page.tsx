import Link from "next/link";
import {
  Calendar,
  Flame,
  LayoutGrid,
  MapPin,
  SearchCheck,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  TrendingUp
} from "lucide-react";
import { EventCard } from "@/components/event-card";
import { DevSourceIndicator } from "@/components/dev-source-indicator";
import { FilterChip } from "@/components/filter-chip";
import { ScoringExplainer } from "@/components/scoring-explainer";
import { SearchBar } from "@/components/search-bar";
import { getEventComparison, getEventRanking, getEventTrend, getListingInsight, trendingSearches } from "@/lib/mock-data";
import { Event } from "@/types";
import { searchUnifiedEvents } from "@/lib/ticket-service";
import { formatCurrency, formatDate } from "@/lib/utils";

const categories = ["All", "Concert", "Sports", "Comedy", "Theater"];
const cities = ["All Cities", "Kansas City", "New York", "Los Angeles", "Chicago", "Seattle", "Austin"];
const providers = ["All Providers", "Ticketmaster", "SeatGeek", "Gametime", "StubHub", "Vivid Seats", "TickPick"];
const SEARCH_QUERY_MAX_LENGTH = 60;

function sanitizeSearchQuery(value: string | undefined) {
  return (value ?? "").replace(/\s+/g, " ").trim().slice(0, SEARCH_QUERY_MAX_LENGTH);
}

function pickAllowedValue<T extends string>(value: string | undefined, allowed: readonly T[], fallback: T) {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

function getEventSmartScore(event: Event) {
  const ranking = getEventRanking(event);
  const smartest = event.listings.find((listing) => listing.id === ranking.bestOverallBuy) ?? event.listings[0];
  return getListingInsight(event, smartest).confidenceScore;
}

function getBestSeatValue(event: Event) {
  const ranking = getEventRanking(event);
  const premium = event.listings.find((listing) => listing.id === ranking.bestPremiumValue) ?? event.listings[0];
  return getListingInsight(event, premium).seatQualityScore + getListingInsight(event, premium).confidenceScore;
}

function sortEvents(sort: string | undefined, input: Event[]) {
  const items = [...input];

  switch (sort) {
    case "buy-confidence":
      return items.sort((a, b) => getEventSmartScore(b) - getEventSmartScore(a));
    case "best-seat-value":
      return items.sort((a, b) => getBestSeatValue(b) - getBestSeatValue(a));
    case "smartest-deal":
      return items.sort(
        (a, b) =>
          getEventSmartScore(b) + getEventComparison(b).savingsVsHighest -
          (getEventSmartScore(a) + getEventComparison(a).savingsVsHighest)
      );
    case "lowest-total":
    default:
      return items.sort(
        (a, b) => getEventComparison(a).lowestTotalPrice - getEventComparison(b).lowestTotalPrice
      );
  }
}

function makeSearchHref(query: string, sort: string, type: string, city: string, provider: string) {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (sort !== "smartest-deal") params.set("sort", sort);
  if (type !== "All") params.set("type", type);
  if (city !== "All Cities") params.set("city", city);
  if (provider !== "All Providers") params.set("provider", provider);
  const stringified = params.toString();
  return `/search${stringified ? `?${stringified}` : ""}`;
}

function getSearchSourceLabel(eventIds: string[]) {
  const sources = new Set(
    eventIds.map((id) => {
      if (id.startsWith("fallback-")) return "Fallback Data";
      if (id.startsWith("ticketmaster-")) return "Ticketmaster";
      if (id.startsWith("seatgeek-")) return "SeatGeek";
      if (id.startsWith("stubhub-")) return "StubHub";
      return "Unknown";
    })
  );

  if (sources.size === 0) return "Fallback Data";
  if (sources.size === 1) return Array.from(sources)[0];
  return "Mixed";
}

export default async function SearchPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const query = sanitizeSearchQuery(typeof params.q === "string" ? params.q : "");
  const sort = pickAllowedValue(
    typeof params.sort === "string" ? params.sort : undefined,
    ["smartest-deal", "buy-confidence", "lowest-total", "best-seat-value"] as const,
    "smartest-deal"
  );
  const type = pickAllowedValue(
    typeof params.type === "string" ? params.type : undefined,
    categories,
    "All"
  );
  const city = pickAllowedValue(
    typeof params.city === "string" ? params.city : undefined,
    cities,
    "All Cities"
  );
  const provider = pickAllowedValue(
    typeof params.provider === "string" ? params.provider : undefined,
    providers,
    "All Providers"
  );
  const searchBarRouteKey = [query, sort, type, city, provider].join("|");

  const searchResult = await searchUnifiedEvents(query);
  const results = sortEvents(
    sort,
    searchResult.events.filter((event) => {
      const typeMatch = type === "All" || event.category === type;
      const cityMatch = city === "All Cities" || event.city === city;
      const providerMatch =
        provider === "All Providers" ||
        event.listings.some((listing) => listing.provider === provider);

      return typeMatch && cityMatch && providerMatch;
    })
  );

  const resultCount = results.length;
  const topEvent = results[0];
  const sourceLabel = getSearchSourceLabel(results.map((event) => event.id));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-[34px] border border-slate-200/80 bg-white/90 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <div className="text-sm font-semibold uppercase tracking-[0.22em] text-teal-700">
              Smart Deal Ranking
            </div>
            <h1 className="font-[var(--font-display)] text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">
              {query ? `Smart results for "${query}"` : "Explore ticket deals"}
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-slate-600">
              Sort by smartest deal, Buy Confidence Score, lowest total price, or best seat value.
            </p>
            {searchResult.usedFallback ? (
              <p className="text-sm text-amber-700">
                Live providers unavailable or not configured. Showing resilient fallback catalog.
              </p>
            ) : null}
            <DevSourceIndicator label={sourceLabel} />
          </div>
          <div className="rounded-[26px] bg-gradient-to-br from-slate-950 via-slate-900 to-teal-900 px-5 py-4 text-sm text-slate-200 shadow-lg">
            <div className="font-semibold text-white">{resultCount} events ranked</div>
            <div className="mt-1">Best Overall Buy and score-based recommendations surface first.</div>
          </div>
        </div>

        <div className="mt-8">
          {/* Remount the submit-only search bar on route changes so the input stays in sync with sanitized params. */}
          <SearchBar key={searchBarRouteKey} defaultValue={query} compact />
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-[1.2fr,1fr]">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-[28px] bg-slate-50 p-5">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                <SlidersHorizontal className="h-4 w-4" />
                Sort by
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <FilterChip href={makeSearchHref(query, "smartest-deal", type, city, provider)} active={sort === "smartest-deal"}>
                  Smartest Deal
                </FilterChip>
                <FilterChip href={makeSearchHref(query, "buy-confidence", type, city, provider)} active={sort === "buy-confidence"}>
                  Buy Confidence
                </FilterChip>
                <FilterChip href={makeSearchHref(query, "lowest-total", type, city, provider)} active={sort === "lowest-total"}>
                  Lowest Total Price
                </FilterChip>
                <FilterChip href={makeSearchHref(query, "best-seat-value", type, city, provider)} active={sort === "best-seat-value"}>
                  Best Seat Value
                </FilterChip>
              </div>
            </div>
            <div className="rounded-[28px] bg-slate-50 p-5">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Filters
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {categories.map((item) => (
                  <FilterChip
                    key={item}
                    href={makeSearchHref(query, sort, item, city, provider)}
                    active={type === item}
                  >
                    {item}
                  </FilterChip>
                ))}
                {cities.slice(0, 4).map((item) => (
                  <FilterChip
                    key={item}
                    href={makeSearchHref(query, sort, type, item, provider)}
                    active={city === item}
                  >
                    {item}
                  </FilterChip>
                ))}
                {providers.slice(0, 4).map((item) => (
                  <FilterChip
                    key={item}
                    href={makeSearchHref(query, sort, type, city, item)}
                    active={provider === item}
                  >
                    {item}
                  </FilterChip>
                ))}
              </div>
            </div>
          </div>
          <ScoringExplainer />
        </div>
      </div>

      {resultCount === 0 ? (
        <div className="mt-10 rounded-[34px] border border-dashed border-slate-300 bg-white p-10 text-center shadow-[0_18px_45px_rgba(15,23,42,0.05)]">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-orange-100 to-teal-100">
            <SearchCheck className="h-8 w-8 text-slate-600" />
          </div>
          <h2 className="mt-6 text-3xl font-semibold text-slate-950">No ranked listings surfaced yet</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-600">
            Try a broader artist, team, venue, or city search. SmarterStub will re-rank the best
            available inventory as soon as a match is found.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {trendingSearches.slice(0, 4).map((item) => (
              <Link
                key={item}
                href={`/search?q=${encodeURIComponent(item)}`}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-950"
              >
                {item}
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-10 grid gap-6 xl:grid-cols-[1.25fr,0.75fr]">
          <div className="grid gap-6">
            {results.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
          <aside className="space-y-6">
            {topEvent ? (
              <div className="rounded-[34px] border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-teal-900 p-6 text-white shadow-[0_24px_70px_rgba(15,23,42,0.2)]">
                <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-teal-300">
                  <Sparkles className="h-4 w-4" />
                  Top Smart Deal
                </div>
                <div className="mt-4 text-2xl font-semibold">{topEvent.title}</div>
                <div className="mt-2 text-sm text-slate-300">{topEvent.marketNote}</div>
                {(() => {
                  const ranking = getEventRanking(topEvent);
                  const smartest = topEvent.listings.find((listing) => listing.id === ranking.bestOverallBuy) ?? topEvent.listings[0];
                  const insight = getListingInsight(topEvent, smartest);
                  const trend = getEventTrend(topEvent);
                  return (
                    <div className="mt-6 grid gap-3">
                      {[
                        ["Buy Confidence Score", `${insight.confidenceScore}`],
                        ["Recommendation", trend.recommendation],
                        ["Savings vs average", formatCurrency(insight.savingsVsAverage)]
                      ].map(([label, value]) => (
                        <div key={label} className="rounded-[22px] border border-white/10 bg-white/5 p-4">
                          <div className="text-xs uppercase tracking-[0.16em] text-slate-400">{label}</div>
                          <div className="mt-1 text-xl font-semibold text-white">{value}</div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            ) : null}

            <div className="rounded-[34px] border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
              <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">
                <TrendingUp className="h-4 w-4" />
                Trending searches
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {trendingSearches.map((item) => (
                  <Link
                    key={item}
                    href={`/search?q=${encodeURIComponent(item)}`}
                    className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
                  >
                    {item}
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-[34px] border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
              <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">
                <ShieldCheck className="h-4 w-4" />
                Ranking signals
              </div>
              <div className="mt-4 space-y-3">
                {[
                  "Best Overall Buy maximizes confidence score, trust, and seat-adjusted value.",
                  "Best Budget Buy prioritizes low total price without throwing away reliability.",
                  "Best Premium Value prioritizes seat quality adjusted for comparable-seat pricing."
                ].map((item) => (
                  <div key={item} className="rounded-[22px] bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[34px] border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
              <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">
                <LayoutGrid className="h-4 w-4" />
                Ranked picks
              </div>
              <div className="mt-4 space-y-4">
                {results.slice(0, 3).map((event) => {
                  const trend = getEventTrend(event);
                  const ranking = getEventRanking(event);
                  const listing = event.listings.find((item) => item.id === ranking.bestOverallBuy) ?? event.listings[0];
                  const insight = getListingInsight(event, listing);
                  return (
                    <Link
                      key={event.id}
                      href={`/event/${event.id}`}
                      className="block rounded-[24px] bg-slate-50 p-4 transition duration-300 hover:-translate-y-0.5 hover:bg-slate-100"
                    >
                      <div className="font-semibold text-slate-950">{event.title}</div>
                      <div className="mt-2 flex flex-wrap gap-3 text-sm text-slate-500">
                        <span className="inline-flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {formatDate(event.date)}
                        </span>
                        <span className="inline-flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {event.city}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-sm">
                        <span className="font-semibold text-slate-950">Score {insight.confidenceScore}</span>
                        <span className="text-teal-700">{trend.recommendation}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[34px] border border-slate-200 bg-gradient-to-br from-white to-orange-50 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
              <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-orange-600">
                <Flame className="h-4 w-4" />
                Smart buy cues
              </div>
              <div className="mt-4 rounded-[24px] bg-white p-5 shadow-sm">
                <div className="text-lg font-semibold text-slate-950">Buyer guidance feels immediate</div>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Score, deal rating, and buy timing now differentiate SmarterStub within a few seconds of landing.
                </p>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
