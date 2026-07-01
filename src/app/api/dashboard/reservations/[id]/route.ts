import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { updateReservationSchema } from "@/lib/validations/reservation";
import { reservationService } from "@/server/services/reservation.service";

const ADMIN_ROLES = new Set(["administrador", "editor", "finanzas"]);

async function requireAdmin() {
  const session = await getSession();
  if (!session) return { error: "No autorizado", status: 401 } as const;
  if (!ADMIN_ROLES.has(session.role)) return { error: "No autorizado", status: 403 } as const;
  return { session } as const;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireAdmin();
    if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const { id } = await params;
    const reservation = await reservationService.getById(id);
    if (!reservation) return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 });
    return NextResponse.json(reservation);
  } catch (error) {
    console.error("[GET /api/dashboard/reservations/[id]]", error);
    return NextResponse.json({ error: "Error al obtener reserva" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireAdmin();
    if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const { id } = await params;
    const body = await request.json();
    const validation = updateReservationSchema.safeParse(body);
    if (!validation.success) {
      const message = validation.error.issues[0]?.message ?? "Datos inválidos";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const reservation = await reservationService.update(id, validation.data);
    return NextResponse.json(reservation);
  } catch (error) {
    console.error("[PUT /api/dashboard/reservations/[id]]", error);
    const message = error instanceof Error ? error.message : "No se pudo actualizar la reserva";
    const status = message.includes("no encontrada") ? 404 : message.includes("ya no está disponible") ? 409 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireAdmin();
    if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const { id } = await params;
    await reservationService.delete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/dashboard/reservations/[id]]", error);
    return NextResponse.json({ error: "No se pudo eliminar la reserva" }, { status: 400 });
  }
}
