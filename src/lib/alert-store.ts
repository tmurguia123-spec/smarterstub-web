import "server-only";

import { mkdir, appendFile, readFile } from "node:fs/promises";
import path from "node:path";

export interface AlertSignupRecord {
  email: string;
  source: string;
  eventId?: string;
  eventTitle?: string;
  submittedAt: string;
}

export interface TrackedEventRecord {
  eventId: string;
  eventTitle?: string;
}

const DEFAULT_ALERTS_STORAGE_PATH = path.join(process.cwd(), "data", "alert-signups.ndjson");

function getAlertsStoragePath() {
  return process.env.ALERTS_STORAGE_PATH ?? DEFAULT_ALERTS_STORAGE_PATH;
}

export async function persistAlertSignup(record: AlertSignupRecord) {
  const storagePath = getAlertsStoragePath();
  const storageDir = path.dirname(storagePath);

  await mkdir(storageDir, { recursive: true });
  await appendFile(storagePath, `${JSON.stringify(record)}\n`, "utf8");

  return storagePath;
}

export async function readTrackedEvents() {
  const storagePath = getAlertsStoragePath();
  const fileContents = await readFile(storagePath, "utf8").catch(() => "");

  if (!fileContents) {
    return [];
  }

  const trackedEvents = new Map<string, TrackedEventRecord>();

  for (const line of fileContents.split("\n").filter(Boolean)) {
    const record = JSON.parse(line) as AlertSignupRecord;

    if (!record.eventId) {
      continue;
    }

    trackedEvents.set(record.eventId, {
      eventId: record.eventId,
      eventTitle: record.eventTitle
    });
  }

  return Array.from(trackedEvents.values());
}
