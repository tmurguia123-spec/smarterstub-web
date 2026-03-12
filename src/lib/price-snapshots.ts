import "server-only";

import { getUnifiedEventById } from "@/lib/ticket-service";
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

export function getBestKnownPriceSnapshotPayload(event: Awaited<ReturnType<typeof getUnifiedEventById>>) {
  if (!event || event.listings.length === 0) {
    return null;
  }

  const lowestTotalListing = [...event.listings].sort((a, b) => a.totalPrice - b.totalPrice)[0];

  return {
    eventId: event.id,
    eventTitle: event.title,
    provider: lowestTotalListing.provider,
    bestKnownPrice: lowestTotalListing.totalPrice,
    capturedAt: new Date().toISOString()
  } satisfies PriceSnapshotRecord;
}

export async function capturePriceSnapshotForEvent(eventId: string) {
  const event = await getUnifiedEventById(eventId);
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
