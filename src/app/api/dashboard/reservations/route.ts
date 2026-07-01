import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { dashboardReservationSchema, reservationQuerySchema } from "@/lib/validations/reservation";
import { reservationService } from "@/server/services/reservation.service";

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

    const reservation = await reservationService.create(validation.data);
    return NextResponse.json(reservation, { status: 201 });
  } catch (error) {
    console.error("[POST /api/dashboard/reservations]", error);
    const message = error instanceof Error ? error.message : "No se pudo crear la reserva";
    const status = message.includes("ya no está disponible") ? 409 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
