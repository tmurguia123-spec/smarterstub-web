export interface LiveEvent {
  source: "seatgeek" | "ticketmaster";
  eventId: string;
  slug: string;
  title: string;
  date: string | null;
  time: string | null;
  status: string | null;
  performers: string | null;
  genre: string | null;
  venueName: string | null;
  city: string | null;
  state: string | null;
  priceMin: number | null;
  priceMax: number | null;
  currency: string | null;
  url: string | null;
}

export interface EventSearchResponse {
  count: number;
  events: LiveEvent[];
}
