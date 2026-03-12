import { NextRequest, NextResponse } from "next/server";
import {
  detectPriceDropForEvent,
  detectPriceDropsForTrackedEvents
} from "@/lib/price-drop-detection";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const eventId = typeof body?.eventId === "string" ? body.eventId : "";
  const runAllTracked = body?.allTracked === true;

  if (!eventId && !runAllTracked) {
    return NextResponse.json({ error: "Provide eventId or allTracked=true" }, { status: 400 });
  }

  const result = runAllTracked
    ? await detectPriceDropsForTrackedEvents().catch((error: unknown) =>
        NextResponse.json(
          { error: error instanceof Error ? error.message : "Unable to detect price drops" },
          { status: 500 }
        )
      )
    : await detectPriceDropForEvent(eventId).catch((error: unknown) =>
        NextResponse.json(
          { error: error instanceof Error ? error.message : "Unable to detect price drop" },
          { status: 500 }
        )
      );

  if (result instanceof NextResponse) {
    return result;
  }

  if (!result) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    result
  });
}
