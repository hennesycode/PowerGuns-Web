import { prisma } from "@/lib/prisma";
import {
  type BusinessHourData,
  type AvailabilitySlot,
  getDayOfWeek,
  generateSlotsFromBusinessHours,
} from "@/lib/timezone";

const DAY_NAMES = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

type BusinessHourWithSlots = {
  id: string;
  dayOfWeek: number;
  dayName: string;
  isOpen: boolean;
  slots: Array<{
    id: string;
    openTime: string;
    closeTime: string;
    sortOrder: number;
  }>;
};

function serialize(hour: BusinessHourWithSlots) {
  return {
    id: hour.id,
    dayOfWeek: hour.dayOfWeek,
    dayName: hour.dayName,
    isOpen: hour.isOpen,
    slots: hour.slots
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((slot) => ({
        id: slot.id,
        openTime: slot.openTime,
        closeTime: slot.closeTime,
        sortOrder: slot.sortOrder,
      })),
  };
}

export const businessHoursService = {
  async getAll() {
    const hours = await prisma.businessHour.findMany({
      include: { slots: true },
      orderBy: { dayOfWeek: "asc" },
    });
    return hours.map(serialize);
  },

  async getByDayOfWeek(dayOfWeek: number) {
    const hour = await prisma.businessHour.findUnique({
      where: { dayOfWeek },
      include: { slots: { orderBy: { sortOrder: "asc" } } },
    });
    return hour ? serialize(hour) : null;
  },

  async upsert(input: {
    dayOfWeek: number;
    isOpen: boolean;
    slots: Array<{ openTime: string; closeTime: string }>;
  }) {
    const { dayOfWeek, isOpen, slots } = input;
    const dayName = DAY_NAMES[dayOfWeek] ?? `Día ${dayOfWeek}`;

    return prisma.$transaction(async (tx) => {
      const businessHour = await tx.businessHour.upsert({
        where: { dayOfWeek },
        create: {
          dayOfWeek,
          dayName,
          isOpen,
          slots: {
            create: slots.map((slot, index) => ({
              openTime: slot.openTime,
              closeTime: slot.closeTime,
              sortOrder: index,
            })),
          },
        },
        update: {
          dayName,
          isOpen,
        },
        include: { slots: true },
      });

      if (!isOpen) {
        await tx.businessHourSlot.deleteMany({
          where: { businessHourId: businessHour.id },
        });
      } else {
        await tx.businessHourSlot.deleteMany({
          where: { businessHourId: businessHour.id },
        });
        if (slots.length > 0) {
          await tx.businessHourSlot.createMany({
            data: slots.map((slot, index) => ({
              businessHourId: businessHour.id,
              openTime: slot.openTime,
              closeTime: slot.closeTime,
              sortOrder: index,
            })),
          });
        }
      }

      return serialize(
        await tx.businessHour.findUnique({
          where: { dayOfWeek },
          include: { slots: { orderBy: { sortOrder: "asc" } } },
        }) as BusinessHourWithSlots,
      );
    });
  },

  async upsertAll(inputs: Array<{
    dayOfWeek: number;
    isOpen: boolean;
    slots: Array<{ openTime: string; closeTime: string }>;
  }>) {
    for (const input of inputs) {
      await this.upsert(input);
    }
    return this.getAll();
  },

  async getBusinessHourData(dayOfWeek: number): Promise<BusinessHourData | null> {
    const businessHour = await this.getByDayOfWeek(dayOfWeek);
    if (!businessHour) return null;
    return {
      dayOfWeek: businessHour.dayOfWeek,
      dayName: businessHour.dayName,
      isOpen: businessHour.isOpen,
      slots: businessHour.slots.map((slot) => ({
        openTime: slot.openTime,
        closeTime: slot.closeTime,
      })),
    };
  },

  async getAvailability(
    date: string,
    reservedTimes: Set<string>,
  ): Promise<AvailabilitySlot[]> {
    const dayOfWeek = getDayOfWeek(date);
    const businessHours = await this.getBusinessHourData(dayOfWeek);
    return generateSlotsFromBusinessHours(businessHours, date, reservedTimes);
  },

  async isTimeAvailable(date: string, time: string): Promise<boolean> {
    const dayOfWeek = getDayOfWeek(date);
    const businessHours = await this.getBusinessHourData(dayOfWeek);
    if (!businessHours || !businessHours.isOpen) return false;

    const { isTimeWithinBusinessHours } = await import("@/lib/timezone");
    return isTimeWithinBusinessHours(time, businessHours);
  },
};
