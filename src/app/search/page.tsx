import Link from "next/link";
import {
  Calendar,
  MapPin,
  SearchCheck,
  SlidersHorizontal,
  Ticket
} from "lucide-react";
import { DevSourceIndicator } from "@/components/dev-source-indicator";
import { SearchBar } from "@/components/search-bar";
import { getEventComparison, getEventRanking, getListingInsight, trendingSearches } from "@/lib/mock-data";
import { Event, Listing } from "@/types";
import { searchUnifiedEvents } from "@/lib/ticket-service";
import { formatCurrency, formatDate } from "@/lib/utils";

const sortOptions = [
  { value: "smartest-deal", label: "Smartest Deal" },
  { value: "buy-confidence", label: "Buy Confidence" },
  { value: "lowest-total", label: "Lowest Total" },
  { value: "best-seat-value", label: "Best Seat Value" }
] as const;
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

function sortEvents(sort: string | undefined, input: Event[]) {
  const items = [...input];

  switch (sort) {
    case "buy-confidence":
      return items.sort((a, b) => getPrimaryInsight(b).confidenceScore - getPrimaryInsight(a).confidenceScore);
    case "best-seat-value":
      return items.sort(
        (a, b) =>
          getPrimaryInsight(b).seatQualityScore + getPrimaryInsight(b).confidenceScore -
          (getPrimaryInsight(a).seatQualityScore + getPrimaryInsight(a).confidenceScore)
      );
    case "smartest-deal":
      return items.sort(
        (a, b) =>
          getPrimaryInsight(b).confidenceScore + getEventComparison(b).savingsVsHighest -
          (getPrimaryInsight(a).confidenceScore + getEventComparison(a).savingsVsHighest)
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

function getPrimaryListing(event: Event): Listing {
  const ranking = getEventRanking(event);
  return event.listings.find((listing) => listing.id === ranking.bestOverallBuy) ?? event.listings[0];
}

function getPrimaryInsight(event: Event) {
  return getListingInsight(event, getPrimaryListing(event));
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
  const sourceLabel = getSearchSourceLabel(results.map((event) => event.id));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 sm:p-8">
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
          <div className="rounded-[20px] border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-600">
            <div className="font-semibold text-slate-950">{resultCount} events ranked</div>
            <div className="mt-1">Best Overall Buy and score-based recommendations surface first.</div>
          </div>
        </div>

        <div className="mt-8">
          {/* Search route changes now use plain navigations, so the bar can stay simple and deterministic. */}
          <SearchBar defaultValue={query} compact />
        </div>

        <div className="mt-8 grid gap-4">
          <section className="rounded-[28px] bg-slate-50 p-5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              <SlidersHorizontal className="h-4 w-4" />
              Safe Filter Mode
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Filters now use direct links instead of native dropdowns to avoid the remaining
              production crash tied to dropdown interaction on this page.
            </p>
            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="grid gap-2 text-sm text-slate-600">
                <span className="font-medium text-slate-700">Sort</span>
                <div className="flex flex-wrap gap-2">
                  {sortOptions.map((item) => {
                    const isActive = sort === item.value;

                    return (
                      <a
                        key={item.value}
                        href={makeSearchHref(query, item.value, type, city, provider)}
                        className={`rounded-full border px-3 py-2 text-sm ${
                          isActive
                            ? "border-slate-950 bg-slate-950 text-white"
                            : "border-slate-200 bg-white text-slate-600"
                        }`}
                      >
                        {item.label}
                      </a>
                    );
                  })}
                </div>
              </div>
              <div className="grid gap-2 text-sm text-slate-600">
                <span className="font-medium text-slate-700">Category</span>
                <div className="flex flex-wrap gap-2">
                  {categories.map((item) => (
                    <a
                      key={item}
                      href={makeSearchHref(query, sort, item, city, provider)}
                      className={`rounded-full border px-3 py-2 text-sm ${
                        type === item
                          ? "border-slate-950 bg-slate-950 text-white"
                          : "border-slate-200 bg-white text-slate-600"
                      }`}
                    >
                      {item}
                    </a>
                  ))}
                </div>
              </div>
              <div className="grid gap-2 text-sm text-slate-600">
                <span className="font-medium text-slate-700">City</span>
                <div className="flex flex-wrap gap-2">
                  {cities.map((item) => (
                    <a
                      key={item}
                      href={makeSearchHref(query, sort, type, item, provider)}
                      className={`rounded-full border px-3 py-2 text-sm ${
                        city === item
                          ? "border-slate-950 bg-slate-950 text-white"
                          : "border-slate-200 bg-white text-slate-600"
                      }`}
                    >
                      {item}
                    </a>
                  ))}
                </div>
              </div>
              <div className="grid gap-2 text-sm text-slate-600">
                <span className="font-medium text-slate-700">Provider</span>
                <div className="flex flex-wrap gap-2">
                  {providers.map((item) => (
                    <a
                      key={item}
                      href={makeSearchHref(query, sort, type, city, item)}
                      className={`rounded-full border px-3 py-2 text-sm ${
                        provider === item
                          ? "border-slate-950 bg-slate-950 text-white"
                          : "border-slate-200 bg-white text-slate-600"
                      }`}
                    >
                      {item}
                    </a>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <a
                href={makeSearchHref(query, "smartest-deal", "All", "All Cities", "All Providers")}
                className="rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-600"
              >
                Reset
              </a>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
              {[
                `Sort: ${sort}`,
                `Category: ${type}`,
                `City: ${city}`,
                `Provider: ${provider}`
              ].map((item) => (
                <span key={item} className="rounded-full border border-slate-200 bg-white px-3 py-1.5">
                  {item}
                </span>
              ))}
            </div>
          </section>
        </div>
      </div>

      {resultCount === 0 ? (
        <div className="mt-10 rounded-[28px] border border-dashed border-slate-300 bg-white p-10 text-center">
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
              <a
                key={item}
                href={`/search?q=${encodeURIComponent(item)}`}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600"
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-10 grid gap-4">
          {results.map((event) => {
            const comparison = getEventComparison(event);
            const smartestListing = getPrimaryListing(event);
            const insight = getPrimaryInsight(event);

            return (
              <article
                key={event.id}
                className="rounded-[24px] border border-slate-200 bg-white p-6"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600">
                        {event.category}
                      </span>
                      <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-700">
                        {insight.dealRating}
                      </span>
                    </div>
                    <h2 className="text-2xl font-semibold tracking-tight text-slate-950">{event.title}</h2>
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
                    <p className="max-w-3xl text-sm leading-7 text-slate-600">
                      {event.marketNote ?? insight.summary}
                    </p>
                  </div>

                  <div className="min-w-[220px] rounded-[24px] bg-slate-50 p-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                      Smartest Ticket
                    </div>
                    <div className="mt-2 text-3xl font-semibold text-slate-950">
                      {formatCurrency(smartestListing.totalPrice)}
                    </div>
                    <div className="mt-2 text-sm text-slate-500">
                      {smartestListing.provider} · Sec {smartestListing.section} · Row {smartestListing.row}
                    </div>
                    <div className="mt-3 text-sm font-medium text-teal-700">
                      Score {insight.confidenceScore} · Save {formatCurrency(comparison.savingsVsHighest)}
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
                    <Ticket className="h-4 w-4 text-teal-700" />
                    {comparison.comparedProviders} providers compared
                  </div>
                  <Link
                    href={`/event/${event.id}`}
                    className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
                  >
                    View event details
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
