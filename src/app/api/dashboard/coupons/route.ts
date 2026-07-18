import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { couponSchema } from "@/lib/validations/coupon";
import { activityService } from "@/server/services/activity.service";
import { couponService } from "@/server/services/coupon.service";

const ADMIN_ROLES = new Set(["administrador", "editor", "finanzas"]);

async function requireAdmin() {
  const session = await getSession();
  if (!session) return { error: "No autorizado", status: 401 } as const;
  if (!ADMIN_ROLES.has(session.role)) return { error: "No autorizado", status: 403 } as const;
  return { session } as const;
}

export async function GET() {
  try {
    const auth = await requireAdmin();
    if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
    const coupons = await couponService.list();
    return NextResponse.json({ coupons });
  } catch (error) {
    console.error("[GET /api/dashboard/coupons]", error);
    return NextResponse.json({ error: "Error al obtener cupones" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAdmin();
    if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const body = await request.json();
    const validation = couponSchema.safeParse({ ...body, code: String(body.code ?? "").toUpperCase() });
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0]?.message ?? "Datos inválidos" }, { status: 400 });
    }

    const coupon = await couponService.create(validation.data);
    activityService.logFromSession(auth.session, {
      action: "coupon_created",
      entityType: "coupon",
      entityId: coupon.id,
      entityName: coupon.code,
      description: `Cupón ${coupon.code} creado`,
      status: "success",
      page: "/dashboard/cupones",
      section: "Cupones",
    });
    return NextResponse.json(coupon, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo crear el cupón";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
