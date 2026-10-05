import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { activityService } from "@/server/services/activity.service";
import { businessHoursService } from "@/server/services/business-hours.service";

const ADMIN_ROLES = new Set(["administrador", "editor", "finanzas"]);

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || !ADMIN_ROLES.has(session.role)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    const { id } = await context.params;
    await businessHoursService.deactivateOverride(id, session.username);
    activityService.logFromSession(session, {
      action: "business_hours_exception_cancelled",
      entityType: "business_hours_exception",
      entityId: id,
      description: `Excepción de horario cancelada (${id})`,
      status: "success",
      page: "/dashboard/configuracion",
      section: "Configuración / Excepciones de horario",
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo cancelar la excepción";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
