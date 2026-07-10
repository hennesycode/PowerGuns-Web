import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { adminCreateUserSchema } from "@/lib/validations";
import { activityService } from "@/server/services/activity.service";
import { userService } from "@/server/services/user.service";

function unauthorized() {
  return NextResponse.json({ error: "No autorizado" }, { status: 401 });
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "administrador") return unauthorized();

    const users = await userService.list();
    return NextResponse.json(users);
  } catch (error) {
    console.error("[GET /api/dashboard/users]", error);
    return NextResponse.json({ error: "Error al obtener usuarios" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  try {
    if (!session || session.role !== "administrador") return unauthorized();

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }

    const parsed = adminCreateUserSchema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message || "Datos inválidos";
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const user = await userService.create(parsed.data);

    activityService.logFromSession(session, {
      action: "user_created",
      entityType: "user",
      entityId: String(user.id),
      entityName: `${user.firstName} ${user.lastName}`,
      description: `Usuario "${user.firstName} ${user.lastName}" creado con rol ${user.role}`,
      status: "success",
      page: "/dashboard/usuarios",
      section: "Usuarios",
      metadata: { username: user.username, email: user.email, role: user.role, isActive: user.isActive },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("[POST /api/dashboard/users]", error);
    const message = error instanceof Error ? error.message : "Error al crear usuario";
    const status = message.includes("registrado") || message.includes("uso") ? 409 : 500;

    if (session) {
      activityService.logFromSession(session, {
        action: "user_created",
        entityType: "user",
        description: `Error al crear usuario: ${message}`,
        status: "error",
        errorMessage: message,
        page: "/dashboard/usuarios",
        section: "Usuarios",
      });
    }

    return NextResponse.json({ error: message }, { status });
  }
}
