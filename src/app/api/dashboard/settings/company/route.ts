import { NextResponse } from "next/server";
import { z } from "zod/v4";
import { getSession } from "@/lib/auth";
import { activityService } from "@/server/services/activity.service";
import { companySettingsService } from "@/server/services/company-settings.service";

const ADMIN_ROLES = new Set(["administrador", "editor", "finanzas"]);

const companySettingsSchema = z.object({
  companyName: z.string().trim().min(1, "Ingresa el nombre de la empresa").max(120, "El nombre es demasiado largo"),
  contactPhone: z.string().trim().min(1, "Ingresa el número de contacto").max(40, "El número de contacto es demasiado largo"),
  companyEmail: z.string().trim().min(1, "Ingresa el correo de empresa").email("Correo de empresa inválido").max(160, "El correo es demasiado largo"),
});

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !ADMIN_ROLES.has(session.role)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const company = await companySettingsService.get();
    return NextResponse.json({ company });
  } catch (error) {
    console.error("[GET /api/dashboard/settings/company]", error);
    return NextResponse.json({ error: "Error al obtener datos de empresa" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session || !ADMIN_ROLES.has(session.role)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const validation = companySettingsSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0]?.message ?? "Datos inválidos" }, { status: 400 });
    }

    const company = await companySettingsService.upsert(validation.data);

    activityService.logFromSession(session, {
      action: "company_settings_updated",
      entityType: "company_settings",
      entityName: company.companyName,
      description: `Datos de empresa actualizados: ${company.companyName}`,
      status: "success",
      page: "/dashboard/configuracion",
      section: "Configuración / Empresa",
      metadata: { contactPhone: company.contactPhone, companyEmail: company.companyEmail },
    });

    return NextResponse.json({ company });
  } catch (error) {
    const session = await getSession();
    const message = error instanceof Error ? error.message : "No se pudieron guardar los datos de empresa";
    if (session && ADMIN_ROLES.has(session.role)) {
      activityService.logFromSession(session, {
        action: "company_settings_updated",
        entityType: "company_settings",
        description: "Error al actualizar datos de empresa",
        status: "error",
        errorMessage: message,
        page: "/dashboard/configuracion",
        section: "Configuración / Empresa",
      });
    }
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
