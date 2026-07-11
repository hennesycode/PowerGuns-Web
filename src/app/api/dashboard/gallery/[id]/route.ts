import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { deleteFromR2Silent } from "@/lib/storage";
import { activityService } from "@/server/services/activity.service";
import { galleryService } from "@/server/services/gallery.service";

const ADMIN_ROLES = new Set(["administrador", "editor"]);

async function requireAdmin() {
  const session = await getSession();
  if (!session) return { error: "No autorizado", status: 401 } as const;
  if (!ADMIN_ROLES.has(session.role)) return { error: "No autorizado", status: 403 } as const;
  return { session } as const;
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAdmin();
    if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const { id } = await params;
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (name.length < 2) return NextResponse.json({ error: "Nombre inválido" }, { status: 400 });

    const item = await galleryService.updateName(id, name);
    return NextResponse.json({ item });
  } catch (error) {
    console.error("[PATCH /api/dashboard/gallery/[id]]", error);
    return NextResponse.json({ error: "No se pudo actualizar el archivo" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAdmin();
    if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const { id } = await params;
    const deleted = await galleryService.delete(id);
    await deleteFromR2Silent(deleted.fileKey);

    activityService.logFromSession(auth.session, {
      action: "gallery_deleted",
      entityType: "gallery_item",
      entityId: id,
      entityName: deleted.name,
      description: `Archivo de galería "${deleted.name}" eliminado`,
      status: "success",
      page: "/dashboard/galeria",
      section: "Galería",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/dashboard/gallery/[id]]", error);
    return NextResponse.json({ error: "No se pudo eliminar el archivo" }, { status: 500 });
  }
}
