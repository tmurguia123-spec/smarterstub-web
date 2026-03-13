import { NextRequest, NextResponse } from "next/server";
import { dispatchPriceDropAlerts } from "@/lib/price-drop-alert-dispatch";

const ALERT_DISPATCH_SECRET = process.env.ALERT_DISPATCH_SECRET;

function isAuthorized(request: NextRequest) {
  if (!ALERT_DISPATCH_SECRET) {
    return true;
  }

  return request.headers.get("x-alert-dispatch-secret") === ALERT_DISPATCH_SECRET;
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const eventId = typeof body?.eventId === "string" ? body.eventId : undefined;

  const result = await dispatchPriceDropAlerts(eventId).catch((error: unknown) =>
    NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to dispatch alerts" },
      { status: 500 }
    )
  );

  if (result instanceof NextResponse) {
    return result;
  }

  return NextResponse.json({
    ok: true,
    result
  });
}
