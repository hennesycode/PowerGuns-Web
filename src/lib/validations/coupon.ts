import { z } from "zod/v4";

export const couponSchema = z.object({
  code: z.string().trim().min(3, "Código mínimo 3 caracteres").max(40, "Código máximo 40 caracteres").regex(/^[A-Z0-9_-]+$/, "Solo mayúsculas, números, guion y guion bajo"),
  discountType: z.enum(["percentage", "fixed"]),
  discountValue: z.coerce.number().int().positive("Ingresa un descuento válido"),
  isActive: z.boolean().default(true),
  startsAt: z.string().trim().optional().nullable(),
  expiresAt: z.string().trim().optional().nullable(),
  maxUses: z.coerce.number().int().positive().optional().nullable(),
  perCustomerLimit: z.coerce.number().int().positive().optional().nullable(),
  assignedUserId: z.coerce.number().int().positive().optional().nullable(),
  minimumSubtotal: z.coerce.number().int().min(0).optional().default(0),
}).superRefine((data, ctx) => {
  if (data.discountType === "percentage" && data.discountValue > 100) {
    ctx.addIssue({ code: "custom", path: ["discountValue"], message: "El porcentaje máximo es 100" });
  }
  if (data.startsAt && data.expiresAt && new Date(data.startsAt) > new Date(data.expiresAt)) {
    ctx.addIssue({ code: "custom", path: ["expiresAt"], message: "La fecha final debe ser posterior al inicio" });
  }
});

export type CouponInput = z.infer<typeof couponSchema>;
