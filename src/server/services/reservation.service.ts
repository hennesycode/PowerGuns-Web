import { Prisma } from "@/generated/prisma/client";
import { hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  dateKeyToDate,
  dateToDateKey,
  getSlotLabel,
  isPastSlot,
  isValidDateKey,
  isTimeWithinBusinessHours,
} from "@/lib/timezone";
import { businessHoursService } from "@/server/services/business-hours.service";
import type {
  DashboardReservationInput,
  PublicReservationInput,
  ReservationStatusInput,
  UpdateReservationInput,
} from "@/lib/validations/reservation";

const PAYMENT_PROVIDER_LABELS: Record<string, string> = {
  cash: "Pago en efectivo",
  daviplata: "Daviplata",
  nequi: "Nequi",
  bancolombia: "Bancolombia",
  davivienda: "Davivienda",
  bbva: "BBVA",
};

const BLOCKING_STATUSES: ReservationStatusInput[] = [
  "pending",
  "in_review",
  "confirmed",
];

const SLOT_MINUTES = 30;

type ReservationWithItems = Prisma.ReservationGetPayload<{
  include: { items: true; user: true };
}>;

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function normalizePhone(phone: string) {
  const digits = phone.replace(/\D/g, "").replace(/^57/, "");
  return `+57${digits.slice(0, 10)}`;
}

function serializeReservation(reservation: ReservationWithItems) {
  const date = dateToDateKey(reservation.reservationDate);
  return {
    id: reservation.id,
    reservationCode: reservation.reservationCode,
    userId: reservation.userId,
    firstName: reservation.firstName,
    lastName: reservation.lastName,
    identificationType: reservation.identificationType,
    identificationNumber: reservation.identificationNumber,
    email: reservation.email,
    phone: reservation.phone,
    address: reservation.address,
    country: reservation.country,
    department: reservation.department,
    city: reservation.city,
    reservationDate: date,
    reservationTime: reservation.reservationTime,
    reservationTimeLabel: getSlotLabel(reservation.reservationTime),
    durationHours: reservation.durationHours,
    durationMinutes: reservation.durationMinutes,
    notes: reservation.notes ?? "",
    status: reservation.status,
    subtotal: reservation.subtotal,
    discount: reservation.discount,
    total: reservation.total,
    couponCode: reservation.couponCode,
    paymentMethodLabel: reservation.paymentMethodLabel,
    createdAt: reservation.createdAt.toISOString(),
    updatedAt: reservation.updatedAt.toISOString(),
    services: reservation.items.map((item) => ({
      id: item.id,
      serviceId: item.serviceId,
      serviceTitle: item.serviceTitle,
      serviceSlug: item.serviceSlug,
      imageUrl: item.imageUrl,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      hours: item.hours,
      durationMinutes: item.durationMinutes,
      total: item.total,
    })),
    user: reservation.user
      ? {
          id: reservation.user.id,
          firstName: reservation.user.firstName,
          lastName: reservation.user.lastName,
          email: reservation.user.email,
          identificationNumber: reservation.user.identificationNumber,
          role: reservation.user.role,
        }
      : null,
  };
}

function timeToMinutes(time: string) {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
}

function minutesToTime(minutes: number) {
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function getOccupiedTimes(time: string, durationMinutes = 60) {
  const start = timeToMinutes(time);
  const slots = Math.ceil(durationMinutes / SLOT_MINUTES);
  return Array.from({ length: slots }, (_, index) => minutesToTime(start + index * SLOT_MINUTES));
}

function isTimeRangeWithinBusinessHours(
  time: string,
  durationMinutes: number,
  businessHours: Awaited<ReturnType<typeof businessHoursService.getBusinessHourData>>,
) {
  if (!businessHours || !businessHours.isOpen) return false;
  const start = timeToMinutes(time);
  const end = start + durationMinutes;

  return businessHours.slots.some((block) => {
    const open = timeToMinutes(block.openTime);
    const close = timeToMinutes(block.closeTime);
    return start >= open && end <= close;
  });
}

function intervalsOverlap(startA: number, endA: number, startB: number, endB: number) {
  return startA < endB && startB < endA;
}

async function generateUsername(tx: Prisma.TransactionClient, email: string, identificationNumber: string) {
  const base = email
    .split("@")[0]
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 18) || "cliente";
  const suffix = identificationNumber.replace(/\D/g, "").slice(-4) || Date.now().toString().slice(-4);
  let username = `${base}${suffix}`;
  let attempt = 1;

  while (await tx.user.findUnique({ where: { username } })) {
    attempt += 1;
    username = `${base}${suffix}${attempt}`;
  }

  return username;
}

async function resolveUser(
  tx: Prisma.TransactionClient,
  input: PublicReservationInput | DashboardReservationInput | UpdateReservationInput,
) {
  const email = normalizeEmail(input.email);
  const identificationNumber = input.identificationNumber.trim();

  if ("userId" in input && input.userId) {
    const user = await tx.user.findUnique({ where: { id: input.userId } });
    if (!user) throw new Error("Usuario no encontrado");
    if (normalizeEmail(user.email) !== email) {
      throw new Error("Lo sentimos, esa identificación ya existe con otro correo.");
    }
    if (user.identificationNumber !== identificationNumber) {
      throw new Error("Lo sentimos, ese correo ya existe con otra identificación.");
    }
    return user;
  }

  const existing = await tx.user.findMany({
    where: {
      OR: [{ email }, { identificationNumber }],
    },
  });

  const byEmail = existing.find((user) => user.email === email);
  const byIdentification = existing.find(
    (user) => user.identificationNumber === identificationNumber,
  );

  if (byEmail && byEmail.identificationNumber !== identificationNumber) {
    throw new Error("Lo sentimos, ese correo ya existe con otra identificación.");
  }

  if (byIdentification && byIdentification.email !== email) {
    throw new Error("Lo sentimos, esa identificación ya existe con otro correo.");
  }

  if (byEmail) return byEmail;

  const username = await generateUsername(tx, email, identificationNumber);
  const passwordHash = await hashPassword(`pg-${crypto.randomUUID()}`);

  return tx.user.create({
    data: {
      username,
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      email,
      identificationType: input.identificationType,
      identificationNumber,
      role: "cliente",
      passwordHash,
    },
  });
}

async function resolvePaymentMethod(
  tx: Prisma.TransactionClient,
  input: PublicReservationInput | DashboardReservationInput | UpdateReservationInput,
  required: boolean,
) {
  const activeMethods = await tx.paymentMethod.findMany({ where: { isActive: true } });
  if (activeMethods.length === 0) return null;

  if (!input.paymentMethodId) {
    if (required) throw new Error("Selecciona un método de pago");
    return null;
  }

  const method = activeMethods.find((item) => item.id === input.paymentMethodId);
  if (!method) throw new Error("Método de pago no disponible");

  return PAYMENT_PROVIDER_LABELS[method.provider] ?? method.provider;
}

async function calculateTotals(
  tx: Prisma.TransactionClient,
  input: PublicReservationInput | DashboardReservationInput | UpdateReservationInput,
) {
  const quantities = new Map<number, number>();
  const hoursByService = new Map<number, number>();
  input.items.forEach((item) => {
    quantities.set(item.serviceId, (quantities.get(item.serviceId) ?? 0) + item.quantity);
    hoursByService.set(item.serviceId, Math.max(1, item.hours ?? 1));
  });

  const serviceIds = Array.from(quantities.keys());
  const services = await tx.trainingService.findMany({
    where: { id: { in: serviceIds }, isActive: true },
  });

  if (services.length !== serviceIds.length) {
    throw new Error("Uno o más servicios no están disponibles");
  }

  const items = services.map((service) => {
    const quantity = quantities.get(service.id) ?? 1;
    const hours = hoursByService.get(service.id) ?? 1;
    const unitPrice = Math.round(Number(service.finalPrice));
    const durationMinutes = Math.max(30, service.durationMinutes || 60) * hours;
    return {
      serviceId: service.id,
      serviceTitle: service.name,
      serviceSlug: service.slug,
      imageUrl: service.mainImageUrl,
      unitPrice,
      quantity,
      hours,
      durationMinutes,
      total: unitPrice * quantity * hours,
    };
  });

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  let discount = 0;
  let couponCode: string | null = null;

  const requestedCoupon = input.couponCode?.trim().toUpperCase();
  if (requestedCoupon) {
    const coupon = await tx.coupon.findUnique({ where: { code: requestedCoupon } });
    const now = new Date();
    if (!coupon || !coupon.isActive) throw new Error("Cupón inválido o expirado");
    if (coupon.startsAt && now < coupon.startsAt) throw new Error("Este cupón aún no está vigente");
    if (coupon.expiresAt && now > coupon.expiresAt) throw new Error("Este cupón ha expirado");
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) throw new Error("Cupón agotado");
    if (subtotal < coupon.minimumSubtotal) throw new Error("El subtotal no alcanza el mínimo del cupón");

    discount = coupon.discountType === "percentage"
      ? Math.round(subtotal * (coupon.discountValue / 100))
      : Math.min(coupon.discountValue, subtotal);
    discount = Math.max(0, Math.min(discount, subtotal));
    couponCode = coupon.code;
  }

  return { items, subtotal, discount, total: subtotal - discount, couponCode };
}

async function ensureSlotAvailable(
  tx: Prisma.TransactionClient,
  date: string,
  time: string,
  durationMinutes: number,
  excludeReservationId?: string,
) {
  if (!isValidDateKey(date)) throw new Error("Fecha inválida");
  if (isPastSlot(date, time)) throw new Error("Ese horario ya no está disponible");

  const dayOfWeek = (await import("@/lib/timezone")).getDayOfWeek(date);
  const businessHours = await businessHoursService.getBusinessHourData(dayOfWeek);
  if (!businessHours || !businessHours.isOpen) {
    throw new Error("No hay disponibilidad para este día");
  }
  if (!isTimeWithinBusinessHours(time, businessHours) || !isTimeRangeWithinBusinessHours(time, durationMinutes, businessHours)) {
    throw new Error("Hora inválida o fuera del horario de atención");
  }

  const reserved = await tx.reservation.findMany({
    where: {
      reservationDate: dateKeyToDate(date),
      status: { in: BLOCKING_STATUSES },
      ...(excludeReservationId ? { id: { not: excludeReservationId } } : {}),
    },
    select: { reservationTime: true, durationHours: true, durationMinutes: true },
  });

  const requestedStart = timeToMinutes(time);
  const requestedEnd = requestedStart + durationMinutes;
  const overlapsReserved = reserved.some((reservation) => {
    const reservedStart = timeToMinutes(reservation.reservationTime);
    const reservedDuration = reservation.durationMinutes || reservation.durationHours * 60;
    const reservedEnd = reservedStart + reservedDuration;
    return intervalsOverlap(requestedStart, requestedEnd, reservedStart, reservedEnd);
  });

  if (overlapsReserved) throw new Error("Ese horario ya no está disponible para la duración seleccionada");
}

async function generateReservationCode(tx: Prisma.TransactionClient) {
  let next = (await tx.reservation.count()) + 1;

  while (true) {
    const code = `PG-${String(next).padStart(6, "0")}`;
    const existing = await tx.reservation.findUnique({ where: { reservationCode: code } });
    if (!existing) return code;
    next += 1;
  }
}

export const reservationService = {
  async getAvailability(date: string, excludeReservationId?: string, durationMinutes = 60) {
    if (!isValidDateKey(date)) throw new Error("Fecha inválida");

    const reservations = await prisma.reservation.findMany({
      where: {
        reservationDate: dateKeyToDate(date),
        status: { in: BLOCKING_STATUSES },
        ...(excludeReservationId ? { id: { not: excludeReservationId } } : {}),
      },
      select: { reservationTime: true, durationHours: true, durationMinutes: true },
    });

    const reservedTimes = new Set(reservations.flatMap((reservation) => getOccupiedTimes(reservation.reservationTime, reservation.durationMinutes || reservation.durationHours * 60)));
    const baseSlots = await businessHoursService.getAvailability(date, reservedTimes);
    const dayOfWeek = (await import("@/lib/timezone")).getDayOfWeek(date);
    const businessHours = await businessHoursService.getBusinessHourData(dayOfWeek);
    const slots = baseSlots.map((slot) => {
      if (!slot.available) return slot;
      if (!isTimeRangeWithinBusinessHours(slot.time, durationMinutes, businessHours)) {
        return { ...slot, available: false, reason: "closed" as const };
      }
      const start = timeToMinutes(slot.time);
      const end = start + durationMinutes;
      const overlapsReserved = reservations.some((reservation) => {
        const reservedStart = timeToMinutes(reservation.reservationTime);
        const reservedDuration = reservation.durationMinutes || reservation.durationHours * 60;
        const reservedEnd = reservedStart + reservedDuration;
        return intervalsOverlap(start, end, reservedStart, reservedEnd);
      });
      if (overlapsReserved) return { ...slot, available: false, reason: "reserved" as const };
      return slot;
    });

    if (slots.length === 0) {
      if (!businessHours || !businessHours.isOpen) {
        return { date, slots: [], closed: true };
      }
    }

    return { date, slots };
  },

  async list(filters: { q?: string; status?: string; date?: string }) {
    const q = filters.q?.trim();
    const where: Prisma.ReservationWhereInput = {};

    if (filters.status && filters.status !== "all") {
      where.status = filters.status as ReservationStatusInput;
    }
    if (filters.date) {
      where.reservationDate = dateKeyToDate(filters.date);
    }
    if (q) {
      where.OR = [
        { reservationCode: { contains: q } },
        { firstName: { contains: q } },
        { lastName: { contains: q } },
        { email: { contains: q } },
        { identificationNumber: { contains: q } },
      ];
    }

    const reservations = await prisma.reservation.findMany({
      where,
      include: { items: true, user: true },
      orderBy: [{ reservationDate: "desc" }, { reservationTime: "desc" }, { createdAt: "desc" }],
    });

    return reservations.map(serializeReservation);
  },

  async getById(id: string) {
    const reservation = await prisma.reservation.findUnique({
      where: { id },
      include: { items: true, user: true },
    });
    return reservation ? serializeReservation(reservation) : null;
  },

  async create(input: PublicReservationInput | DashboardReservationInput) {
    return prisma.$transaction(async (tx) => {
      const user = await resolveUser(tx, input);
      const paymentMethodLabel = await resolvePaymentMethod(tx, input, !("status" in input));
      const totals = await calculateTotals(tx, input);
      const durationMinutes = Math.max(30, totals.items.reduce((sum, item) => sum + item.durationMinutes, 0));
      const durationHours = Math.max(1, Math.ceil(durationMinutes / 60));
      await ensureSlotAvailable(tx, input.reservationDate, input.reservationTime, durationMinutes);
      const reservationCode = await generateReservationCode(tx);
      const status = "status" in input ? input.status : "pending";

      const reservation = await tx.reservation.create({
        data: {
          reservationCode,
          userId: user.id,
          firstName: input.firstName.trim(),
          lastName: input.lastName.trim(),
          identificationType: input.identificationType,
          identificationNumber: input.identificationNumber.trim(),
          email: normalizeEmail(input.email),
          phone: normalizePhone(input.phone),
          address: input.address.trim(),
          country: "Colombia",
          department: input.department,
          city: input.city,
          reservationDate: dateKeyToDate(input.reservationDate),
          reservationTime: input.reservationTime,
          durationHours,
          durationMinutes,
          notes: input.scheduleNotes?.trim() || null,
          status,
          subtotal: totals.subtotal,
          discount: totals.discount,
          total: totals.total,
          couponCode: totals.couponCode,
          paymentMethodLabel,
          items: { create: totals.items },
        },
        include: { items: true, user: true },
      });

      if (totals.couponCode) {
        await tx.coupon.update({
          where: { code: totals.couponCode },
          data: { usedCount: { increment: 1 } },
        });
      }

      return serializeReservation(reservation);
    });
  },

  async update(id: string, input: UpdateReservationInput) {
    return prisma.$transaction(async (tx) => {
      const existing = await tx.reservation.findUnique({ where: { id } });
      if (!existing) throw new Error("Reserva no encontrada");

      const user = await resolveUser(tx, input);
      const paymentMethodLabel = await resolvePaymentMethod(tx, input, false);
      const totals = await calculateTotals(tx, input);
      const durationMinutes = Math.max(30, totals.items.reduce((sum, item) => sum + item.durationMinutes, 0));
      const durationHours = Math.max(1, Math.ceil(durationMinutes / 60));
      await ensureSlotAvailable(tx, input.reservationDate, input.reservationTime, durationMinutes, id);

      await tx.reservationItem.deleteMany({ where: { reservationId: id } });
      const reservation = await tx.reservation.update({
        where: { id },
        data: {
          userId: user.id,
          firstName: input.firstName.trim(),
          lastName: input.lastName.trim(),
          identificationType: input.identificationType,
          identificationNumber: input.identificationNumber.trim(),
          email: normalizeEmail(input.email),
          phone: normalizePhone(input.phone),
          address: input.address.trim(),
          country: "Colombia",
          department: input.department,
          city: input.city,
          reservationDate: dateKeyToDate(input.reservationDate),
          reservationTime: input.reservationTime,
          durationHours,
          durationMinutes,
          notes: input.scheduleNotes?.trim() || null,
          status: input.status,
          subtotal: totals.subtotal,
          discount: totals.discount,
          total: totals.total,
          couponCode: totals.couponCode,
          ...(input.paymentMethodId !== undefined ? { paymentMethodLabel } : {}),
          items: { create: totals.items },
        },
        include: { items: true, user: true },
      });

      return serializeReservation(reservation);
    });
  },

  async updateStatus(id: string, status: ReservationStatusInput) {
    const reservation = await prisma.reservation.update({
      where: { id },
      data: { status },
      include: { items: true, user: true },
    });

    return serializeReservation(reservation);
  },

  async delete(id: string) {
    await prisma.reservation.delete({ where: { id } });
  },

  async listUsers(q: string) {
    const search = q.trim();
    const users = await prisma.user.findMany({
      where: search
        ? {
            OR: [
              { firstName: { contains: search } },
              { lastName: { contains: search } },
              { email: { contains: search } },
              { identificationNumber: { contains: search } },
            ],
          }
        : undefined,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        identificationType: true,
        identificationNumber: true,
        role: true,
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    return users;
  },
};
