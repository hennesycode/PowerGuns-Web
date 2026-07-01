import { NextRequest, NextResponse } from "next/server";
import { registerSchema } from "@/lib/validations";
import { authRegister } from "@/server/services/auth.service";
import { setAuthCookie } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rateLimit";

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown";

  const rate = checkRateLimit(`register:${ip}`, 3, 15 * 60 * 1000);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Demasiadas solicitudes. Intente nuevamente más tarde." },
      { status: 429 },
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message || "Datos inválidos";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const result = await authRegister(parsed.data);

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 409 });
  }

  await setAuthCookie(result.token);

  return NextResponse.json({ user: result.user });
}
