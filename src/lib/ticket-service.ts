import "server-only";

import { Event } from "@/types";
import {
  fallbackEvents,
  getFallbackEventById,
  searchFallbackEvents
} from "@/lib/fallback-data";
import { seatGeekConnector } from "@/lib/providers/seatgeek";
import { stubHubConnector } from "@/lib/providers/stubhub";
import { ticketmasterConnector } from "@/lib/providers/ticketmaster";

const connectors = [ticketmasterConnector, seatGeekConnector, stubHubConnector];

export interface SearchResponse {
  events: Event[];
  providerStatus: Array<{ provider: string; status: "ok" | "fallback" | "error"; detail?: string }>;
  usedFallback: boolean;
}

function dedupeEvents(events: Event[]) {
  const seen = new Map<string, Event>();

  for (const event of events) {
    const key = `${event.title.toLowerCase()}|${event.date}|${event.city.toLowerCase()}`;
    const existing = seen.get(key);
    const isFallback = event.id.startsWith("fallback-");

    if (!existing) {
      seen.set(key, event);
      continue;
    }

    const existingIsFallback = existing.id.startsWith("fallback-");

    if (existingIsFallback && !isFallback) {
      seen.set(key, event);
    }
  }

  return Array.from(seen.values());
}

export async function searchUnifiedEvents(query: string): Promise<SearchResponse> {
  const settled = await Promise.allSettled(connectors.map((connector) => connector.searchEvents({ query })));
  const providerStatus = settled.map((result, index) => {
    if (result.status === "fulfilled") {
      return {
        provider: connectors[index].providerId,
        status: result.value.length ? ("ok" as const) : ("fallback" as const)
      };
    }

    return {
      provider: connectors[index].providerId,
      status: "error" as const,
      detail: result.reason instanceof Error ? result.reason.message : "Unknown provider error"
    };
  });

  const liveEvents = settled.flatMap((result) => (result.status === "fulfilled" ? result.value : []));
  const fallbackMatches = searchFallbackEvents(query);

  if (liveEvents.length === 0) {
    return {
      events: fallbackMatches,
      providerStatus,
      usedFallback: true
    };
  }

  return {
    events: dedupeEvents([...liveEvents, ...fallbackMatches]),
    providerStatus,
    usedFallback: false
  };
}

export async function getUnifiedEventById(id: string) {
  if (id.startsWith("fallback-")) {
    return getFallbackEventById(id);
  }

  const connector = connectors.find((item) => id.startsWith(`${item.providerId}-`));

  if (!connector) {
    return getFallbackEventById(id);
  }

  try {
    const event = await connector.getEventById(id);
    return event ?? getFallbackEventById(id);
  } catch {
    return getFallbackEventById(id);
  }
}

export async function getFeaturedEvents() {
  return fallbackEvents.filter((event) => event.featured).slice(0, 4);
}

export async function getTrendingEvents() {
  return fallbackEvents.filter((event) => event.trending).slice(0, 3);
}
