import { NextRequest, NextResponse } from "next/server";

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

  if (ALERTS_WEBHOOK_URL) {
    const response = await fetch(ALERTS_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to save alert signup" }, { status: 502 });
    }

    return NextResponse.json({ ok: true, persisted: true });
  }

  console.info("[SmarterStub][alerts] signup received", payload);

  return NextResponse.json({ ok: true, persisted: false });
}
