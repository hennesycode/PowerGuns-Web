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

const BLOCKING_STATUSES: ReservationStatusInput[] = [
  "pending",
  "in_review",
  "confirmed",
];

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
    notes: reservation.notes ?? "",
    status: reservation.status,
    subtotal: reservation.subtotal,
    discount: reservation.discount,
    total: reservation.total,
    couponCode: reservation.couponCode,
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

async function calculateTotals(
  tx: Prisma.TransactionClient,
  input: PublicReservationInput | DashboardReservationInput | UpdateReservationInput,
) {
  const quantities = new Map<number, number>();
  input.items.forEach((item) => {
    quantities.set(item.serviceId, (quantities.get(item.serviceId) ?? 0) + item.quantity);
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
    const unitPrice = Math.round(Number(service.finalPrice));
    return {
      serviceId: service.id,
      serviceTitle: service.name,
      serviceSlug: service.slug,
      imageUrl: service.mainImageUrl,
      unitPrice,
      quantity,
      total: unitPrice * quantity,
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
  excludeReservationId?: string,
) {
  if (!isValidDateKey(date)) throw new Error("Fecha inválida");
  if (isPastSlot(date, time)) throw new Error("Ese horario ya no está disponible");

  const dayOfWeek = (await import("@/lib/timezone")).getDayOfWeek(date);
  const businessHours = await businessHoursService.getBusinessHourData(dayOfWeek);
  if (!businessHours || !businessHours.isOpen) {
    throw new Error("No hay disponibilidad para este día");
  }
  if (!isTimeWithinBusinessHours(time, businessHours)) {
    throw new Error("Hora inválida o fuera del horario de atención");
  }

  const reserved = await tx.reservation.findFirst({
    where: {
      reservationDate: dateKeyToDate(date),
      reservationTime: time,
      status: { in: BLOCKING_STATUSES },
      ...(excludeReservationId ? { id: { not: excludeReservationId } } : {}),
    },
  });

  if (reserved) throw new Error("Ese horario ya no está disponible");
}

async function generateReservationCode(tx: Prisma.TransactionClient) {
  const count = await tx.reservation.count();
  return `PG-${String(count + 1).padStart(6, "0")}`;
}

export const reservationService = {
  async getAvailability(date: string, excludeReservationId?: string) {
    if (!isValidDateKey(date)) throw new Error("Fecha inválida");

    const reservations = await prisma.reservation.findMany({
      where: {
        reservationDate: dateKeyToDate(date),
        status: { in: BLOCKING_STATUSES },
        ...(excludeReservationId ? { id: { not: excludeReservationId } } : {}),
      },
      select: { reservationTime: true },
    });

    const reservedTimes = new Set(reservations.map((reservation) => reservation.reservationTime));
    const slots = await businessHoursService.getAvailability(date, reservedTimes);

    if (slots.length === 0) {
      const dayOfWeek = (await import("@/lib/timezone")).getDayOfWeek(date);
      const businessHours = await businessHoursService.getBusinessHourData(dayOfWeek);
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
      await ensureSlotAvailable(tx, input.reservationDate, input.reservationTime);
      const user = await resolveUser(tx, input);
      const totals = await calculateTotals(tx, input);
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
          notes: input.scheduleNotes?.trim() || null,
          status,
          subtotal: totals.subtotal,
          discount: totals.discount,
          total: totals.total,
          couponCode: totals.couponCode,
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

      await ensureSlotAvailable(tx, input.reservationDate, input.reservationTime, id);
      const user = await resolveUser(tx, input);
      const totals = await calculateTotals(tx, input);

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
          notes: input.scheduleNotes?.trim() || null,
          status: input.status,
          subtotal: totals.subtotal,
          discount: totals.discount,
          total: totals.total,
          couponCode: totals.couponCode,
          items: { create: totals.items },
        },
        include: { items: true, user: true },
      });

      return serializeReservation(reservation);
    });
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
