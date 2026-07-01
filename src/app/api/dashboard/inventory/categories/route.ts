import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { inventoryService } from "@/server/services/inventory.service";
import { categorySchema } from "@/lib/validations/inventory";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get("mode") ?? "";
    if (mode === "select") {
      const categories = await inventoryService.listCategoriesForSelect();
      return NextResponse.json({ categories });
    }
    const categories = await inventoryService.listCategories();
    return NextResponse.json({ categories });
  } catch (error) {
    console.error("[GET /api/dashboard/inventory/categories]", error);
    return NextResponse.json({ error: "Error al obtener categorías" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    const body = await request.json();
    const validation = categorySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0]?.message ?? "Datos inválidos" }, { status: 400 });
    }
    const category = await inventoryService.createCategory(validation.data);
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("[POST /api/dashboard/inventory/categories]", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "No se pudo crear la categoría" }, { status: 400 });
  }
}
