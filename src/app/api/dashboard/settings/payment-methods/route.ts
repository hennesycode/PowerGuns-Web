import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { paymentMethodSchema } from "@/lib/validations/payment-methods";
import { activityService } from "@/server/services/activity.service";
import { paymentMethodService } from "@/server/services/payment-method.service";

const ADMIN_ROLES = new Set(["administrador", "editor", "finanzas"]);

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !ADMIN_ROLES.has(session.role)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const methods = await paymentMethodService.list();
    return NextResponse.json({ methods });
  } catch (error) {
    console.error("[GET /api/dashboard/settings/payment-methods]", error);
    return NextResponse.json({ error: "Error al obtener métodos de pago" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !ADMIN_ROLES.has(session.role)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const validation = paymentMethodSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0]?.message ?? "Datos inválidos" }, { status: 400 });
    }

    const method = await paymentMethodService.create(validation.data);

    activityService.logFromSession(session, {
      action: "payment_method_created",
      entityType: "payment_method",
      entityId: method.id,
      entityName: method.providerLabel,
      description: `Método de pago ${method.providerLabel} creado`,
      status: "success",
      page: "/dashboard/configuracion",
      section: "Configuración / Métodos de pago",
      metadata: { provider: method.provider, accountHolderName: method.accountHolderName, isActive: method.isActive },
    });

    return NextResponse.json(method, { status: 201 });
  } catch (error) {
    const session = await getSession();
    const message = error instanceof Error ? error.message : "No se pudo crear el método de pago";
    if (session && ADMIN_ROLES.has(session.role)) {
      activityService.logFromSession(session, {
        action: "payment_method_created",
        entityType: "payment_method",
        description: "Error al crear método de pago",
        status: "error",
        errorMessage: message,
        page: "/dashboard/configuracion",
        section: "Configuración / Métodos de pago",
      });
    }
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
