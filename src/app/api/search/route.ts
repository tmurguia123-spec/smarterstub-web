import { NextRequest, NextResponse } from "next/server";
import { searchUnifiedEvents } from "@/lib/ticket-service";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q") ?? "";
  const result = await searchUnifiedEvents(query);

  return NextResponse.json(result);
}
