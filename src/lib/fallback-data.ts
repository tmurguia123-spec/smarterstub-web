import { Event, Provider, Venue } from "@/types";

export const providers: Provider[] = [
  {
    id: "ticketmaster",
    name: "Ticketmaster",
    summary: "Official inventory and broad venue partnerships.",
    trustScore: 94,
    averageFeesPct: 24,
    accent: "from-sky-500 to-blue-700",
    verifiedMarketplace: true,
    refundFlexibility: 82,
    deliveryReliability: 96
  },
  {
    id: "seatgeek",
    name: "SeatGeek",
    summary: "Clean UX with strong mobile checkout momentum.",
    trustScore: 91,
    averageFeesPct: 22,
    accent: "from-emerald-500 to-teal-600",
    verifiedMarketplace: true,
    refundFlexibility: 76,
    deliveryReliability: 89
  },
  {
    id: "gametime",
    name: "Gametime",
    summary: "Fast purchase flow for last-minute buyers.",
    trustScore: 89,
    averageFeesPct: 19,
    accent: "from-orange-500 to-amber-500",
    verifiedMarketplace: true,
    refundFlexibility: 70,
    deliveryReliability: 94
  },
  {
    id: "stubhub",
    name: "StubHub",
    summary: "Deep resale selection with broad event coverage.",
    trustScore: 90,
    averageFeesPct: 25,
    accent: "from-indigo-500 to-violet-600",
    verifiedMarketplace: true,
    refundFlexibility: 68,
    deliveryReliability: 87
  },
  {
    id: "vivid-seats",
    name: "Vivid Seats",
    summary: "Competitive pricing with reward-driven repeat usage.",
    trustScore: 88,
    averageFeesPct: 23,
    accent: "from-rose-500 to-red-500",
    verifiedMarketplace: true,
    refundFlexibility: 72,
    deliveryReliability: 86
  },
  {
    id: "tickpick",
    name: "TickPick",
    summary: "Fee-transparent positioning for total price shoppers.",
    trustScore: 92,
    averageFeesPct: 12,
    accent: "from-cyan-500 to-sky-500",
    verifiedMarketplace: true,
    refundFlexibility: 78,
    deliveryReliability: 90
  }
];

export const venues: Venue[] = [
  { id: "arrowhead", name: "GEHA Field at Arrowhead Stadium", city: "Kansas City", state: "MO", capacity: 76416 },
  { id: "msg", name: "Madison Square Garden", city: "New York", state: "NY", capacity: 19812 },
  { id: "hollywood-bowl", name: "Hollywood Bowl", city: "Los Angeles", state: "CA", capacity: 17500 },
  { id: "wrigley", name: "Wrigley Field", city: "Chicago", state: "IL", capacity: 41649 },
  { id: "mccaw", name: "McCaw Hall", city: "Seattle", state: "WA", capacity: 2963 },
  { id: "moody", name: "Moody Center", city: "Austin", state: "TX", capacity: 15000 }
];

const rawFallbackEvents: Event[] = [
  {
    id: "eras-kc",
    slug: "taylor-swift-kansas-city",
    title: "Taylor Swift: The Eras Encore",
    category: "Concert",
    artistOrTeam: "Taylor Swift",
    date: "2026-07-18",
    time: "7:30 PM",
    venueId: "arrowhead",
    city: "Kansas City",
    state: "MO",
    image: "Stadium lights and a sea of wristbands",
    imageAccent: "from-fuchsia-500 via-rose-400 to-orange-300",
    popularity: 99,
    marketNote: "Fans are paying up for lower bowl. Low-fee inventory is moving fastest.",
    featured: true,
    trending: true,
    historicalPrices: [286, 278, 264, 253, 242, 230],
    searchTags: ["taylor swift", "kansas city", "eras", "pop", "arrowhead"],
    listings: [
      {
        id: "eras-kc-1",
        provider: "TickPick",
        basePrice: 212,
        feeEstimate: 18,
        totalPrice: 230,
        section: "127",
        row: "19",
        quantity: 2,
        dealScore: 97,
        badges: ["Best Deal", "Lowest Total Price", "Trusted Seller"],
        notes: "Strong lower-bowl sightline and low fee drag.",
        purchaseUrl: "#"
      },
      {
        id: "eras-kc-2",
        provider: "SeatGeek",
        basePrice: 198,
        feeEstimate: 44,
        totalPrice: 242,
        section: "132",
        row: "24",
        quantity: 2,
        dealScore: 92,
        badges: ["Popular"],
        notes: "Lower sticker price, but fees erase most of the gap.",
        purchaseUrl: "#"
      },
      {
        id: "eras-kc-3",
        provider: "Gametime",
        basePrice: 205,
        feeEstimate: 29,
        totalPrice: 234,
        section: "126",
        row: "27",
        quantity: 4,
        dealScore: 94,
        badges: ["Fast Checkout"],
        notes: "Quickest mobile flow for last-minute buyers.",
        purchaseUrl: "#"
      },
      {
        id: "eras-kc-4",
        provider: "StubHub",
        basePrice: 189,
        feeEstimate: 61,
        totalPrice: 250,
        section: "120",
        row: "31",
        quantity: 2,
        dealScore: 89,
        badges: ["Trusted Seller"],
        notes: "Reliable inventory but fees are materially higher.",
        purchaseUrl: "#"
      }
    ]
  },
  {
    id: "chiefs-home-opener",
    slug: "chiefs-home-opener-2026",
    title: "Kansas City Chiefs vs. Buffalo Bills",
    category: "Sports",
    artistOrTeam: "Kansas City Chiefs",
    date: "2026-09-13",
    time: "3:25 PM",
    venueId: "arrowhead",
    city: "Kansas City",
    state: "MO",
    image: "Tailgate energy under a bright afternoon sky",
    imageAccent: "from-red-600 via-orange-500 to-amber-300",
    popularity: 96,
    marketNote: "Upper deck inventory is stable now, but trusted resale options are tightening.",
    featured: true,
    trending: true,
    historicalPrices: [154, 158, 162, 163, 161],
    searchTags: ["chiefs", "buffalo bills", "nfl", "arrowhead", "kansas city"],
    listings: [
      {
        id: "chiefs-1",
        provider: "Ticketmaster",
        basePrice: 148,
        feeEstimate: 31,
        totalPrice: 179,
        section: "306",
        row: "11",
        quantity: 2,
        dealScore: 90,
        badges: ["Trusted Seller"],
        notes: "Official inventory with immediate transfer confidence.",
        purchaseUrl: "#"
      },
      {
        id: "chiefs-2",
        provider: "TickPick",
        basePrice: 152,
        feeEstimate: 9,
        totalPrice: 161,
        section: "313",
        row: "8",
        quantity: 4,
        dealScore: 96,
        badges: ["Best Deal", "Lowest Fees"],
        notes: "Slightly higher base price, but clearly best total.",
        purchaseUrl: "#"
      },
      {
        id: "chiefs-3",
        provider: "Vivid Seats",
        basePrice: 139,
        feeEstimate: 34,
        totalPrice: 173,
        section: "308",
        row: "17",
        quantity: 2,
        dealScore: 91,
        badges: ["Popular"],
        notes: "Good value for a mid-level section.",
        purchaseUrl: "#"
      },
      {
        id: "chiefs-4",
        provider: "Gametime",
        basePrice: 143,
        feeEstimate: 22,
        totalPrice: 165,
        section: "311",
        row: "13",
        quantity: 2,
        dealScore: 93,
        badges: ["Fast Checkout"],
        notes: "Useful if you expect to buy close to kickoff.",
        purchaseUrl: "#"
      }
    ]
  },
  {
    id: "msg-billy",
    slug: "billy-joel-msg",
    title: "Billy Joel at Madison Square Garden",
    category: "Concert",
    artistOrTeam: "Billy Joel",
    date: "2026-05-09",
    time: "8:00 PM",
    venueId: "msg",
    city: "New York",
    state: "NY",
    image: "Arena crowd glowing under piano spotlight",
    imageAccent: "from-sky-700 via-cyan-500 to-emerald-300",
    popularity: 88,
    marketNote: "Fee-transparent listings outperform sticker-price offers on this event.",
    featured: true,
    historicalPrices: [126, 128, 127, 125, 123],
    searchTags: ["billy joel", "msg", "madison square garden", "new york"],
    listings: [
      {
        id: "billy-1",
        provider: "SeatGeek",
        basePrice: 110,
        feeEstimate: 24,
        totalPrice: 134,
        section: "212",
        row: "9",
        quantity: 2,
        dealScore: 95,
        badges: ["Best Deal", "Popular"],
        notes: "Consistent balance of price and section quality.",
        purchaseUrl: "#"
      },
      {
        id: "billy-2",
        provider: "TickPick",
        basePrice: 116,
        feeEstimate: 7,
        totalPrice: 123,
        section: "224",
        row: "12",
        quantity: 2,
        dealScore: 96,
        badges: ["Lowest Total Price", "Lowest Fees"],
        notes: "Back section, but unbeatable all-in price.",
        purchaseUrl: "#"
      },
      {
        id: "billy-3",
        provider: "StubHub",
        basePrice: 102,
        feeEstimate: 38,
        totalPrice: 140,
        section: "210",
        row: "7",
        quantity: 2,
        dealScore: 89,
        badges: ["Trusted Seller"],
        notes: "Lowest sticker price; not the best total.",
        purchaseUrl: "#"
      }
    ]
  },
  {
    id: "dodgers-bowl",
    slug: "lana-del-rey-hollywood-bowl",
    title: "Lana Del Rey at Hollywood Bowl",
    category: "Concert",
    artistOrTeam: "Lana Del Rey",
    date: "2026-08-06",
    time: "8:15 PM",
    venueId: "hollywood-bowl",
    city: "Los Angeles",
    state: "CA",
    image: "Warm canyon sunset over an iconic outdoor stage",
    imageAccent: "from-amber-500 via-rose-400 to-fuchsia-600",
    popularity: 87,
    marketNote: "Outdoor bowl sections are pricing tightly across marketplaces.",
    trending: true,
    historicalPrices: [119, 118, 116, 114, 112],
    searchTags: ["lana del rey", "hollywood bowl", "los angeles"],
    listings: [
      {
        id: "lana-1",
        provider: "Gametime",
        basePrice: 96,
        feeEstimate: 16,
        totalPrice: 112,
        section: "K2",
        row: "14",
        quantity: 2,
        dealScore: 94,
        badges: ["Best Deal", "Fast Checkout"],
        notes: "Best mix of price and decent center-line positioning.",
        purchaseUrl: "#"
      },
      {
        id: "lana-2",
        provider: "Ticketmaster",
        basePrice: 101,
        feeEstimate: 20,
        totalPrice: 121,
        section: "M1",
        row: "9",
        quantity: 2,
        dealScore: 91,
        badges: ["Trusted Seller"],
        notes: "Official listing with strong delivery confidence.",
        purchaseUrl: "#"
      },
      {
        id: "lana-3",
        provider: "Vivid Seats",
        basePrice: 90,
        feeEstimate: 28,
        totalPrice: 118,
        section: "L2",
        row: "17",
        quantity: 4,
        dealScore: 90,
        badges: ["Popular"],
        notes: "Lowest sticker price, mid-pack all-in price.",
        purchaseUrl: "#"
      }
    ]
  },
  {
    id: "cubs-yankees",
    slug: "cubs-vs-yankees-wrigley",
    title: "Chicago Cubs vs. New York Yankees",
    category: "Sports",
    artistOrTeam: "Chicago Cubs",
    date: "2026-06-21",
    time: "1:20 PM",
    venueId: "wrigley",
    city: "Chicago",
    state: "IL",
    image: "Historic ballpark ivy and summer day game buzz",
    imageAccent: "from-blue-600 via-sky-500 to-green-400",
    popularity: 84,
    marketNote: "Weekend rivalry demand is lifting mid-tier infield sections first.",
    featured: true,
    historicalPrices: [74, 76, 77, 78, 78],
    searchTags: ["cubs", "yankees", "wrigley", "chicago", "mlb"],
    listings: [
      {
        id: "cubs-1",
        provider: "TickPick",
        basePrice: 72,
        feeEstimate: 6,
        totalPrice: 78,
        section: "225",
        row: "5",
        quantity: 2,
        dealScore: 95,
        badges: ["Best Deal", "Lowest Fees"],
        notes: "Efficient all-in price with solid infield angle.",
        purchaseUrl: "#"
      },
      {
        id: "cubs-2",
        provider: "SeatGeek",
        basePrice: 68,
        feeEstimate: 17,
        totalPrice: 85,
        section: "227",
        row: "8",
        quantity: 2,
        dealScore: 90,
        badges: ["Popular"],
        notes: "Lower sticker price, higher final total than TickPick.",
        purchaseUrl: "#"
      },
      {
        id: "cubs-3",
        provider: "StubHub",
        basePrice: 70,
        feeEstimate: 18,
        totalPrice: 88,
        section: "220",
        row: "10",
        quantity: 4,
        dealScore: 89,
        badges: ["Trusted Seller"],
        notes: "Large block inventory if you need a group buy.",
        purchaseUrl: "#"
      }
    ]
  },
  {
    id: "nate-bargatze",
    slug: "nate-bargatze-moody-center",
    title: "Nate Bargatze: Big Dumb Eyes World Tour",
    category: "Comedy",
    artistOrTeam: "Nate Bargatze",
    date: "2026-11-14",
    time: "7:00 PM",
    venueId: "moody",
    city: "Austin",
    state: "TX",
    image: "Arena stage with warm spotlight and sold-out laughter",
    imageAccent: "from-yellow-500 via-orange-500 to-red-500",
    popularity: 79,
    marketNote: "Comedy buyers are optimizing for fast checkout and closer floor access.",
    historicalPrices: [66, 67, 68, 70, 70],
    searchTags: ["nate bargatze", "austin", "comedy", "moody center"],
    listings: [
      {
        id: "nate-1",
        provider: "Gametime",
        basePrice: 58,
        feeEstimate: 12,
        totalPrice: 70,
        section: "104",
        row: "18",
        quantity: 2,
        dealScore: 94,
        badges: ["Best Deal", "Fast Checkout"],
        notes: "Strong floor-adjacent value without premium pricing.",
        purchaseUrl: "#"
      },
      {
        id: "nate-2",
        provider: "Ticketmaster",
        basePrice: 61,
        feeEstimate: 14,
        totalPrice: 75,
        section: "106",
        row: "20",
        quantity: 2,
        dealScore: 92,
        badges: ["Trusted Seller"],
        notes: "Official inventory with straightforward transfer.",
        purchaseUrl: "#"
      }
    ]
  },
  {
    id: "hamilton-seattle",
    slug: "hamilton-seattle",
    title: "Hamilton",
    category: "Theater",
    artistOrTeam: "Hamilton",
    date: "2026-10-03",
    time: "7:30 PM",
    venueId: "mccaw",
    city: "Seattle",
    state: "WA",
    image: "Broadway stage silhouette with gold marquee glow",
    imageAccent: "from-stone-700 via-amber-600 to-yellow-300",
    popularity: 83,
    marketNote: "Fees change the winner quickly in theater inventory, especially mezzanine seats.",
    historicalPrices: [154, 157, 159, 160, 161],
    searchTags: ["hamilton", "seattle", "broadway", "theater", "mccaw hall"],
    listings: [
      {
        id: "ham-1",
        provider: "SeatGeek",
        basePrice: 145,
        feeEstimate: 22,
        totalPrice: 167,
        section: "ORCH",
        row: "P",
        quantity: 2,
        dealScore: 95,
        badges: ["Best Deal", "Popular"],
        notes: "Excellent orchestra value relative to the market.",
        purchaseUrl: "#"
      },
      {
        id: "ham-2",
        provider: "TickPick",
        basePrice: 151,
        feeEstimate: 10,
        totalPrice: 161,
        section: "MEZZ",
        row: "G",
        quantity: 2,
        dealScore: 96,
        badges: ["Lowest Total Price", "Lowest Fees"],
        notes: "Best all-in price if you prefer fee transparency.",
        purchaseUrl: "#"
      },
      {
        id: "ham-3",
        provider: "StubHub",
        basePrice: 139,
        feeEstimate: 35,
        totalPrice: 174,
        section: "ORCH",
        row: "R",
        quantity: 2,
        dealScore: 90,
        badges: ["Trusted Seller"],
        notes: "Lowest sticker price but weaker total outcome.",
        purchaseUrl: "#"
      }
    ]
  }
];

function prefixFallbackIdentity(event: Event): Event {
  const eventId = `fallback-${event.id}`;

  return {
    ...event,
    id: eventId,
    listings: event.listings.map((listing, index) => ({
      ...listing,
      id: `fallback-${event.id}-${index + 1}`
    }))
  };
}

export const fallbackEvents: Event[] = rawFallbackEvents.map(prefixFallbackIdentity);

export const trendingSearches = [
  "Taylor Swift Kansas City",
  "Chiefs tickets",
  "Madison Square Garden concerts",
  "Hamilton Seattle",
  "Hollywood Bowl shows"
];

export const popularCities = [
  { city: "New York", state: "NY", searches: "14.2k weekly searches" },
  { city: "Los Angeles", state: "CA", searches: "11.8k weekly searches" },
  { city: "Chicago", state: "IL", searches: "9.7k weekly searches" },
  { city: "Kansas City", state: "MO", searches: "7.9k weekly searches" },
  { city: "Austin", state: "TX", searches: "6.3k weekly searches" },
  { city: "Seattle", state: "WA", searches: "5.6k weekly searches" }
];

export const testimonials = [
  {
    name: "Maya R.",
    role: "Concert buyer",
    quote: "This is the first ticket product that made fees obvious before I clicked through."
  },
  {
    name: "Devon T.",
    role: "NFL season-ticket shopper",
    quote: "I got the cheapest all-in listing in one search instead of bouncing between four tabs."
  },
  {
    name: "Elena P.",
    role: "Frequent theater buyer",
    quote: "The trust badges and best-value logic feel like Kayak for live events."
  }
];

export function getVenue(venueId: string) {
  return venues.find((venue) => venue.id === venueId);
}

export function getProvider(name: Provider["name"]) {
  return providers.find((provider) => provider.name === name);
}

export function searchFallbackEvents(query: string) {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return fallbackEvents;
  }

  return fallbackEvents.filter((event) =>
    [event.title, event.artistOrTeam, event.city, event.state, event.category, ...event.searchTags]
      .join(" ")
      .toLowerCase()
      .includes(normalized)
  );
}

export function getFallbackEventById(id: string) {
  return fallbackEvents.find((event) => event.id === id);
}

export function getAutocompleteSuggestions(query: string) {
  const pool = Array.from(
    new Set(
      fallbackEvents.flatMap((event) => [
        event.artistOrTeam,
        event.title,
        event.city,
        getVenue(event.venueId)?.name ?? "",
        ...event.searchTags
      ])
    )
  ).filter(Boolean);

  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return pool.slice(0, 8);
  }

  return pool.filter((item) => item.toLowerCase().includes(normalized)).slice(0, 8);
}
