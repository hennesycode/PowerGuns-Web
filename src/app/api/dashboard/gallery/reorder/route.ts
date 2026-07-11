import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { galleryService } from "@/server/services/gallery.service";

const ADMIN_ROLES = new Set(["administrador", "editor"]);

async function requireAdmin() {
  const session = await getSession();
  if (!session) return { error: "No autorizado", status: 401 } as const;
  if (!ADMIN_ROLES.has(session.role)) return { error: "No autorizado", status: 403 } as const;
  return { session } as const;
}

export async function PATCH(request: Request) {
  try {
    const auth = await requireAdmin();
    if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const body = await request.json();
    const ids = Array.isArray(body.ids) ? body.ids.filter((id: unknown): id is string => typeof id === "string") : [];
    if (ids.length === 0) return NextResponse.json({ error: "Orden inválido" }, { status: 400 });

    const items = await galleryService.reorder(ids);
    return NextResponse.json({ items });
  } catch (error) {
    console.error("[PATCH /api/dashboard/gallery/reorder]", error);
    return NextResponse.json({ error: "No se pudo actualizar el orden" }, { status: 500 });
  }
}
