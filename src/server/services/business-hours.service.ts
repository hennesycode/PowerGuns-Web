import { prisma } from "@/lib/prisma";
import {
  type BusinessHourData,
  type AvailabilitySlot,
  getDayOfWeek,
  generateSlotsFromBusinessHours,
} from "@/lib/timezone";
import { getColombiaNow, isValidDateKey } from "@/lib/timezone";

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

  async getBusinessHourDataForDate(date: string): Promise<BusinessHourData | null> {
    const override = await prisma.businessHourOverride.findUnique({
      where: { dateKey: date },
      include: { slots: { orderBy: { sortOrder: "asc" } } },
    });
    if (override?.isActive) {
      return {
        dayOfWeek: getDayOfWeek(date),
        dayName: date,
        isOpen: override.isOpen,
        slots: override.slots.map(({ openTime, closeTime }) => ({ openTime, closeTime })),
      };
    }
    return this.getBusinessHourData(getDayOfWeek(date));
  },

  async listOverrides() {
    return prisma.businessHourOverride.findMany({
      include: {
        slots: { orderBy: { sortOrder: "asc" } },
        history: { orderBy: { createdAt: "desc" } },
      },
      orderBy: [{ dateKey: "desc" }, { updatedAt: "desc" }],
      take: 100,
    });
  },

  async getPublicOverrides(from: string, to: string) {
    if (!isValidDateKey(from) || !isValidDateKey(to) || from > to) {
      throw new Error("Rango de fechas inválido");
    }
    const overrides = await prisma.businessHourOverride.findMany({
      where: { dateKey: { gte: from, lte: to }, isActive: true },
      include: { slots: { orderBy: { sortOrder: "asc" } } },
      orderBy: { dateKey: "asc" },
    });
    return overrides.map((override) => ({
      dateKey: override.dateKey,
      isOpen: override.isOpen,
      slots: override.slots.map(({ openTime, closeTime }) => ({ openTime, closeTime })),
    }));
  },

  async saveOverride(input: {
    dateKey: string;
    isOpen: boolean;
    reason: string;
    slots: Array<{ openTime: string; closeTime: string }>;
    changedBy: string;
  }) {
    const { dateKey, isOpen, reason, slots, changedBy } = input;
    if (!isValidDateKey(dateKey) || dateKey < getColombiaNow().date) {
      throw new Error("Selecciona una fecha válida que no haya pasado");
    }
    return prisma.$transaction(async (tx) => {
      const existing = await tx.businessHourOverride.findUnique({ where: { dateKey } });
      const action = !existing ? "created" : existing.isActive ? "updated" : "reactivated";
      const override = await tx.businessHourOverride.upsert({
        where: { dateKey },
        create: { dateKey, isOpen, reason, createdBy: changedBy },
        update: { isOpen, isActive: true, reason, updatedBy: changedBy },
      });
      await tx.businessHourOverrideSlot.deleteMany({ where: { overrideId: override.id } });
      if (isOpen && slots.length) {
        await tx.businessHourOverrideSlot.createMany({
          data: slots.map((slot, sortOrder) => ({ ...slot, overrideId: override.id, sortOrder })),
        });
      }
      await tx.businessHourOverrideHistory.create({
        data: {
          overrideId: override.id,
          action,
          reason,
          isOpen,
          slotsJson: JSON.stringify(isOpen ? slots : []),
          changedBy,
        },
      });
      return tx.businessHourOverride.findUniqueOrThrow({
        where: { id: override.id },
        include: { slots: { orderBy: { sortOrder: "asc" } }, history: { orderBy: { createdAt: "desc" } } },
      });
    });
  },

  async deactivateOverride(id: string, changedBy: string) {
    return prisma.$transaction(async (tx) => {
      const override = await tx.businessHourOverride.findUnique({
        where: { id },
        include: { slots: { orderBy: { sortOrder: "asc" } } },
      });
      if (!override || !override.isActive) throw new Error("La excepción ya no está activa");
      await tx.businessHourOverride.update({ where: { id }, data: { isActive: false, updatedBy: changedBy } });
      await tx.businessHourOverrideHistory.create({
        data: {
          overrideId: id,
          action: "cancelled",
          reason: override.reason,
          isOpen: override.isOpen,
          slotsJson: JSON.stringify(override.slots.map(({ openTime, closeTime }) => ({ openTime, closeTime }))),
          changedBy,
        },
      });
    });
  },

  async getAvailability(
    date: string,
    reservedTimes: Set<string>,
  ): Promise<AvailabilitySlot[]> {
    const businessHours = await this.getBusinessHourDataForDate(date);
    return generateSlotsFromBusinessHours(businessHours, date, reservedTimes);
  },

  async isTimeAvailable(date: string, time: string): Promise<boolean> {
    const businessHours = await this.getBusinessHourDataForDate(date);
    if (!businessHours || !businessHours.isOpen) return false;

    const { isTimeWithinBusinessHours } = await import("@/lib/timezone");
    return isTimeWithinBusinessHours(time, businessHours);
  },
};
