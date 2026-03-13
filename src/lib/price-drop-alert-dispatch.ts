import "server-only";

import { formatCurrency } from "@/lib/utils";
import { readAlertSubscribers } from "@/lib/alert-store";
import {
  isSupabaseAlertStoreConfigured,
  readAlertSubscribersFromSupabase
} from "@/lib/supabase-alert-store";
import { readPriceDropCandidates } from "@/lib/price-drop-candidate-store";
import {
  isSupabasePriceDropCandidateStoreConfigured,
  readPriceDropCandidatesFromSupabase
} from "@/lib/supabase-price-drop-candidate-store";
import {
  persistSentPriceDropAlert,
  readSentPriceDropAlerts,
  type SentPriceDropAlertRecord
} from "@/lib/price-drop-delivery-store";
import {
  isSupabasePriceDropDeliveryStoreConfigured,
  persistSentPriceDropAlertToSupabase,
  readSentPriceDropAlertsFromSupabase
} from "@/lib/supabase-price-drop-delivery-store";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL;
const APP_BASE_URL = process.env.APP_BASE_URL ?? "http://localhost:3000";

function isResendConfigured() {
  return Boolean(RESEND_API_KEY && RESEND_FROM_EMAIL);
}

async function getSubscribersForEvent(eventId: string) {
  if (isSupabaseAlertStoreConfigured()) {
    return readAlertSubscribersFromSupabase(eventId);
  }

  return readAlertSubscribers(eventId);
}

async function getCandidates(eventId?: string) {
  if (isSupabasePriceDropCandidateStoreConfigured()) {
    return readPriceDropCandidatesFromSupabase(eventId, 100);
  }

  return readPriceDropCandidates(eventId, 100);
}

async function getSentDeliveries(eventId?: string, email?: string) {
  if (isSupabasePriceDropDeliveryStoreConfigured()) {
    return readSentPriceDropAlertsFromSupabase(eventId, email, 100);
  }

  return readSentPriceDropAlerts(eventId, email, 100);
}

async function persistDelivery(record: SentPriceDropAlertRecord) {
  if (isSupabasePriceDropDeliveryStoreConfigured()) {
    await persistSentPriceDropAlertToSupabase(record);
    return { store: "supabase" as const };
  }

  const storagePath = await persistSentPriceDropAlert(record);
  return { store: "file" as const, storagePath };
}

function buildEventUrl(eventId: string) {
  return new URL(`/event/${eventId}`, APP_BASE_URL).toString();
}

function buildEmailContent(candidate: {
  eventTitle: string;
  previousPrice: number;
  currentPrice: number;
  provider: string;
  eventId: string;
}) {
  const eventUrl = buildEventUrl(candidate.eventId);
  const subject = "A better ticket deal just appeared";
  const text = [
    candidate.eventTitle,
    "",
    `Previous price: ${formatCurrency(candidate.previousPrice)}`,
    `New lower price: ${formatCurrency(candidate.currentPrice)}`,
    `Provider: ${candidate.provider}`,
    "",
    `View this event on SmarterStub: ${eventUrl}`
  ].join("\n");
  const html = `
    <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.6;">
      <h1 style="font-size: 20px; margin-bottom: 12px;">A better ticket deal just appeared</h1>
      <p style="margin: 0 0 12px;"><strong>${candidate.eventTitle}</strong></p>
      <p style="margin: 0 0 8px;">Previous price: <strong>${formatCurrency(candidate.previousPrice)}</strong></p>
      <p style="margin: 0 0 8px;">New lower price: <strong>${formatCurrency(candidate.currentPrice)}</strong></p>
      <p style="margin: 0 0 16px;">Provider: <strong>${candidate.provider}</strong></p>
      <p style="margin: 0;">
        <a href="${eventUrl}" style="color: #0f766e; font-weight: 600;">View this event on SmarterStub</a>
      </p>
    </div>
  `;

  return { subject, text, html };
}

async function sendPriceDropEmail(to: string, candidate: {
  eventTitle: string;
  previousPrice: number;
  currentPrice: number;
  provider: string;
  eventId: string;
}) {
  if (!isResendConfigured()) {
    throw new Error("Resend is not configured");
  }

  const { subject, text, html } = buildEmailContent(candidate);
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: RESEND_FROM_EMAIL,
      to: [to],
      subject,
      text,
      html
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Resend send failed with status ${response.status}: ${errorText}`);
  }
}

export async function dispatchPriceDropAlerts(eventId?: string) {
  if (!isResendConfigured()) {
    throw new Error("Resend is not configured");
  }

  const candidates = await getCandidates(eventId);
  const results = [];

  for (const candidate of candidates) {
    const subscribers = await getSubscribersForEvent(candidate.eventId);
    const sentDeliveries = await getSentDeliveries(candidate.eventId);
    const sentKeys = new Set(sentDeliveries.map((delivery) => `${delivery.email}|${delivery.currentPrice}`));

    for (const subscriber of subscribers) {
      const deliveryKey = `${subscriber.email}|${candidate.currentPrice}`;

      if (sentKeys.has(deliveryKey)) {
        results.push({
          status: "duplicate-send-skipped" as const,
          email: subscriber.email,
          eventId: candidate.eventId,
          currentPrice: candidate.currentPrice
        });
        continue;
      }

      await sendPriceDropEmail(subscriber.email, candidate);

      const deliveryRecord = {
        email: subscriber.email,
        eventId: candidate.eventId,
        eventTitle: candidate.eventTitle,
        previousPrice: candidate.previousPrice,
        currentPrice: candidate.currentPrice,
        provider: candidate.provider,
        sentAt: new Date().toISOString()
      } satisfies SentPriceDropAlertRecord;

      const persistenceResult = await persistDelivery(deliveryRecord);

      results.push({
        status: "sent" as const,
        email: subscriber.email,
        eventId: candidate.eventId,
        currentPrice: candidate.currentPrice,
        ...persistenceResult
      });
      sentKeys.add(deliveryKey);
    }
  }

  return results;
}
