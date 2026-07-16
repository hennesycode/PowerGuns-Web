import { NextResponse } from "next/server";
import { contactSchema } from "@/lib/validations";
import { prisma } from "@/lib/prisma";
import { emailService } from "@/server/services/email.service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }
    await prisma.contactLead.create({
      data: {
        name: `${parsed.data.firstName} ${parsed.data.lastName}`,
        phone: `+57${parsed.data.phone}`,
        email: parsed.data.email,
        message: parsed.data.message,
      },
    });

    const admins = await prisma.user.findMany({
      where: { role: "administrador", isActive: true },
      select: { email: true },
    });
    const emailResult = await emailService.sendContactAdminNotification(
      parsed.data,
      admins.map((admin) => admin.email),
    );
    if (!emailResult.success) console.error("[ContactEmail:admin]", emailResult.error);

    return NextResponse.json({ success: true, emailSent: emailResult.success });
  } catch (error) {
    console.error("[POST /api/contact]", error);
    return NextResponse.json({ error: "Error al enviar" }, { status: 500 });
  }
}
