import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { updateCertificateItemSchema } from "@/lib/validations/certificados-dccae";
import { activityService } from "@/server/services/activity.service";
import { certificadosDccaeService } from "@/server/services/certificados-dccae.service";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { id } = await params;
    const body = await request.json();
    const validation = updateCertificateItemSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues.map((issue) => issue.message).join(", ") },
        { status: 400 },
      );
    }

    const item = await certificadosDccaeService.update(id, validation.data);
    activityService.logFromSession(session, {
      action: validation.data.parentId !== undefined ? "certificate_item_moved" : "certificate_item_renamed",
      entityType: "certificate_dccae_item",
      entityId: item.id,
      entityName: item.name,
      description: `Elemento "${item.name}" actualizado en Certificados DCCAE`,
      page: "/dashboard/certificados-dccae",
      section: "Certificados DCCAE",
    });
    return NextResponse.json(item);
  } catch (error) {
    console.error("[PATCH /api/dashboard/certificados-dccae/[id]]", error);
    const message = error instanceof Error ? error.message : "Error al actualizar";
    const status = message.includes("existe") || message.includes("no existe") || message.includes("No puedes") ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { id } = await params;
    await certificadosDccaeService.delete(id);
    activityService.logFromSession(session, {
      action: "certificate_item_deleted",
      entityType: "certificate_dccae_item",
      entityId: id,
      description: "Elemento eliminado de Certificados DCCAE",
      page: "/dashboard/certificados-dccae",
      section: "Certificados DCCAE",
    });
    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error("[DELETE /api/dashboard/certificados-dccae/[id]]", error);
    const message = error instanceof Error ? error.message : "Error al eliminar";
    const status = message.includes("no existe") ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
