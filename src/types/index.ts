export type EventCategory =
  | "Concert"
  | "Sports"
  | "Comedy"
  | "Theater"
  | "Festival";

export type ProviderName =
  | "Ticketmaster"
  | "SeatGeek"
  | "Gametime"
  | "StubHub"
  | "Vivid Seats"
  | "TickPick";

export type DealBadge =
  | "Best Deal"
  | "Lowest Total Price"
  | "Lowest Fees"
  | "Popular"
  | "Trusted Seller"
  | "Fast Checkout";

export type DealRating = "Amazing" | "Great" | "Fair" | "Overpriced";

export type BuyRecommendation =
  | "Buy Now"
  | "Wait"
  | "Price likely rising"
  | "Price likely stable"
  | "Good deal relative to similar seats";

export interface Provider {
  id: string;
  name: ProviderName;
  summary: string;
  trustScore: number;
  averageFeesPct: number;
  accent: string;
  verifiedMarketplace: boolean;
  refundFlexibility: number;
  deliveryReliability: number;
}

export interface Venue {
  id: string;
  name: string;
  city: string;
  state: string;
  capacity: number;
}

export interface Listing {
  id: string;
  provider: ProviderName;
  basePrice: number;
  feeEstimate: number;
  totalPrice: number;
  section: string;
  row: string;
  quantity: number;
  inventoryPrecision?: "exact" | "event-level";
  dealScore: number;
  badges: DealBadge[];
  notes: string;
  purchaseUrl: string;
}

export interface Event {
  id: string;
  slug: string;
  title: string;
  category: EventCategory;
  artistOrTeam: string;
  date: string;
  time: string;
  venueId: string;
  venueName?: string;
  city: string;
  state: string;
  image: string;
  imageAccent: string;
  popularity: number;
  marketNote?: string;
  featured?: boolean;
  trending?: boolean;
  historicalPrices: number[];
  searchTags: string[];
  listings: Listing[];
}

export interface ScoreFactors {
  totalPriceAfterFees: number;
  feePercentage: number;
  sectionQuality: number;
  rowQuality: number;
  quantityAvailable: number;
  providerTrust: number;
  refundFlexibility: number;
  deliveryReliability: number;
  popularityScarcity: number;
  comparableSeatValue: number;
}

export interface ListingInsight {
  listingId: string;
  confidenceScore: number;
  dealRating: DealRating;
  recommendation: BuyRecommendation;
  summary: string;
  scoreFactors: ScoreFactors;
  savingsVsHighest: number;
  savingsVsAverage: number;
  feePercent: number;
  seatQualityScore: number;
}

export interface EventRanking {
  bestOverallBuy: string;
  bestBudgetBuy: string;
  bestPremiumValue: string;
  lowestTotalPrice: string;
  lowestFees: string;
  mostTrustedSeller: string;
}

export interface EventTrend {
  recommendation: BuyRecommendation;
  momentum: "rising" | "stable" | "softening";
  changePct: number;
  marketAverage: number;
  summary: string;
}

export interface PriceComparison {
  eventId: string;
  lowestBasePrice: number;
  lowestTotalPrice: number;
  highestTotalPrice: number;
  bestValueProvider: ProviderName;
  comparedProviders: number;
  savingsVsHighest: number;
}

export interface SavedSearch {
  id: string;
  query: string;
  city?: string;
  categories?: EventCategory[];
}

export interface PriceAlert {
  id: string;
  eventId: string;
  targetPrice: number;
  email: string;
}
