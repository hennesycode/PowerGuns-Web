import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { activityService } from "@/server/services/activity.service";

const ADMIN_ROLES = new Set(["administrador", "editor", "finanzas"]);

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !ADMIN_ROLES.has(session.role)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const stats = await activityService.getStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error("[GET /api/dashboard/stats]", error);
    return NextResponse.json({ error: "Error al obtener estadísticas" }, { status: 500 });
  }
}
