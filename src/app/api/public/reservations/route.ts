import { NextResponse } from "next/server";
import { publicReservationSchema } from "@/lib/validations/reservation";
import { paymentMethodService } from "@/server/services/payment-method.service";
import { reservationService } from "@/server/services/reservation.service";
import { emailService } from "@/server/services/email.service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = publicReservationSchema.safeParse(body);
    if (!validation.success) {
      const message = validation.error.issues[0]?.message ?? "Datos inválidos";
      return NextResponse.json({ success: false, error: message }, { status: 400 });
    }

    const reservation = await reservationService.create(validation.data);
    const [customerEmail, adminEmail] = await Promise.all([
      emailService.sendReservationConfirmation(reservation),
      emailService.sendReservationAdminNotification(reservation),
    ]);
    if (!customerEmail.success) console.error("[ReservationEmail:customer]", customerEmail.error);
    if (!adminEmail.success) console.error("[ReservationEmail:admin]", adminEmail.error);

    const paymentMethod = validation.data.paymentMethodId
      ? await paymentMethodService.getActiveById(validation.data.paymentMethodId)
      : null;
    return NextResponse.json(
      {
        success: true,
        reservation: {
          id: reservation.id,
          reservationCode: reservation.reservationCode,
          firstName: reservation.firstName,
          lastName: reservation.lastName,
          reservationDate: reservation.reservationDate,
          reservationTimeLabel: reservation.reservationTimeLabel,
          status: reservation.status,
          paymentMethodLabel: reservation.paymentMethodLabel,
          paymentMethod: paymentMethod
            ? {
                type: paymentMethod.type,
                providerLabel: paymentMethod.providerLabel,
                accountNumber: paymentMethod.accountNumber,
                accountHolderName: paymentMethod.accountHolderName,
                identificationNumber: paymentMethod.identificationNumber,
              }
            : null,
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
