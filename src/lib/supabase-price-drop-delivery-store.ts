import "server-only";

import type { SentPriceDropAlertRecord } from "@/lib/price-drop-delivery-store";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_SENT_PRICE_DROP_ALERTS_TABLE =
  process.env.SUPABASE_SENT_PRICE_DROP_ALERTS_TABLE ?? "sent_price_drop_alerts";

function getSentAlertsUrl() {
  if (!SUPABASE_URL) {
    return null;
  }

  return new URL(`/rest/v1/${SUPABASE_SENT_PRICE_DROP_ALERTS_TABLE}`, SUPABASE_URL);
}

export function isSupabasePriceDropDeliveryStoreConfigured() {
  return Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);
}

export async function persistSentPriceDropAlertToSupabase(record: SentPriceDropAlertRecord) {
  const sentAlertsUrl = getSentAlertsUrl();

  if (!sentAlertsUrl || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Supabase sent alert storage is not configured");
  }

  const response = await fetch(sentAlertsUrl.toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      Prefer: "return=minimal,resolution=ignore-duplicates"
    },
    body: JSON.stringify({
      email: record.email,
      event_id: record.eventId,
      event_title: record.eventTitle,
      previous_price: record.previousPrice,
      current_price: record.currentPrice,
      provider: record.provider,
      sent_at: record.sentAt
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Supabase sent alert insert failed with status ${response.status}: ${errorText}`);
  }
}

export async function readSentPriceDropAlertsFromSupabase(eventId?: string, email?: string, limit = 100) {
  const sentAlertsUrl = getSentAlertsUrl();

  if (!sentAlertsUrl || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Supabase sent alert storage is not configured");
  }

  sentAlertsUrl.searchParams.set(
    "select",
    "email,event_id,event_title,previous_price,current_price,provider,sent_at"
  );
  if (eventId) {
    sentAlertsUrl.searchParams.set("event_id", `eq.${eventId}`);
  }
  if (email) {
    sentAlertsUrl.searchParams.set("email", `eq.${email}`);
  }
  sentAlertsUrl.searchParams.set("order", "sent_at.desc");
  sentAlertsUrl.searchParams.set("limit", String(limit));

  const response = await fetch(sentAlertsUrl.toString(), {
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Supabase sent alert read failed with status ${response.status}: ${errorText}`);
  }

  const rows = (await response.json()) as Array<{
    email: string;
    event_id: string;
    event_title: string;
    previous_price: number;
    current_price: number;
    provider: string;
    sent_at: string;
  }>;

  return rows.map((row) => ({
    email: row.email,
    eventId: row.event_id,
    eventTitle: row.event_title,
    previousPrice: row.previous_price,
    currentPrice: row.current_price,
    provider: row.provider,
    sentAt: row.sent_at
  }));
}
