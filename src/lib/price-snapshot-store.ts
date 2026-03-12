import "server-only";

import { mkdir, appendFile, readFile } from "node:fs/promises";
import path from "node:path";

export interface PriceSnapshotRecord {
  eventId: string;
  eventTitle: string;
  provider: string;
  bestKnownPrice: number;
  capturedAt: string;
}

const DEFAULT_PRICE_SNAPSHOTS_STORAGE_PATH = path.join(process.cwd(), "data", "event-price-snapshots.ndjson");

function getPriceSnapshotsStoragePath() {
  return process.env.PRICE_SNAPSHOTS_STORAGE_PATH ?? DEFAULT_PRICE_SNAPSHOTS_STORAGE_PATH;
}

export async function persistPriceSnapshot(record: PriceSnapshotRecord) {
  const storagePath = getPriceSnapshotsStoragePath();
  const storageDir = path.dirname(storagePath);

  await mkdir(storageDir, { recursive: true });
  await appendFile(storagePath, `${JSON.stringify(record)}\n`, "utf8");

  return storagePath;
}

export async function readPriceSnapshots(eventId: string, limit = 20) {
  const storagePath = getPriceSnapshotsStoragePath();
  const fileContents = await readFile(storagePath, "utf8").catch(() => "");

  if (!fileContents) {
    return [];
  }

  return fileContents
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line) as PriceSnapshotRecord)
    .filter((record) => record.eventId === eventId)
    .sort((a, b) => Date.parse(b.capturedAt) - Date.parse(a.capturedAt))
    .slice(0, limit);
}
