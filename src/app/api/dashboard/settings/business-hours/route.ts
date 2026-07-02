import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { z } from "zod/v4";
import { businessHoursService } from "@/server/services/business-hours.service";
import { activityService } from "@/server/services/activity.service";

const ADMIN_ROLES = new Set(["administrador", "editor", "finanzas"]);

const slotSchema = z.object({
  openTime: z.string().regex(/^\d{2}:\d{2}$/, "Hora inválida"),
  closeTime: z.string().regex(/^\d{2}:\d{2}$/, "Hora inválida"),
});

const dayInputSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  isOpen: z.boolean(),
  slots: z.array(slotSchema),
});

const upsertAllSchema = z.object({
  days: z.array(dayInputSchema).length(7, "Deben enviarse los 7 días"),
});

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !ADMIN_ROLES.has(session.role)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const hours = await businessHoursService.getAll();
    return NextResponse.json({ hours });
  } catch (error) {
    console.error("[GET /api/dashboard/settings/business-hours]", error);
    return NextResponse.json({ error: "Error al obtener horarios" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session || !ADMIN_ROLES.has(session.role)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const validation = upsertAllSchema.safeParse(body);

    if (!validation.success) {
      const message = validation.error.issues[0]?.message ?? "Datos inválidos";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    // Validate each day's slots
    for (const day of validation.data.days) {
      if (!day.isOpen) continue;
      if (day.slots.length === 0) {
        return NextResponse.json(
          { error: `El día debe tener al menos un bloque horario si está abierto` },
          { status: 400 },
        );
      }
      for (const slot of day.slots) {
        if (slot.openTime >= slot.closeTime) {
          return NextResponse.json(
            { error: `La apertura debe ser menor al cierre en uno de los bloques` },
            { status: 400 },
          );
        }
      }
    }

    const hours = await businessHoursService.upsertAll(validation.data.days);

    const openDays = validation.data.days.filter((d) => d.isOpen).map((d) => d.dayOfWeek);
    activityService.logFromSession(session, {
      action: "business_hours_updated",
      entityType: "business_hours",
      description: `Horarios actualizados — ${openDays.length} días abiertos`,
      status: "success",
      page: "/dashboard/configuracion",
      section: "Configuración / Horarios",
      metadata: {
        openDays: validation.data.days.filter((d) => d.isOpen).map((d) => ({ day: d.dayOfWeek, slots: d.slots })),
        closedDays: validation.data.days.filter((d) => !d.isOpen).map((d) => d.dayOfWeek),
      },
    });

    return NextResponse.json({ hours });
  } catch (error) {
    console.error("[PUT /api/dashboard/settings/business-hours]", error);
    const message = error instanceof Error ? error.message : "No se pudieron guardar los horarios";

    const session = await getSession();
    if (session && ADMIN_ROLES.has(session.role)) {
      activityService.logFromSession(session, {
        action: "business_hours_updated",
        entityType: "business_hours",
        description: `Error al actualizar horarios: ${message}`,
        status: "error",
        errorMessage: message,
        page: "/dashboard/configuracion",
        section: "Configuración / Horarios",
      });
    }

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
