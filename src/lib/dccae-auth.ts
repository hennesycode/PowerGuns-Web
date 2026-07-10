import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const AUTH_SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "powerguns-dev-secret-change-in-production",
);

export const DCCAE_AUTH_COOKIE_NAME = "pg_dccae_cert_token";
const JWT_EXPIRY = "8h";

export interface DccaeAuthPayload {
  authorizedUserId: string;
  username: string;
  scope: "dccae_certificates";
}

export async function createDccaeToken(payload: DccaeAuthPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRY)
    .sign(AUTH_SECRET);
}

export async function verifyDccaeToken(token: string): Promise<DccaeAuthPayload | null> {
  try {
    const { payload } = await jwtVerify(token, AUTH_SECRET);
    if (payload.scope !== "dccae_certificates") return null;
    return payload as unknown as DccaeAuthPayload;
  } catch {
    return null;
  }
}

export async function setDccaeAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(DCCAE_AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}

export async function deleteDccaeAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(DCCAE_AUTH_COOKIE_NAME);
}

export async function getDccaeSession(): Promise<DccaeAuthPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(DCCAE_AUTH_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyDccaeToken(token);
}
