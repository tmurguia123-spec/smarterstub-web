import "server-only";

import type { PriceDropCandidateRecord } from "@/lib/price-drop-candidate-store";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_PRICE_DROP_CANDIDATES_TABLE =
  process.env.SUPABASE_PRICE_DROP_CANDIDATES_TABLE ?? "price_drop_candidates";

function getCandidatesUrl() {
  if (!SUPABASE_URL) {
    return null;
  }

  return new URL(`/rest/v1/${SUPABASE_PRICE_DROP_CANDIDATES_TABLE}`, SUPABASE_URL);
}

export function isSupabasePriceDropCandidateStoreConfigured() {
  return Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);
}

export async function persistPriceDropCandidateToSupabase(record: PriceDropCandidateRecord) {
  const candidatesUrl = getCandidatesUrl();

  if (!candidatesUrl || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Supabase price drop candidate storage is not configured");
  }

  const response = await fetch(candidatesUrl.toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      Prefer: "return=minimal,resolution=ignore-duplicates"
    },
    body: JSON.stringify({
      event_id: record.eventId,
      event_title: record.eventTitle,
      previous_price: record.previousPrice,
      current_price: record.currentPrice,
      detected_at: record.detectedAt,
      provider: record.provider
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Supabase candidate insert failed with status ${response.status}: ${errorText}`);
  }
}

export async function readPriceDropCandidatesFromSupabase(eventId?: string, limit = 20) {
  const candidatesUrl = getCandidatesUrl();

  if (!candidatesUrl || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Supabase price drop candidate storage is not configured");
  }

  candidatesUrl.searchParams.set(
    "select",
    "event_id,event_title,previous_price,current_price,detected_at,provider"
  );
  if (eventId) {
    candidatesUrl.searchParams.set("event_id", `eq.${eventId}`);
  }
  candidatesUrl.searchParams.set("order", "detected_at.desc");
  candidatesUrl.searchParams.set("limit", String(limit));

  const response = await fetch(candidatesUrl.toString(), {
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Supabase candidate read failed with status ${response.status}: ${errorText}`);
  }

  const rows = (await response.json()) as Array<{
    event_id: string;
    event_title: string;
    previous_price: number;
    current_price: number;
    detected_at: string;
    provider: string;
  }>;

  return rows.map((row) => ({
    eventId: row.event_id,
    eventTitle: row.event_title,
    previousPrice: row.previous_price,
    currentPrice: row.current_price,
    detectedAt: row.detected_at,
    provider: row.provider
  }));
}
