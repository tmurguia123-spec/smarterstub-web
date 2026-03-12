import "server-only";

import { mkdir, appendFile } from "node:fs/promises";
import path from "node:path";

export interface AlertSignupRecord {
  email: string;
  source: string;
  eventId?: string;
  eventTitle?: string;
  submittedAt: string;
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
