import { NextResponse } from "next/server";
import { z } from "zod/v4";
import { getSession } from "@/lib/auth";
import { isValidDateKey } from "@/lib/timezone";
import { activityService } from "@/server/services/activity.service";
import { businessHoursService } from "@/server/services/business-hours.service";

const ADMIN_ROLES = new Set(["administrador", "editor", "finanzas"]);
const slotSchema = z.object({
  openTime: z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/),
  closeTime: z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/),
});
const exceptionSchema = z.object({
  dateKey: z.string(),
  isOpen: z.boolean(),
  reason: z.string().trim().min(2, "Indica el motivo").max(500, "El motivo no puede superar 500 caracteres"),
  slots: z.array(slotSchema).max(4),
});

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !ADMIN_ROLES.has(session.role)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    const exceptions = await businessHoursService.listOverrides();
    return NextResponse.json({ exceptions });
  } catch (error) {
    console.error("[GET /api/dashboard/settings/business-hours/exceptions]", error);
    return NextResponse.json({ error: "No se pudieron cargar las excepciones" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !ADMIN_ROLES.has(session.role)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    const validation = exceptionSchema.safeParse(await request.json());
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0]?.message ?? "Datos inválidos" }, { status: 400 });
    }
    const { dateKey, isOpen, reason } = validation.data;
    const slots = isOpen ? validation.data.slots : [];
    if (!isValidDateKey(dateKey)) {
      return NextResponse.json({ error: "Selecciona una fecha válida" }, { status: 400 });
    }
    if (isOpen && slots.length === 0) {
      return NextResponse.json({ error: "Agrega al menos un bloque de atención" }, { status: 400 });
    }
    for (let index = 0; index < slots.length; index += 1) {
      const slot = slots[index];
      if (slot.openTime >= slot.closeTime || (index > 0 && slot.openTime < slots[index - 1].closeTime)) {
        return NextResponse.json({ error: "Los bloques deben estar en orden y no pueden cruzarse" }, { status: 400 });
      }
    }

    const exception = await businessHoursService.saveOverride({
      ...validation.data,
      slots,
      changedBy: session.username,
    });
    activityService.logFromSession(session, {
      action: "business_hours_exception_saved",
      entityType: "business_hours_exception",
      entityId: exception.id,
      entityName: dateKey,
      description: `Excepción de horario ${isOpen ? "actualizada" : "bloqueada"} para ${dateKey}`,
      status: "success",
      page: "/dashboard/configuracion",
      section: "Configuración / Excepciones de horario",
      metadata: { dateKey, isOpen, reason, slots },
    });
    return NextResponse.json({ exception });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo guardar la excepción";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
