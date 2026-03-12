import "server-only";

import { ProviderConnector } from "@/lib/providers/types";
import { normalizeTicketmasterEvent } from "@/lib/providers/normalizers";

const API_KEY = process.env.TICKETMASTER_API_KEY;
const BASE_URL = "https://app.ticketmaster.com/discovery/v2";

async function fetchTicketmaster(path: string, query: Record<string, string>) {
  if (!API_KEY) {
    return null;
  }

  const url = new URL(`${BASE_URL}${path}`);
  url.searchParams.set("apikey", API_KEY);

  for (const [key, value] of Object.entries(query)) {
    url.searchParams.set(key, value);
  }

  const response = await fetch(url.toString(), {
    headers: {
      Accept: "application/json"
    },
    next: {
      revalidate: 300
    }
  });

  if (!response.ok) {
    throw new Error(`Ticketmaster request failed with status ${response.status}`);
  }

  return response.json();
}

export const ticketmasterConnector: ProviderConnector = {
  providerId: "ticketmaster",
  async searchEvents({ query }) {
    const payload = await fetchTicketmaster("/events.json", {
      keyword: query || "concert",
      size: "8",
      sort: "relevance,desc"
    });

    if (!payload?._embedded?.events) {
      return [];
    }

    return payload._embedded.events.map(normalizeTicketmasterEvent);
  },
  async getEventById(id) {
    const rawId = id.replace(/^ticketmaster-/, "");
    const payload = await fetchTicketmaster(`/events/${rawId}.json`, {});
    if (!payload?.id) {
      return null;
    }
    return normalizeTicketmasterEvent(payload);
  }
};
