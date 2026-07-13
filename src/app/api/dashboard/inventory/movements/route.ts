import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { stockMovementSchema } from "@/lib/validations/inventory";
import { activityService } from "@/server/services/activity.service";
import { inventoryService } from "@/server/services/inventory.service";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const movements = await inventoryService.listStockMovements();
    return NextResponse.json({ movements });
  } catch (error) {
    console.error("[GET /api/dashboard/inventory/movements]", error);
    return NextResponse.json({ error: "Error al obtener movimientos" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const body = await request.json();
    const validation = stockMovementSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0]?.message ?? "Datos inválidos" }, { status: 400 });
    }

    const changedByName = `${session.username}`;
    const result = await inventoryService.createStockMovement(validation.data, changedByName);
    const isEntry = validation.data.type === "in";
    const action = isEntry ? "product_stock_in" : "product_stock_out";
    const label = isEntry ? "entrada" : "salida";

    activityService.logFromSession(session, {
      action,
      entityType: "inventory_product",
      entityId: result.product.id,
      entityName: result.product.name,
      description: `Se registró ${label} de ${result.movedQuantity} unidad(es) para "${result.product.name}". Stock: ${result.history.oldValue} -> ${result.history.newValue}`,
      status: "success",
      page: "/dashboard/inventario",
      section: "Inventario / Movimientos",
      metadata: {
        productName: result.product.name,
        sku: result.product.sku,
        movementType: validation.data.type,
        quantity: result.movedQuantity,
        previousQuantity: Number(result.history.oldValue),
        newQuantity: Number(result.history.newValue),
      },
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    const session = await getSession();
    if (session) {
      activityService.logFromSession(session, {
        action: "product_stock_movement",
        entityType: "inventory_product",
        description: "Error al registrar movimiento de inventario",
        status: "error",
        errorMessage: error instanceof Error ? error.message : "Error desconocido",
        page: "/dashboard/inventario",
        section: "Inventario / Movimientos",
      });
    }
    return NextResponse.json({ error: error instanceof Error ? error.message : "No se pudo registrar el movimiento" }, { status: 400 });
  }
}
