import "server-only";

import { mkdir, appendFile, readFile } from "node:fs/promises";
import path from "node:path";

export interface SentPriceDropAlertRecord {
  email: string;
  eventId: string;
  eventTitle: string;
  previousPrice: number;
  currentPrice: number;
  provider: string;
  sentAt: string;
}

const DEFAULT_SENT_PRICE_DROP_ALERTS_STORAGE_PATH = path.join(process.cwd(), "data", "sent-price-drop-alerts.ndjson");

function getSentPriceDropAlertsStoragePath() {
  return process.env.SENT_PRICE_DROP_ALERTS_STORAGE_PATH ?? DEFAULT_SENT_PRICE_DROP_ALERTS_STORAGE_PATH;
}

export async function persistSentPriceDropAlert(record: SentPriceDropAlertRecord) {
  const storagePath = getSentPriceDropAlertsStoragePath();
  const storageDir = path.dirname(storagePath);

  await mkdir(storageDir, { recursive: true });
  await appendFile(storagePath, `${JSON.stringify(record)}\n`, "utf8");

  return storagePath;
}

export async function readSentPriceDropAlerts(eventId?: string, email?: string, limit = 100) {
  const storagePath = getSentPriceDropAlertsStoragePath();
  const fileContents = await readFile(storagePath, "utf8").catch(() => "");

  if (!fileContents) {
    return [];
  }

  return fileContents
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line) as SentPriceDropAlertRecord)
    .filter((record) => (eventId ? record.eventId === eventId : true))
    .filter((record) => (email ? record.email === email : true))
    .sort((a, b) => Date.parse(b.sentAt) - Date.parse(a.sentAt))
    .slice(0, limit);
}
