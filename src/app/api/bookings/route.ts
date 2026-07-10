import { NextResponse } from "next/server";
import { bookingSchema } from "@/lib/validations";
import { bookingService } from "@/server/services/booking.service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = bookingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const booking = await bookingService.create(parsed.data);
    return NextResponse.json({ success: true, bookingId: booking.id });
  } catch {
    return NextResponse.json({ error: "Error al crear la reserva" }, { status: 500 });
  }
}
