import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { adminUpdateUserSchema } from "@/lib/validations";
import { activityService } from "@/server/services/activity.service";
import { userService } from "@/server/services/user.service";

function unauthorized() {
  return NextResponse.json({ error: "No autorizado" }, { status: 401 });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  try {
    if (!session || session.role !== "administrador") return unauthorized();

    const { id } = await params;
    const userId = Number(id);
    if (!Number.isInteger(userId) || userId <= 0) {
      return NextResponse.json({ error: "Usuario inválido" }, { status: 400 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }

    const parsed = adminUpdateUserSchema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message || "Datos inválidos";
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const updated = await userService.update(userId, parsed.data);

    activityService.logFromSession(session, {
      action: "user_updated",
      entityType: "user",
      entityId: String(updated.id),
      entityName: `${updated.firstName} ${updated.lastName}`,
      description: `Usuario "${updated.firstName} ${updated.lastName}" actualizado`,
      status: "success",
      page: "/dashboard/usuarios",
      section: "Usuarios",
      metadata: {
        username: updated.username,
        email: updated.email,
        role: updated.role,
        isActive: updated.isActive,
        passwordChanged: Boolean(parsed.data.password?.trim()),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[PUT /api/dashboard/users/[id]]", error);
    const message = error instanceof Error ? error.message : "Error al actualizar usuario";
    const status = message.includes("no encontrado") ? 404 : message.includes("registrado") || message.includes("uso") ? 409 : 500;

    if (session) {
      activityService.logFromSession(session, {
        action: "user_updated",
        entityType: "user",
        description: `Error al actualizar usuario: ${message}`,
        status: "error",
        errorMessage: message,
        page: "/dashboard/usuarios",
        section: "Usuarios",
      });
    }

    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  try {
    if (!session || session.role !== "administrador") return unauthorized();

    const { id } = await params;
    const userId = Number(id);
    if (!Number.isInteger(userId) || userId <= 0) {
      return NextResponse.json({ error: "Usuario inválido" }, { status: 400 });
    }

    const deleted = await userService.delete(userId, session.userId);
    const fullName = `${deleted.firstName} ${deleted.lastName}`;

    activityService.logFromSession(session, {
      action: "user_deleted",
      entityType: "user",
      entityId: String(deleted.id),
      entityName: fullName,
      description: `Usuario "${fullName}" eliminado`,
      status: "success",
      page: "/dashboard/usuarios",
      section: "Usuarios",
      metadata: { username: deleted.username, role: deleted.role },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/dashboard/users/[id]]", error);
    const message = error instanceof Error ? error.message : "Error al eliminar usuario";
    const status = message.includes("no encontrado") ? 404 : 500;

    if (session) {
      activityService.logFromSession(session, {
        action: "user_deleted",
        entityType: "user",
        description: `Error al eliminar usuario: ${message}`,
        status: "error",
        errorMessage: message,
        page: "/dashboard/usuarios",
        section: "Usuarios",
      });
    }

    return NextResponse.json({ error: message }, { status });
  }
}
