import { Event, EventCategory, Listing, ProviderName } from "@/types";
import { getProvider } from "@/lib/fallback-data";

interface TicketmasterClassification {
  segment?: { name?: string };
  genre?: { name?: string };
  subGenre?: { name?: string };
}

interface TicketmasterVenue {
  id?: string;
  name?: string;
  city?: { name?: string };
  state?: { stateCode?: string; name?: string };
}

interface TicketmasterEvent {
  id: string;
  name?: string;
  url?: string;
  classifications?: TicketmasterClassification[];
  priceRanges?: Array<{ min?: number }>;
  dates?: {
    start?: {
      localDate?: string;
      localTime?: string;
    };
  };
  images?: Array<{ alt?: string }>;
  _embedded?: {
    venues?: TicketmasterVenue[];
    attractions?: Array<{ name?: string }>;
  };
}

const accentByCategory: Record<EventCategory, string> = {
  Concert: "from-fuchsia-500 via-rose-400 to-orange-300",
  Sports: "from-red-600 via-orange-500 to-amber-300",
  Comedy: "from-yellow-500 via-orange-500 to-red-500",
  Theater: "from-stone-700 via-amber-600 to-yellow-300",
  Festival: "from-emerald-500 via-teal-500 to-cyan-400"
};

function inferCategory(classifications?: string[]): EventCategory {
  const joined = (classifications ?? []).join(" ").toLowerCase();
  if (joined.includes("sport")) return "Sports";
  if (joined.includes("comedy")) return "Comedy";
  if (joined.includes("theater") || joined.includes("theatre") || joined.includes("broadway")) return "Theater";
  if (joined.includes("festival")) return "Festival";
  return "Concert";
}

function buildHistoricalPrices(basePrice: number) {
  return [1.12, 1.08, 1.04, 1.02, 1].map((multiplier) => Math.round(basePrice * multiplier));
}

function buildSyntheticListings(params: {
  eventId: string;
  provider: ProviderName;
  basePrice: number;
  purchaseUrl: string;
  category: EventCategory;
  listingsCount?: number;
}): Listing[] {
  const providerMeta = getProvider(params.provider);
  const count = params.listingsCount ?? 3;
  const sectionPool =
    params.category === "Sports"
      ? ["115", "224", "308"]
      : params.category === "Theater"
        ? ["ORCH", "MEZZ", "BALC"]
        : ["101", "204", "312"];
  const rowPool = params.category === "Theater" ? ["F", "J", "R"] : ["8", "14", "22"];

  return Array.from({ length: count }).map((_, index) => {
    const seatPremium = index * 12;
    const base = Math.max(25, Math.round(params.basePrice + seatPremium - index * 3));
    const feeEstimate = Math.round(base * ((providerMeta?.averageFeesPct ?? 18) / 100));
    const totalPrice = base + feeEstimate;
    const badgeSet: Listing["badges"] =
      index === 0
        ? ["Best Deal", "Lowest Total Price"]
        : index === 1
          ? ["Popular"]
          : ["Trusted Seller"];

    return {
      id: `${params.eventId}-${params.provider.toLowerCase().replace(/\s+/g, "-")}-${index + 1}`,
      provider: params.provider,
      basePrice: base,
      feeEstimate,
      totalPrice,
      section: sectionPool[index % sectionPool.length],
      row: rowPool[index % rowPool.length],
      quantity: index === 0 ? 2 : index === 1 ? 4 : 2,
      inventoryPrecision: "event-level",
      dealScore: 80,
      badges: badgeSet,
      notes: `${params.provider} normalized listing generated from available marketplace pricing data.`,
      purchaseUrl: params.purchaseUrl
    };
  });
}

export function normalizeTicketmasterEvent(raw: TicketmasterEvent): Event {
  const category = inferCategory(
    raw.classifications?.flatMap((classification) =>
      [
        classification.segment?.name,
        classification.genre?.name,
        classification.subGenre?.name
      ].filter((value): value is string => Boolean(value))
    )
  );
  const venue = raw._embedded?.venues?.[0];
  const minPrice = raw.priceRanges?.[0]?.min ? Math.round(raw.priceRanges[0].min) : 85;
  const purchaseUrl = raw.url ?? "#";
  const providerListings = buildSyntheticListings({
    eventId: `ticketmaster-${raw.id}`,
    provider: "Ticketmaster",
    basePrice: minPrice,
    purchaseUrl,
    category
  });

  return {
    id: `ticketmaster-${raw.id}`,
    slug: raw.name?.toLowerCase().replace(/[^a-z0-9]+/g, "-") ?? `ticketmaster-${raw.id}`,
    title: raw.name ?? "Ticketmaster Event",
    category,
    artistOrTeam: raw._embedded?.attractions?.[0]?.name ?? raw.name ?? "Live Event",
    date: raw.dates?.start?.localDate ?? new Date().toISOString().slice(0, 10),
    time: raw.dates?.start?.localTime ?? "7:30 PM",
    venueId: `venue-ticketmaster-${venue?.id ?? raw.id}`,
    venueName: venue?.name ?? "Ticketmaster Venue",
    city: venue?.city?.name ?? "Unknown City",
    state: venue?.state?.stateCode ?? venue?.state?.name ?? "",
    image: raw.images?.[0]?.alt ?? raw.name ?? "Live event photo",
    imageAccent: accentByCategory[category],
    popularity: 88,
    marketNote: "Normalized from Ticketmaster Discovery data with provider-level pricing synthesis.",
    featured: false,
    trending: false,
    historicalPrices: buildHistoricalPrices(minPrice + Math.round((providerListings[0]?.feeEstimate ?? 10) / 2)),
    searchTags: [raw.name, venue?.name, venue?.city?.name].filter((value): value is string => Boolean(value)),
    listings: providerListings
  };
}
