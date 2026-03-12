import { NextRequest, NextResponse } from "next/server";
import { persistAlertSignup } from "@/lib/alert-store";
import {
  isSupabaseAlertStoreConfigured,
  persistAlertSignupToSupabase
} from "@/lib/supabase-alert-store";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALERTS_WEBHOOK_URL = process.env.ALERTS_WEBHOOK_URL;

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const source = typeof body?.source === "string" ? body.source : "unknown";
  const eventId = typeof body?.eventId === "string" ? body.eventId : undefined;
  const eventTitle = typeof body?.eventTitle === "string" ? body.eventTitle : undefined;

  if (!EMAIL_PATTERN.test(email)) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }

  const payload = {
    email,
    source,
    eventId,
    eventTitle,
    submittedAt: new Date().toISOString()
  };

  const persistenceResult = isSupabaseAlertStoreConfigured()
    ? await persistAlertSignupToSupabase(payload)
        .then(() => ({ ok: true as const, store: "supabase" as const }))
        .catch((error: unknown) => ({
          ok: false as const,
          store: "supabase" as const,
          error: error instanceof Error ? error.message : "Unknown storage error"
        }))
    : await persistAlertSignup(payload)
        .then((storagePath) => ({ ok: true as const, store: "file" as const, storagePath }))
        .catch((error: unknown) => ({
          ok: false as const,
          store: "file" as const,
          error: error instanceof Error ? error.message : "Unknown storage error"
        }));

  let webhookResult:
    | { attempted: false }
    | { attempted: true; ok: true }
    | { attempted: true; ok: false; error: string } = { attempted: false };

  if (ALERTS_WEBHOOK_URL) {
    const response = await fetch(ALERTS_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    }).catch((error: unknown) => ({
      ok: false,
      status: 0,
      error: error instanceof Error ? error.message : "Unknown webhook error"
    }));

    if ("error" in response) {
      webhookResult = { attempted: true, ok: false, error: response.error };
    } else if (!response.ok) {
      webhookResult = {
        attempted: true,
        ok: false,
        error: `Webhook request failed with status ${response.status}`
      };
    } else {
      webhookResult = { attempted: true, ok: true };
    }
  }

  if (!persistenceResult.ok && (!webhookResult.attempted || !webhookResult.ok)) {
    return NextResponse.json(
      {
        error: "Failed to save alert signup",
        storageError: persistenceResult.error,
        webhookError: webhookResult.attempted && !webhookResult.ok ? webhookResult.error : undefined
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    persisted: true,
    storage: persistenceResult.store,
    storagePath:
      persistenceResult.ok && persistenceResult.store === "file" ? persistenceResult.storagePath : undefined,
    webhookForwarded: webhookResult.attempted ? webhookResult.ok : false
  });
}
