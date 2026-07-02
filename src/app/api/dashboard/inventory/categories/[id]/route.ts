import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { inventoryService } from "@/server/services/inventory.service";
import { activityService } from "@/server/services/activity.service";
import { categorySchema } from "@/lib/validations/inventory";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    const { id } = await params;
    const body = await request.json();
    const validation = categorySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0]?.message ?? "Datos inválidos" }, { status: 400 });
    }
    const category = await inventoryService.updateCategory(id, validation.data);

    activityService.logFromSession(session, {
      action: "category_updated",
      entityType: "inventory_category",
      entityId: id,
      entityName: category.name,
      description: `Categoría "${category.name}" actualizada`,
      status: "success",
      page: "/dashboard/inventario",
      section: "Inventario / Categorías",
    });

    return NextResponse.json(category);
  } catch (error) {
    const session = await getSession();
    if (session) {
      activityService.logFromSession(session, {
        action: "category_updated",
        entityType: "inventory_category",
        description: `Error al actualizar categoría`,
        status: "error",
        errorMessage: error instanceof Error ? error.message : "Error desconocido",
        page: "/dashboard/inventario",
        section: "Inventario / Categorías",
      });
    }
    const message = error instanceof Error ? error.message : "No se pudo actualizar la categoría";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    const { id } = await params;
    await inventoryService.deleteCategory(id);

    activityService.logFromSession(session, {
      action: "category_deleted",
      entityType: "inventory_category",
      entityId: id,
      description: `Categoría eliminada del inventario`,
      status: "success",
      page: "/dashboard/inventario",
      section: "Inventario / Categorías",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const session = await getSession();
    if (session) {
      activityService.logFromSession(session, {
        action: "category_deleted",
        entityType: "inventory_category",
        description: `Error al eliminar categoría`,
        status: "error",
        errorMessage: error instanceof Error ? error.message : "Error desconocido",
        page: "/dashboard/inventario",
        section: "Inventario / Categorías",
      });
    }
    const message = error instanceof Error ? error.message : "No se pudo eliminar la categoría";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
