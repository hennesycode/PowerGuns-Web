import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const AUTH_SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "powerguns-dev-secret-change-in-production",
);

const AUTH_COOKIE_NAME = "pg_auth_token";
const DCCAE_AUTH_COOKIE_NAME = "pg_dccae_cert_token";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/certificados-dccae/consulta")) {
    const token = request.cookies.get(DCCAE_AUTH_COOKIE_NAME)?.value;
    if (!token) {
      const loginUrl = new URL("/certificados-dccae/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const { payload } = await jwtVerify(token, AUTH_SECRET);
      if (payload.scope !== "dccae_certificates") throw new Error("Invalid scope");
      return NextResponse.next();
    } catch {
      const loginUrl = new URL("/certificados-dccae/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete(DCCAE_AUTH_COOKIE_NAME);
      return response;
    }
  }

  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    await jwtVerify(token, AUTH_SECRET);
    return NextResponse.next();
  } catch {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete(AUTH_COOKIE_NAME);
    return response;
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/certificados-dccae/consulta/:path*", "/certificados-dccae/consulta"],
};
