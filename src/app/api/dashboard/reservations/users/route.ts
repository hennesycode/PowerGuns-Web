import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { reservationService } from "@/server/services/reservation.service";

const ADMIN_ROLES = new Set(["administrador", "editor", "finanzas"]);

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    if (!ADMIN_ROLES.has(session.role)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") ?? "";
    const users = await reservationService.listUsers(q);
    return NextResponse.json({ users });
  } catch (error) {
    console.error("[GET /api/dashboard/reservations/users]", error);
    return NextResponse.json({ error: "Error al obtener usuarios" }, { status: 500 });
  }
}
