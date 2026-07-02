import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { activityService } from "@/server/services/activity.service";

const ADMIN_ROLES = new Set(["administrador", "editor", "finanzas"]);

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || !ADMIN_ROLES.has(session.role)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") ?? "1", 10);
    const limit = parseInt(searchParams.get("limit") ?? "20", 10);
    const action = searchParams.get("action") ?? undefined;
    const entityType = searchParams.get("entityType") ?? undefined;
    const status = searchParams.get("status") ?? undefined;

    const result = await activityService.getFeed({ page, limit, action, entityType, status });
    return NextResponse.json(result);
  } catch (error) {
    console.error("[GET /api/dashboard/activity]", error);
    return NextResponse.json({ error: "Error al obtener actividad" }, { status: 500 });
  }
}
