import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { inventoryService } from "@/server/services/inventory.service";
import { activityService } from "@/server/services/activity.service";
import { productSchema, productQuerySchema } from "@/lib/validations/inventory";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const validation = productQuerySchema.safeParse({
      q: searchParams.get("q") ?? "",
      categoryId: searchParams.get("categoryId") ?? "",
      status: searchParams.get("status") ?? "all",
      stock: searchParams.get("stock") ?? "all",
    });
    if (!validation.success) {
      return NextResponse.json({ error: "Filtros inválidos" }, { status: 400 });
    }

    const products = await inventoryService.listProducts(validation.data);
    return NextResponse.json({ products });
  } catch (error) {
    console.error("[GET /api/dashboard/inventory/products]", error);
    return NextResponse.json({ error: "Error al obtener productos" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

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

    const changedByName = `${session.username}`;
    const product = await inventoryService.createProduct(validation.data, changedByName, image);

    activityService.logFromSession(session, {
      action: "product_created",
      entityType: "inventory_product",
      entityId: product.id,
      entityName: product.name,
      description: `Producto "${product.name}" creado en inventario`,
      status: "success",
      page: "/dashboard/inventario",
      section: "Inventario / Productos",
      metadata: { productName: product.name, sku: product.sku, quantity: product.quantity, categoryId: product.categoryId },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("[POST /api/dashboard/inventory/products]", error);
    const message = "No se pudo crear el producto";
    const session = await getSession();
    if (session) {
      activityService.logFromSession(session, {
        action: "product_created",
        entityType: "inventory_product",
        description: `Error al crear producto: ${message}`,
        status: "error",
        errorMessage: error instanceof Error ? error.message : message,
        page: "/dashboard/inventario",
        section: "Inventario / Productos",
      });
    }
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
