import { NextResponse } from "next/server";
import { availabilityService } from "@/server/services/availability.service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  if (!date) return NextResponse.json({ error: "date required" }, { status: 400 });

  const slots = await availabilityService.getSlots(date);
  return NextResponse.json(slots);
}
