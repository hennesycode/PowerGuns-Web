import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { trainingService } from "@/server/services/training.service";
import { activityService } from "@/server/services/activity.service";

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const updated = await trainingService.toggleStatus(Number(id));

    activityService.logFromSession(session, {
      action: "service_status_changed",
      entityType: "training_service",
      entityId: id,
      entityName: updated.name,
      description: `Servicio "${updated.name}" ${updated.isActive ? "activado" : "desactivado"}`,
      status: "success",
      page: "/dashboard/servicios",
      section: "Servicios",
      metadata: { serviceName: updated.name, isActive: updated.isActive },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[PATCH /api/dashboard/services/[id]/status]", error);
    const message =
      error instanceof Error ? error.message : "Error al actualizar estado";
    const status = message.includes("no encontrado") ? 404 : 500;

    const session = await getSession();
    if (session) {
      activityService.logFromSession(session, {
        action: "service_status_changed",
        entityType: "training_service",
        description: `Error al cambiar estado: ${message}`,
        status: "error",
        errorMessage: message,
        page: "/dashboard/servicios",
        section: "Servicios",
      });
    }

    return NextResponse.json({ error: message }, { status });
  }
}
