import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { activityService } from "@/server/services/activity.service";
import { couponService } from "@/server/services/coupon.service";

const ADMIN_ROLES = new Set(["administrador", "editor", "finanzas"]);

async function requireAdmin() {
  const session = await getSession();
  if (!session) return { error: "No autorizado", status: 401 } as const;
  if (!ADMIN_ROLES.has(session.role)) return { error: "No autorizado", status: 403 } as const;
  return { session } as const;
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAdmin();
    if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
    const { id } = await params;
    const coupon = await couponService.getById(id);
    if (!coupon) return NextResponse.json({ error: "Cupón no encontrado" }, { status: 404 });
    return NextResponse.json(coupon);
  } catch (error) {
    console.error("[GET /api/dashboard/coupons/[id]]", error);
    return NextResponse.json({ error: "Error al obtener cupón" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAdmin();
    if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
    const { id } = await params;
    const body = await request.json();
    const coupon = await couponService.updateStatus(id, Boolean(body.isActive));
    activityService.logFromSession(auth.session, {
      action: "coupon_status_updated",
      entityType: "coupon",
      entityId: coupon.id,
      entityName: coupon.code,
      description: `Cupón ${coupon.code} ${coupon.isActive ? "activado" : "inactivado"}`,
      status: "success",
      page: "/dashboard/cupones",
      section: "Cupones",
    });
    return NextResponse.json(coupon);
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo actualizar el cupón";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
