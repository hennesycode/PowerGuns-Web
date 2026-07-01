import { NextResponse } from "next/server";
import { publicReservationSchema } from "@/lib/validations/reservation";
import { reservationService } from "@/server/services/reservation.service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = publicReservationSchema.safeParse(body);
    if (!validation.success) {
      const message = validation.error.issues[0]?.message ?? "Datos inválidos";
      return NextResponse.json({ success: false, error: message }, { status: 400 });
    }

    const reservation = await reservationService.create(validation.data);
    return NextResponse.json(
      {
        success: true,
        reservation: {
          id: reservation.id,
          reservationCode: reservation.reservationCode,
          status: reservation.status,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[POST /api/public/reservations]", error);
    const message = error instanceof Error ? error.message : "No se pudo crear la reserva. Intenta nuevamente.";
    const status = message.includes("ya no está disponible") ? 409 : 400;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
