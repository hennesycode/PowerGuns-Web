import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { trainingService } from "@/server/services/training.service";

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

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[PATCH /api/dashboard/services/[id]/status]", error);
    const message =
      error instanceof Error ? error.message : "Error al actualizar estado";
    const status = message.includes("no encontrado") ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
