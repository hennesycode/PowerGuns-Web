import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { COLOMBIA_TIME_ZONE } from "@/lib/timezone";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const now = new Date();
  return NextResponse.json(
    {
      now: now.getTime(),
      iso: now.toISOString(),
      timeZone: COLOMBIA_TIME_ZONE,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
