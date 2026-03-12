import { NextRequest, NextResponse } from "next/server";
import {
  capturePriceSnapshotForEvent,
  getSnapshotsForEvent
} from "@/lib/price-snapshots";

export async function GET(request: NextRequest) {
  const eventId = request.nextUrl.searchParams.get("eventId");
  const limitParam = request.nextUrl.searchParams.get("limit");
  const limit = limitParam ? Number(limitParam) : 20;

  if (!eventId) {
    return NextResponse.json({ error: "Missing eventId" }, { status: 400 });
  }

  const snapshots = await getSnapshotsForEvent(eventId, Number.isFinite(limit) ? limit : 20).catch(
    (error: unknown) =>
      NextResponse.json(
        { error: error instanceof Error ? error.message : "Unable to read snapshots" },
        { status: 500 }
      )
  );

  if (snapshots instanceof NextResponse) {
    return snapshots;
  }

  return NextResponse.json({ snapshots });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const eventId = typeof body?.eventId === "string" ? body.eventId : "";

  if (!eventId) {
    return NextResponse.json({ error: "Missing eventId" }, { status: 400 });
  }

  const result = await capturePriceSnapshotForEvent(eventId).catch((error: unknown) =>
    NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to capture snapshot" },
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
    storage: result.store,
    storagePath: result.store === "file" ? result.storagePath : undefined,
    snapshot: result.snapshot
  });
}
