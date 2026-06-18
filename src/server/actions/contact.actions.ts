"use server";

import { contactSchema } from "@/lib/validations";
import { prisma } from "@/lib/prisma";

export async function submitContact(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = contactSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  try {
    await prisma.contactLead.create({ data: parsed.data });
    return { success: true };
  } catch {
    return { error: "Error al enviar el mensaje" };
  }
}
