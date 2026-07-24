import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { dashboardReservationSchema, reservationQuerySchema } from "@/lib/validations/reservation";
import { reservationService } from "@/server/services/reservation.service";
import { activityService } from "@/server/services/activity.service";
import { emailService } from "@/server/services/email.service";

const ADMIN_ROLES = new Set(["administrador", "editor", "finanzas"]);

async function requireAdmin() {
  const session = await getSession();
  if (!session) return { error: "No autorizado", status: 401 } as const;
  if (!ADMIN_ROLES.has(session.role)) return { error: "No autorizado", status: 403 } as const;
  return { session } as const;
}

export async function GET(request: Request) {
  try {
    const auth = await requireAdmin();
    if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const { searchParams } = new URL(request.url);
    const validation = reservationQuerySchema.safeParse({
      q: searchParams.get("q") ?? "",
      status: searchParams.get("status") ?? "all",
      date: searchParams.get("date") ?? "",
    });

    if (!validation.success) {
      return NextResponse.json({ error: "Filtros inválidos" }, { status: 400 });
    }

    const reservations = await reservationService.list(validation.data);
    return NextResponse.json({ reservations });
  } catch (error) {
    console.error("[GET /api/dashboard/reservations]", error);
    return NextResponse.json({ error: "Error al obtener reservas" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAdmin();
    if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const body = await request.json();
    const validation = dashboardReservationSchema.safeParse(body);
    if (!validation.success) {
      const message = validation.error.issues[0]?.message ?? "Datos inválidos";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const reservation = await reservationService.create(validation.data, { skipOverlapCheck: true });
    const [customerEmail, companyEmail] = await Promise.all([
      emailService.sendReservationConfirmation(reservation),
      emailService.sendReservationAdminNotification(reservation),
    ]);
    if (!customerEmail.success) console.error("[ReservationEmail:manual-create:customer]", customerEmail.error);
    if (!companyEmail.success) console.error("[ReservationEmail:manual-create:company]", companyEmail.error);

    activityService.logFromSession(auth.session, {
      action: "reservation_created",
      entityType: "reservation",
      entityId: reservation.id,
      entityName: reservation.reservationCode,
      description: `Reserva ${reservation.reservationCode} creada por ${reservation.firstName} ${reservation.lastName} — ${reservation.total.toLocaleString("es-CO")} COP`,
      status: "success",
      page: "/dashboard/reservas",
      section: "Reservas",
      metadata: { reservationCode: reservation.reservationCode, total: reservation.total, status: reservation.status, items: reservation.services.length },
    });

    return NextResponse.json(reservation, { status: 201 });
  } catch (error) {
    console.error("[POST /api/dashboard/reservations]", error);
    const message = error instanceof Error ? error.message : "No se pudo crear la reserva";
    const status = message.includes("ya no está disponible") ? 409 : 400;

    const auth = await requireAdmin();
    if (!("error" in auth)) {
      activityService.logFromSession(auth.session, {
        action: "reservation_created",
        entityType: "reservation",
        description: `Error al crear reserva: ${message}`,
        status: "error",
        errorMessage: message,
        page: "/dashboard/reservas",
        section: "Reservas",
      });
    }

    return NextResponse.json({ error: message }, { status });
  }
}
