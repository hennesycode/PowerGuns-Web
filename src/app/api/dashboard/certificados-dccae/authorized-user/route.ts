import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { certificateAuthorizedUserSchema } from "@/lib/validations/certificados-dccae";
import { activityService } from "@/server/services/activity.service";
import { certificadosDccaeService } from "@/server/services/certificados-dccae.service";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const user = await certificadosDccaeService.getAuthorizedUser();
    return NextResponse.json({ user });
  } catch (error) {
    console.error("[GET /api/dashboard/certificados-dccae/authorized-user]", error);
    return NextResponse.json({ error: "Error al obtener usuario autorizado" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const body = await request.json();
    const validation = certificateAuthorizedUserSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues.map((issue) => issue.message).join(", ") },
        { status: 400 },
      );
    }

    const user = await certificadosDccaeService.upsertAuthorizedUser(validation.data);
    activityService.logFromSession(session, {
      action: "certificate_authorized_user_saved",
      entityType: "certificate_dccae_authorized_user",
      entityId: user.id,
      entityName: user.username,
      description: `Usuario autorizado DCCAE "${user.username}" configurado`,
      page: "/dashboard/certificados-dccae",
      section: "Certificados DCCAE",
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error("[PUT /api/dashboard/certificados-dccae/authorized-user]", error);
    const message = error instanceof Error ? error.message : "Error al guardar usuario autorizado";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
