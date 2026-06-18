import { NextResponse } from "next/server";
import { contactSchema } from "@/lib/validations";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }
    await prisma.contactLead.create({ data: parsed.data });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Error al enviar" }, { status: 500 });
  }
}
