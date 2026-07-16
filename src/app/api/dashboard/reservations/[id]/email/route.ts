import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { activityService } from "@/server/services/activity.service";
import { emailService } from "@/server/services/email.service";
import { reservationService } from "@/server/services/reservation.service";

const ADMIN_ROLES = new Set(["administrador", "editor", "finanzas"]);

async function requireAdmin() {
  const session = await getSession();
  if (!session) return { error: "No autorizado", status: 401 } as const;
  if (!ADMIN_ROLES.has(session.role)) return { error: "No autorizado", status: 403 } as const;
  return { session } as const;
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireAdmin();
    if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const { id } = await params;
    const reservation = await reservationService.getById(id);
    if (!reservation) return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 });

    const result = await emailService.sendReservationConfirmation(reservation);
    if (!result.success) {
      activityService.logFromSession(auth.session, {
        action: "reservation_confirmation_email",
        entityType: "reservation",
        entityId: reservation.id,
        entityName: reservation.reservationCode,
        description: `Error al reenviar confirmación de reserva ${reservation.reservationCode}: ${result.error}`,
        status: "error",
        errorMessage: result.error,
        page: "/dashboard/reservas",
        section: "Reservas",
      });
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    activityService.logFromSession(auth.session, {
      action: "reservation_confirmation_email",
      entityType: "reservation",
      entityId: reservation.id,
      entityName: reservation.reservationCode,
      description: `Confirmación de reserva ${reservation.reservationCode} reenviada a ${reservation.email}`,
      status: "success",
      page: "/dashboard/reservas",
      section: "Reservas",
      metadata: { reservationCode: reservation.reservationCode, email: reservation.email },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[POST /api/dashboard/reservations/[id]/email]", error);
    return NextResponse.json({ error: "No se pudo reenviar el correo" }, { status: 500 });
  }
}
