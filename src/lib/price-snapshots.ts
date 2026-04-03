import "server-only";

import { getLiveEventByKey } from "@/lib/ticket-service";
import {
  persistPriceSnapshot,
  readPriceSnapshots,
  type PriceSnapshotRecord
} from "@/lib/price-snapshot-store";
import {
  isSupabasePriceSnapshotStoreConfigured,
  persistPriceSnapshotToSupabase,
  readPriceSnapshotsFromSupabase
} from "@/lib/supabase-price-snapshot-store";

export function getBestKnownPriceSnapshotPayload(event: Awaited<ReturnType<typeof getLiveEventByKey>>) {
  if (!event) {
    return null;
  }

  const bestKnownPrice =
    typeof event.priceMin === "number"
      ? event.priceMin
      : typeof event.priceMax === "number"
        ? event.priceMax
        : null;

  if (bestKnownPrice === null) {
    return null;
  }

  return {
    eventId: `${event.source}-${event.eventId}`,
    eventTitle: event.title,
    provider: event.source,
    bestKnownPrice,
    capturedAt: new Date().toISOString()
  } satisfies PriceSnapshotRecord;
}

export async function capturePriceSnapshotForEvent(eventId: string) {
  const event = await getLiveEventByKey(eventId);
  const payload = getBestKnownPriceSnapshotPayload(event);

  if (!payload) {
    return null;
  }

  const persistenceResult = isSupabasePriceSnapshotStoreConfigured()
    ? await persistPriceSnapshotToSupabase(payload).then(() => ({ store: "supabase" as const }))
    : await persistPriceSnapshot(payload).then((storagePath) => ({
        store: "file" as const,
        storagePath
      }));

  return {
    snapshot: payload,
    ...persistenceResult
  };
}

export async function getSnapshotsForEvent(eventId: string, limit = 20) {
  if (isSupabasePriceSnapshotStoreConfigured()) {
    return readPriceSnapshotsFromSupabase(eventId, limit);
  }

  return readPriceSnapshots(eventId, limit);
}
