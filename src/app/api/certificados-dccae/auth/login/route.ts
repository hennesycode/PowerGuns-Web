import { NextResponse } from "next/server";
import { setDccaeAuthCookie } from "@/lib/dccae-auth";
import { certificateAuthorizedLoginSchema } from "@/lib/validations/certificados-dccae";
import { checkRateLimit } from "@/lib/rateLimit";
import { certificadosDccaeService } from "@/server/services/certificados-dccae.service";

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const rate = checkRateLimit(`dccae-login:${ip}`);
  if (!rate.allowed) {
    return NextResponse.json({ error: "Demasiados intentos. Intente nuevamente en 15 minutos." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const validation = certificateAuthorizedLoginSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json({ error: "Usuario y contraseña son obligatorios" }, { status: 400 });
  }

  const result = await certificadosDccaeService.loginAuthorizedUser(validation.data);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 401 });
  }

  await setDccaeAuthCookie(result.token);
  return NextResponse.json({ user: result.user });
}
