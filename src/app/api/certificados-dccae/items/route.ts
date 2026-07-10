import { NextResponse } from "next/server";
import { getDccaeSession } from "@/lib/dccae-auth";
import { certificadosDccaeService } from "@/server/services/certificados-dccae.service";

export async function GET(request: Request) {
  try {
    const session = await getDccaeSession();
    if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const parentId = searchParams.get("parentId");
    const data = await certificadosDccaeService.list(parentId);
    return NextResponse.json(data);
  } catch (error) {
    console.error("[GET /api/certificados-dccae/items]", error);
    const message = error instanceof Error ? error.message : "Error al cargar certificados";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
