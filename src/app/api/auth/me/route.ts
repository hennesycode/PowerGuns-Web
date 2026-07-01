import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { authMe } from "@/server/services/auth.service";

export async function GET() {
  const session = await getSession();

  if (!session) {
    // No cookie → visitante normal, no es error
    return NextResponse.json({ authenticated: false, user: null });
  }

  const user = await authMe(session.userId);
  if (!user) {
    const res = NextResponse.json({ authenticated: false, user: null });
    // Token inválido o usuario inactivo → limpiar cookie
    res.cookies.delete("pg_auth_token");
    return res;
  }

  return NextResponse.json({ authenticated: true, user });
}
