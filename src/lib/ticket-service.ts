import "server-only";

import { LiveEvent } from "@/types";

const DEFAULT_CITY = process.env.DEFAULT_EVENT_CITY ?? "Kansas City";
const DEFAULT_STATE = process.env.DEFAULT_EVENT_STATE ?? "MO";

function getBackendBaseUrl() {
  return process.env.BACKEND_API_URL?.replace(/\/$/, "") ?? "";
}

function buildSlug(title: string, eventId: string) {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return base || `event-${eventId}`;
}

function normalizeEvent(source: "seatgeek" | "ticketmaster", raw: Record<string, unknown>): LiveEvent {
  const title = typeof raw.event_name === "string" ? raw.event_name : "Live event";
  const eventId = typeof raw.event_id === "string" ? raw.event_id : "";

  return {
    source,
    eventId,
    slug: buildSlug(title, eventId),
    title,
    date: typeof raw.event_date === "string" ? raw.event_date : null,
    time: typeof raw.event_time === "string" ? raw.event_time : null,
    status: typeof raw.status === "string" ? raw.status : null,
    performers: typeof raw.performers === "string" ? raw.performers : null,
    genre: typeof raw.genre === "string" ? raw.genre : null,
    venueName: typeof raw.venue_name === "string" ? raw.venue_name : null,
    city: typeof raw.city === "string" ? raw.city : null,
    state: typeof raw.state === "string" ? raw.state : null,
    priceMin: typeof raw.price_min === "number" ? raw.price_min : null,
    priceMax: typeof raw.price_max === "number" ? raw.price_max : null,
    currency: typeof raw.currency === "string" ? raw.currency : null,
    url: typeof raw.url === "string" ? raw.url : null
  };
}

async function fetchBackendJson(path: string) {
  const baseUrl = getBackendBaseUrl();

  if (!baseUrl) {
    return null;
  }

  const response = await fetch(`${baseUrl}${path}`, {
    next: {
      revalidate: 300
    }
  }).catch(() => null);

  if (!response || !response.ok) {
    return null;
  }

  return response.json();
}

export function buildEventRoute(event: LiveEvent) {
  return `/event/${event.source}-${encodeURIComponent(event.eventId)}`;
}

export function parseEventKey(value: string) {
  const decodedValue = decodeURIComponent(value);
  const match = decodedValue.match(/^(seatgeek|ticketmaster)-(.+)$/);

  if (!match) {
    return null;
  }

  return {
    source: match[1] as "seatgeek" | "ticketmaster",
    eventId: match[2]
  };
}

export async function searchLiveEvents(options?: {
  query?: string;
  city?: string;
  state?: string;
}) {
  const params = new URLSearchParams();
  params.set("city", options?.city?.trim() || DEFAULT_CITY);
  params.set("state", options?.state?.trim() || DEFAULT_STATE);

  if (options?.query?.trim()) {
    params.set("keyword", options.query.trim());
  }

  const payload = await fetchBackendJson(`/events/seatgeek?${params.toString()}`);

  if (!payload || !Array.isArray(payload.events)) {
    return [] as LiveEvent[];
  }

  return payload.events.map((event: Record<string, unknown>) => normalizeEvent("seatgeek", event));
}

export async function getLiveEventByKey(value: string) {
  const parsed = parseEventKey(value);

  if (!parsed || parsed.source !== "seatgeek") {
    return null;
  }

  const payload = await fetchBackendJson(`/events/seatgeek/${encodeURIComponent(parsed.eventId)}`);

  if (!payload || typeof payload !== "object" || !payload.event) {
    return null;
  }

  return normalizeEvent("seatgeek", payload.event as Record<string, unknown>);
}
