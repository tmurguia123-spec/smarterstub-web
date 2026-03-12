import "server-only";

import type { PriceSnapshotRecord } from "@/lib/price-snapshot-store";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_EVENT_PRICE_SNAPSHOTS_TABLE =
  process.env.SUPABASE_EVENT_PRICE_SNAPSHOTS_TABLE ?? "event_price_snapshots";

function getSnapshotsUrl() {
  if (!SUPABASE_URL) {
    return null;
  }

  return new URL(`/rest/v1/${SUPABASE_EVENT_PRICE_SNAPSHOTS_TABLE}`, SUPABASE_URL);
}

export function isSupabasePriceSnapshotStoreConfigured() {
  return Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);
}

export async function persistPriceSnapshotToSupabase(record: PriceSnapshotRecord) {
  const snapshotsUrl = getSnapshotsUrl();

  if (!snapshotsUrl || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Supabase price snapshot storage is not configured");
  }

  const response = await fetch(snapshotsUrl.toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      Prefer: "return=minimal"
    },
    body: JSON.stringify({
      event_id: record.eventId,
      event_title: record.eventTitle,
      provider: record.provider,
      best_known_price: record.bestKnownPrice,
      captured_at: record.capturedAt
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Supabase snapshot insert failed with status ${response.status}: ${errorText}`);
  }
}

export async function readPriceSnapshotsFromSupabase(eventId: string, limit = 20) {
  const snapshotsUrl = getSnapshotsUrl();

  if (!snapshotsUrl || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Supabase price snapshot storage is not configured");
  }

  snapshotsUrl.searchParams.set("select", "event_id,event_title,provider,best_known_price,captured_at");
  snapshotsUrl.searchParams.set("event_id", `eq.${eventId}`);
  snapshotsUrl.searchParams.set("order", "captured_at.desc");
  snapshotsUrl.searchParams.set("limit", String(limit));

  const response = await fetch(snapshotsUrl.toString(), {
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Supabase snapshot read failed with status ${response.status}: ${errorText}`);
  }

  const rows = (await response.json()) as Array<{
    event_id: string;
    event_title: string;
    provider: string;
    best_known_price: number;
    captured_at: string;
  }>;

  return rows.map((row) => ({
    eventId: row.event_id,
    eventTitle: row.event_title,
    provider: row.provider,
    bestKnownPrice: row.best_known_price,
    capturedAt: row.captured_at
  }));
}
