import { prisma } from "@/lib/prisma";

export const bookingService = {
  async create(data: {
    name: string;
    phone: string;
    email: string;
    serviceId: number;
    packageId: number;
    date: string;
    timeSlot: string;
    persons: number;
    notes: string;
  }) {
    let customer = await prisma.customer.findFirst({
      where: { phone: data.phone },
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          name: data.name,
          phone: data.phone,
          email: data.email || null,
        },
      });
    }

    const booking = await prisma.booking.create({
      data: {
        customerId: customer.id,
        serviceId: data.serviceId,
        packageId: data.packageId,
        date: new Date(data.date),
        startTime: data.timeSlot.split("-")[0],
        persons: data.persons,
        notes: data.notes || null,
        status: "PENDING_VALIDATION",
        accepted: true,
      },
    });

    return booking;
  },
};
