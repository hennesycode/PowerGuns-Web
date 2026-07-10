"use server";

import { bookingSchema } from "@/lib/validations";
import { bookingService } from "@/server/services/booking.service";

export async function createBooking(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const data = {
    ...raw,
    serviceId: parseInt(raw.serviceId as string),
    packageId: parseInt(raw.packageId as string),
    persons: parseInt(raw.persons as string),
    acceptedTerms: raw.acceptedTerms === "on",
  };

  const parsed = bookingSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  try {
    const booking = await bookingService.create(parsed.data);
    return { success: true, bookingId: booking.id };
  } catch {
    return { error: "Error al crear la reserva" };
  }
}
