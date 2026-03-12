import "server-only";

import type { AlertSignupRecord } from "@/lib/alert-store";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_ALERT_SIGNUPS_TABLE = process.env.SUPABASE_ALERT_SIGNUPS_TABLE ?? "alert_signups";

function getSupabaseInsertUrl() {
  if (!SUPABASE_URL) {
    return null;
  }

  return new URL(`/rest/v1/${SUPABASE_ALERT_SIGNUPS_TABLE}`, SUPABASE_URL).toString();
}

export function isSupabaseAlertStoreConfigured() {
  return Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);
}

export async function persistAlertSignupToSupabase(record: AlertSignupRecord) {
  const insertUrl = getSupabaseInsertUrl();

  if (!insertUrl || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Supabase alert storage is not configured");
  }

  const response = await fetch(insertUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      Prefer: "return=minimal"
    },
    body: JSON.stringify({
      email: record.email,
      source: record.source,
      event_id: record.eventId ?? null,
      event_title: record.eventTitle ?? null,
      submitted_at: record.submittedAt
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Supabase insert failed with status ${response.status}: ${errorText}`);
  }
}
