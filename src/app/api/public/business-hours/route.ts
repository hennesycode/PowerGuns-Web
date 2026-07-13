import { NextResponse } from "next/server";
import { businessHoursService } from "@/server/services/business-hours.service";

export async function GET() {
  try {
    const hours = await businessHoursService.getAll();
    return NextResponse.json({ hours });
  } catch (error) {
    console.error("[GET /api/public/business-hours]", error);
    return NextResponse.json({ error: "Error al obtener horarios", hours: [] }, { status: 500 });
  }
}
