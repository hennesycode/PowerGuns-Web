import { NextRequest, NextResponse } from "next/server";
import { loginSchema } from "@/lib/validations";
import { authLogin } from "@/server/services/auth.service";
import { setAuthCookie } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rateLimit";

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown";

  const rate = checkRateLimit(`login:${ip}`);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Demasiados intentos. Intente nuevamente en 15 minutos." },
      { status: 429 },
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Datos inválidos" },
      { status: 400 },
    );
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Todos los campos son obligatorios" },
      { status: 400 },
    );
  }

  const result = await authLogin({
    email: parsed.data.email,
    password: parsed.data.password,
    ipAddress: ip,
  });

  if ("error" in result) {
    return NextResponse.json(
      { error: result.error },
      { status: 401 },
    );
  }

  await setAuthCookie(result.token);

  return NextResponse.json({ user: result.user });
}
