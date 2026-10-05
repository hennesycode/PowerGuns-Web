import { NextResponse } from "next/server";
import { businessHoursService } from "@/server/services/business-hours.service";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const hours = await businessHoursService.getAll();
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const overrides = from && to ? await businessHoursService.getPublicOverrides(from, to) : [];
    return NextResponse.json({ hours, overrides });
  } catch (error) {
    console.error("[GET /api/public/business-hours]", error);
    return NextResponse.json({ error: "Error al obtener horarios", hours: [] }, { status: 500 });
  }
}
