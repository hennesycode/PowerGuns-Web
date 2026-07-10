import { NextResponse } from "next/server";
import { deleteDccaeAuthCookie } from "@/lib/dccae-auth";

export async function POST() {
  await deleteDccaeAuthCookie();
  return NextResponse.json({ ok: true });
}
