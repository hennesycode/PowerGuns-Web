import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { paymentMethodSchema } from "@/lib/validations/payment-methods";
import { activityService } from "@/server/services/activity.service";
import { paymentMethodService } from "@/server/services/payment-method.service";

const ADMIN_ROLES = new Set(["administrador", "editor", "finanzas"]);

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || !ADMIN_ROLES.has(session.role)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validation = paymentMethodSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0]?.message ?? "Datos inválidos" }, { status: 400 });
    }

    const method = await paymentMethodService.update(id, validation.data);

    activityService.logFromSession(session, {
      action: "payment_method_updated",
      entityType: "payment_method",
      entityId: method.id,
      entityName: method.providerLabel,
      description: `Método de pago ${method.providerLabel} actualizado`,
      status: "success",
      page: "/dashboard/configuracion",
      section: "Configuración / Métodos de pago",
      metadata: { provider: method.provider, accountHolderName: method.accountHolderName, isActive: method.isActive },
    });

    return NextResponse.json(method);
  } catch (error) {
    const session = await getSession();
    const message = error instanceof Error ? error.message : "No se pudo actualizar el método de pago";
    if (session && ADMIN_ROLES.has(session.role)) {
      activityService.logFromSession(session, {
        action: "payment_method_updated",
        entityType: "payment_method",
        description: "Error al actualizar método de pago",
        status: "error",
        errorMessage: message,
        page: "/dashboard/configuracion",
        section: "Configuración / Métodos de pago",
      });
    }
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || !ADMIN_ROLES.has(session.role)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    await paymentMethodService.delete(id);

    activityService.logFromSession(session, {
      action: "payment_method_deleted",
      entityType: "payment_method",
      entityId: id,
      description: "Método de pago eliminado",
      status: "success",
      page: "/dashboard/configuracion",
      section: "Configuración / Métodos de pago",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const session = await getSession();
    const message = error instanceof Error ? error.message : "No se pudo eliminar el método de pago";
    if (session && ADMIN_ROLES.has(session.role)) {
      activityService.logFromSession(session, {
        action: "payment_method_deleted",
        entityType: "payment_method",
        description: "Error al eliminar método de pago",
        status: "error",
        errorMessage: message,
        page: "/dashboard/configuracion",
        section: "Configuración / Métodos de pago",
      });
    }
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
