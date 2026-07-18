import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type { CouponInput } from "@/lib/validations/coupon";

type CouponWithRelations = Prisma.CouponGetPayload<{
  include: { assignedUser: true; redemptions: true };
}>;

type CouponUser = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
};

function normalizeCode(code: string) {
  return code.trim().toUpperCase();
}

function parseDate(value?: string | null) {
  return value ? new Date(value) : null;
}

function getStatus(coupon: { isActive: boolean; startsAt: Date | null; expiresAt: Date | null; maxUses: number | null; usedCount: number }) {
  const now = new Date();
  if (!coupon.isActive) return "inactive";
  if (coupon.startsAt && now < coupon.startsAt) return "scheduled";
  if (coupon.expiresAt && now > coupon.expiresAt) return "expired";
  if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) return "exhausted";
  return "active";
}

function getDiscountAmount(coupon: { discountType: string; discountValue: number }, subtotal: number) {
  const discount = coupon.discountType === "percentage"
    ? Math.round(subtotal * (coupon.discountValue / 100))
    : Math.min(coupon.discountValue, subtotal);
  return Math.max(0, Math.min(discount, subtotal));
}

function serialize(coupon: CouponWithRelations) {
  const status = getStatus(coupon);
  return {
    id: coupon.id,
    code: coupon.code,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    isActive: coupon.isActive,
    status,
    startsAt: coupon.startsAt?.toISOString() ?? null,
    expiresAt: coupon.expiresAt?.toISOString() ?? null,
    maxUses: coupon.maxUses,
    perCustomerLimit: coupon.perCustomerLimit,
    assignedUser: coupon.assignedUser ? {
      id: coupon.assignedUser.id,
      firstName: coupon.assignedUser.firstName,
      lastName: coupon.assignedUser.lastName,
      email: coupon.assignedUser.email,
      identificationNumber: coupon.assignedUser.identificationNumber,
    } : null,
    usedCount: coupon.usedCount,
    minimumSubtotal: coupon.minimumSubtotal,
    createdAt: coupon.createdAt.toISOString(),
    updatedAt: coupon.updatedAt.toISOString(),
    redemptions: coupon.redemptions.map((redemption) => ({
      id: redemption.id,
      reservationId: redemption.reservationId,
      userId: redemption.userId,
      customerName: redemption.customerName,
      customerEmail: redemption.customerEmail,
      subtotal: redemption.subtotal,
      discountAmount: redemption.discountAmount,
      total: redemption.total,
      createdAt: redemption.createdAt.toISOString(),
    })),
  };
}

export const couponService = {
  async list() {
    const coupons = await prisma.coupon.findMany({
      include: { assignedUser: true, redemptions: { orderBy: { createdAt: "desc" } } },
      orderBy: { createdAt: "desc" },
    });
    return coupons.map(serialize);
  },

  async getById(id: string) {
    const coupon = await prisma.coupon.findUnique({
      where: { id },
      include: { assignedUser: true, redemptions: { orderBy: { createdAt: "desc" } } },
    });
    return coupon ? serialize(coupon) : null;
  },

  async create(input: CouponInput) {
    const coupon = await prisma.coupon.create({
      data: {
        code: normalizeCode(input.code),
        discountType: input.discountType,
        discountValue: input.discountValue,
        isActive: input.isActive,
        startsAt: parseDate(input.startsAt),
        expiresAt: parseDate(input.expiresAt),
        maxUses: input.maxUses ?? null,
        perCustomerLimit: input.perCustomerLimit ?? null,
        assignedUserId: input.assignedUserId ?? null,
        minimumSubtotal: input.minimumSubtotal ?? 0,
      },
      include: { assignedUser: true, redemptions: true },
    });
    return serialize(coupon);
  },

  async updateStatus(id: string, isActive: boolean) {
    const coupon = await prisma.coupon.update({
      where: { id },
      data: { isActive },
      include: { assignedUser: true, redemptions: { orderBy: { createdAt: "desc" } } },
    });
    return serialize(coupon);
  },

  async validate(code: string, subtotal: number, user?: CouponUser | null, options?: { skipCustomerRules?: boolean }) {
    const coupon = await prisma.coupon.findUnique({
      where: { code: normalizeCode(code) },
      include: { assignedUser: true, redemptions: true },
    });

    if (!coupon) return { valid: false as const, message: "Cupón no válido" };
    if (!coupon.isActive) return { valid: false as const, message: "Cupón inactivo" };

    const now = new Date();
    if (coupon.startsAt && now < coupon.startsAt) return { valid: false as const, message: "Este cupón aún no está vigente" };
    if (coupon.expiresAt && now > coupon.expiresAt) return { valid: false as const, message: "Cupón vencido" };
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) return { valid: false as const, message: "Cupón agotado" };
    if (subtotal < coupon.minimumSubtotal) return { valid: false as const, message: "El subtotal no alcanza el mínimo del cupón" };

    if (coupon.assignedUserId && !options?.skipCustomerRules) {
      if (!user || user.id !== coupon.assignedUserId) return { valid: false as const, message: "Este cupón está asignado a otro cliente" };
    }

    if (coupon.perCustomerLimit && user && !options?.skipCustomerRules) {
      const customerUses = coupon.redemptions.filter((redemption) => redemption.userId === user.id || redemption.customerEmail === user.email).length;
      if (customerUses >= coupon.perCustomerLimit) return { valid: false as const, message: "Este cliente ya alcanzó el límite de uso del cupón" };
    }

    const discountAmount = getDiscountAmount(coupon, subtotal);
    return {
      valid: true as const,
      coupon,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount,
      message: "Cupón aplicado exitosamente",
    };
  },

  async registerRedemption(tx: Prisma.TransactionClient, input: {
    couponId: string;
    reservationId: string;
    userId: number | null;
    customerName: string;
    customerEmail: string;
    subtotal: number;
    discountAmount: number;
    total: number;
  }) {
    await tx.couponRedemption.create({ data: input });
    await tx.coupon.update({ where: { id: input.couponId }, data: { usedCount: { increment: 1 } } });
  },
};
