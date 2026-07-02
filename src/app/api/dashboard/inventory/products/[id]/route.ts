import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { inventoryService } from "@/server/services/inventory.service";
import { activityService } from "@/server/services/activity.service";
import { productSchema } from "@/lib/validations/inventory";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    const { id } = await params;

    const formData = await request.formData();
    const payloadRaw = formData.get("payload");
    if (!payloadRaw || typeof payloadRaw !== "string") {
      return NextResponse.json({ error: "Datos del producto requeridos" }, { status: 400 });
    }

    let parsed: unknown;
    try { parsed = JSON.parse(payloadRaw); } catch {
      return NextResponse.json({ error: "Formato de datos inválido" }, { status: 400 });
    }

    const validation = productSchema.safeParse(parsed);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0]?.message ?? "Datos inválidos" }, { status: 400 });
    }

    let image: { url: string; key: string } | null = null;
    const imageFile = formData.get("image");
    if (imageFile && imageFile instanceof File) {
      const { validateImage, optimizeImageToWebp } = await import("@/lib/image-optimizer");
      const { uploadToR2, generateStorageKey } = await import("@/lib/storage");
      validateImage(imageFile);
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const optimized = await optimizeImageToWebp(buffer, { maxWidth: 800, maxHeight: 800, quality: 82, fit: "cover" });
      const key = generateStorageKey("powerguns/inventory", `product-${Date.now()}.webp`);
      const url = await uploadToR2(optimized, key, "image/webp");
      image = { url, key };
    }

    const existing = await inventoryService.getProduct(id);
    const changedByName = `${session.username}`;
    const product = await inventoryService.updateProduct(id, validation.data, changedByName, image);

    // Delete old image from R2 after successful update
    if (image && existing?.imageKey) {
      setTimeout(async () => {
        try {
          const { deleteFromR2Silent } = await import("@/lib/storage");
          await deleteFromR2Silent(existing.imageKey!);
        } catch { /* silent */ }
      }, 0);
    }

    activityService.logFromSession(session, {
      action: "product_updated",
      entityType: "inventory_product",
      entityId: id,
      entityName: product.name,
      description: `Producto "${product.name}" actualizado en inventario`,
      status: "success",
      page: "/dashboard/inventario",
      section: "Inventario / Productos",
      metadata: { productName: product.name, hasNewImage: !!image },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("[PUT /api/dashboard/inventory/products/[id]]", error);
    const session = await getSession();
    if (session) {
      activityService.logFromSession(session, {
        action: "product_updated",
        entityType: "inventory_product",
        description: `Error al actualizar producto`,
        status: "error",
        errorMessage: error instanceof Error ? error.message : "Error desconocido",
        page: "/dashboard/inventario",
        section: "Inventario / Productos",
      });
    }
    return NextResponse.json({ error: "No se pudo actualizar el producto" }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    const { id } = await params;

    const existing = await inventoryService.getProduct(id);
    const changedByName = `${session.username}`;
    await inventoryService.deleteProduct(id, changedByName);

    if (existing) {
      activityService.logFromSession(session, {
        action: "product_deleted",
        entityType: "inventory_product",
        entityId: id,
        entityName: existing.name,
        description: `Producto "${existing.name}" eliminado del inventario`,
        status: "success",
        page: "/dashboard/inventario",
        section: "Inventario / Productos",
        metadata: { productName: existing.name, sku: existing.sku },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const session = await getSession();
    if (session) {
      activityService.logFromSession(session, {
        action: "product_deleted",
        entityType: "inventory_product",
        description: `Error al eliminar producto`,
        status: "error",
        errorMessage: error instanceof Error ? error.message : "Error desconocido",
        page: "/dashboard/inventario",
        section: "Inventario / Productos",
      });
    }
    return NextResponse.json({ error: "No se pudo eliminar el producto" }, { status: 400 });
  }
}
