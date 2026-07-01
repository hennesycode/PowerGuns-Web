import { NextResponse } from "next/server";
import { reservationService } from "@/server/services/reservation.service";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date") ?? "";
    const excludeReservationId = searchParams.get("excludeReservationId") ?? undefined;

    const availability = await reservationService.getAvailability(date, excludeReservationId);
    return NextResponse.json(availability);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al consultar disponibilidad";
    return NextResponse.json({ error: message, slots: [] }, { status: 400 });
  }
}
