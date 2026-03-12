import "server-only";

import { readTrackedEvents } from "@/lib/alert-store";
import { readTrackedEventsFromSupabase, isSupabaseAlertStoreConfigured } from "@/lib/supabase-alert-store";
import { capturePriceSnapshotForEvent, getSnapshotsForEvent } from "@/lib/price-snapshots";
import {
  persistPriceDropCandidate,
  readPriceDropCandidates,
  type PriceDropCandidateRecord
} from "@/lib/price-drop-candidate-store";
import {
  isSupabasePriceDropCandidateStoreConfigured,
  persistPriceDropCandidateToSupabase,
  readPriceDropCandidatesFromSupabase
} from "@/lib/supabase-price-drop-candidate-store";

async function getTrackedEvents() {
  if (isSupabaseAlertStoreConfigured()) {
    return readTrackedEventsFromSupabase();
  }

  return readTrackedEvents();
}

async function getExistingCandidates(eventId: string) {
  if (isSupabasePriceDropCandidateStoreConfigured()) {
    return readPriceDropCandidatesFromSupabase(eventId, 50);
  }

  return readPriceDropCandidates(eventId, 50);
}

async function persistCandidate(record: PriceDropCandidateRecord) {
  if (isSupabasePriceDropCandidateStoreConfigured()) {
    await persistPriceDropCandidateToSupabase(record);
    return { store: "supabase" as const };
  }

  const storagePath = await persistPriceDropCandidate(record);
  return { store: "file" as const, storagePath };
}

export async function detectPriceDropForEvent(eventId: string) {
  const captureResult = await capturePriceSnapshotForEvent(eventId);

  if (!captureResult) {
    return null;
  }

  const snapshots = await getSnapshotsForEvent(eventId, 2);
  const [currentSnapshot, previousSnapshot] = snapshots;

  if (!currentSnapshot || !previousSnapshot) {
    return {
      eventId,
      status: "insufficient-history" as const,
      snapshot: captureResult.snapshot
    };
  }

  if (currentSnapshot.bestKnownPrice >= previousSnapshot.bestKnownPrice) {
    return {
      eventId,
      status: "no-drop" as const,
      snapshot: currentSnapshot,
      previousSnapshot
    };
  }

  const existingCandidates = await getExistingCandidates(eventId);
  const duplicateCandidate = existingCandidates.find(
    (candidate) => candidate.currentPrice === currentSnapshot.bestKnownPrice
  );

  if (duplicateCandidate) {
    return {
      eventId,
      status: "duplicate-drop" as const,
      snapshot: currentSnapshot,
      previousSnapshot,
      candidate: duplicateCandidate
    };
  }

  const candidate = {
    eventId: currentSnapshot.eventId,
    eventTitle: currentSnapshot.eventTitle,
    previousPrice: previousSnapshot.bestKnownPrice,
    currentPrice: currentSnapshot.bestKnownPrice,
    detectedAt: new Date().toISOString(),
    provider: currentSnapshot.provider
  } satisfies PriceDropCandidateRecord;

  const persistenceResult = await persistCandidate(candidate);

  return {
    eventId,
    status: "drop-detected" as const,
    snapshot: currentSnapshot,
    previousSnapshot,
    candidate,
    ...persistenceResult
  };
}

export async function detectPriceDropsForTrackedEvents() {
  const trackedEvents = await getTrackedEvents();
  const dedupedEventIds = Array.from(new Set(trackedEvents.map((item) => item.eventId)));
  const results = [];

  for (const eventId of dedupedEventIds) {
    results.push(await detectPriceDropForEvent(eventId));
  }

  return results.filter(Boolean);
}
