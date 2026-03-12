import "server-only";

import { mkdir, appendFile, readFile } from "node:fs/promises";
import path from "node:path";

export interface PriceDropCandidateRecord {
  eventId: string;
  eventTitle: string;
  previousPrice: number;
  currentPrice: number;
  detectedAt: string;
  provider: string;
}

const DEFAULT_PRICE_DROP_CANDIDATES_STORAGE_PATH = path.join(process.cwd(), "data", "price-drop-candidates.ndjson");

function getPriceDropCandidatesStoragePath() {
  return process.env.PRICE_DROP_CANDIDATES_STORAGE_PATH ?? DEFAULT_PRICE_DROP_CANDIDATES_STORAGE_PATH;
}

export async function persistPriceDropCandidate(record: PriceDropCandidateRecord) {
  const storagePath = getPriceDropCandidatesStoragePath();
  const storageDir = path.dirname(storagePath);

  await mkdir(storageDir, { recursive: true });
  await appendFile(storagePath, `${JSON.stringify(record)}\n`, "utf8");

  return storagePath;
}

export async function readPriceDropCandidates(eventId?: string, limit = 20) {
  const storagePath = getPriceDropCandidatesStoragePath();
  const fileContents = await readFile(storagePath, "utf8").catch(() => "");

  if (!fileContents) {
    return [];
  }

  return fileContents
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line) as PriceDropCandidateRecord)
    .filter((record) => (eventId ? record.eventId === eventId : true))
    .sort((a, b) => Date.parse(b.detectedAt) - Date.parse(a.detectedAt))
    .slice(0, limit);
}
