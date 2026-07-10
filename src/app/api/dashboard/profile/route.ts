import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { profilePasswordSchema, profileUpdateSchema } from "@/lib/validations";
import { activityService } from "@/server/services/activity.service";
import { userService } from "@/server/services/user.service";

function unauthorized() {
  return NextResponse.json({ error: "No autorizado" }, { status: 401 });
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    const user = await userService.getProfile(session.userId);
    return NextResponse.json(user);
  } catch (error) {
    console.error("[GET /api/dashboard/profile]", error);
    const message = error instanceof Error ? error.message : "Error al obtener perfil";
    const status = message.includes("no encontrado") ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PUT(request: Request) {
  const session = await getSession();
  try {
    if (!session) return unauthorized();

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }

    const parsed = profileUpdateSchema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message || "Datos inválidos";
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const updated = await userService.updateProfile(session.userId, parsed.data);

    activityService.logFromSession(session, {
      action: "profile_updated",
      entityType: "user",
      entityId: String(updated.id),
      entityName: `${updated.firstName} ${updated.lastName}`,
      description: "Perfil de usuario actualizado",
      status: "success",
      page: "/dashboard/perfil",
      section: "Perfil",
      metadata: { email: updated.email, identificationNumber: updated.identificationNumber },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[PUT /api/dashboard/profile]", error);
    const message = error instanceof Error ? error.message : "Error al actualizar perfil";
    const status = message.includes("no encontrado") ? 404 : message.includes("registrado") || message.includes("uso") ? 409 : 500;

    if (session) {
      activityService.logFromSession(session, {
        action: "profile_updated",
        entityType: "user",
        description: `Error al actualizar perfil: ${message}`,
        status: "error",
        errorMessage: message,
        page: "/dashboard/perfil",
        section: "Perfil",
      });
    }

    return NextResponse.json({ error: message }, { status });
  }
}

export async function PATCH(request: Request) {
  const session = await getSession();
  try {
    if (!session) return unauthorized();

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }

    const parsed = profilePasswordSchema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message || "Datos inválidos";
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    await userService.updateOwnPassword(session.userId, parsed.data);

    activityService.logFromSession(session, {
      action: "profile_password_updated",
      entityType: "user",
      description: "Contraseña de usuario actualizada",
      status: "success",
      page: "/dashboard/perfil",
      section: "Perfil",
    });

    const res = NextResponse.json({ success: true });
    res.cookies.delete("pg_auth_token");
    return res;
  } catch (error) {
    console.error("[PATCH /api/dashboard/profile]", error);
    const message = error instanceof Error ? error.message : "Error al actualizar contraseña";
    const status = message.includes("no encontrado") ? 404 : message.includes("actual") ? 400 : 500;

    if (session) {
      activityService.logFromSession(session, {
        action: "profile_password_updated",
        entityType: "user",
        description: `Error al actualizar contraseña: ${message}`,
        status: "error",
        errorMessage: message,
        page: "/dashboard/perfil",
        section: "Perfil",
      });
    }

    return NextResponse.json({ error: message }, { status });
  }
}
