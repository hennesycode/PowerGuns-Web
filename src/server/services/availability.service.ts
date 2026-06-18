import { prisma } from "@/lib/prisma";

export const availabilityService = {
  async getSlots(date: string) {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const slots = await prisma.availabilitySlot.findMany({
      where: { date: { gte: dayStart, lte: dayEnd } },
      orderBy: { startTime: "asc" },
    });

    return slots.map((s) => ({
      id: s.id,
      startTime: s.startTime,
      endTime: s.endTime,
      slots: s.slots,
    }));
  },
};
