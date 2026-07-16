"use server";

import { contactSchema } from "@/lib/validations";
import { prisma } from "@/lib/prisma";

export async function submitContact(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const acceptedPrivacy = String(raw.acceptedPrivacy ?? "");
  const data = {
    ...raw,
    acceptedPrivacy: acceptedPrivacy === "on" || acceptedPrivacy === "true",
  };
  const parsed = contactSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  try {
    await prisma.contactLead.create({
      data: {
        name: `${parsed.data.firstName} ${parsed.data.lastName}`,
        phone: `+57${parsed.data.phone}`,
        email: parsed.data.email,
        message: parsed.data.message,
      },
    });
    return { success: true };
  } catch {
    return { error: "Error al enviar el mensaje" };
  }
}
