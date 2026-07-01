import { z } from "zod/v4";

export const discountTypeEnum = z.enum(["none", "percentage", "fixed"]);

export const createServiceSchema = z.object({
  name: z
    .string()
    .min(3, "El nombre debe tener al menos 3 caracteres"),
  title: z
    .string()
    .min(3, "El título debe tener al menos 3 caracteres"),
  slug: z
    .string()
    .min(1, "El slug es requerido")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug inválido: solo minúsculas, números y guiones",
    ),
  shortDescription: z
    .string()
    .max(180, "La descripción corta no puede superar 180 caracteres"),
  longDescription: z
    .string()
    .min(20, "La descripción larga debe tener al menos 20 caracteres"),
  seoTitle: z.string().max(60, "SEO title no puede superar 60 caracteres").optional(),
  seoDescription: z.string().max(160, "SEO description no puede superar 160 caracteres").optional(),
  seoKeywords: z.string().optional(),
  tags: z.string().optional(),
  price: z.number().min(0, "El precio debe ser mayor o igual a 0"),
  discountType: discountTypeEnum.optional().default("none"),
  discountValue: z.number().min(0, "El descuento debe ser mayor o igual a 0").optional(),
  durationMinutes: z.number().int().min(1, "La duración debe ser al menos 1 minuto"),
  includes: z.array(z.string()).min(1, "Debe incluir al menos un ítem"),
  isActive: z.boolean().optional().default(true),
});

export const updateServiceSchema = createServiceSchema.extend({
  slug: z
    .string()
    .min(1, "El slug es requerido")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug inválido: solo minúsculas, números y guiones",
    )
    .optional(),
});

export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function calculateFinalPrice(
  price: number,
  discountType: "none" | "percentage" | "fixed",
  discountValue: number,
): number {
  if (discountType === "none" || !discountValue) {
    return price;
  }

  if (discountType === "percentage") {
    const clamped = Math.min(Math.max(discountValue, 0), 100);
    return Math.max(0, price - (price * clamped) / 100);
  }

  // fixed
  const clampedDiscount = Math.min(discountValue, price);
  return Math.max(0, price - clampedDiscount);
}

export function validateDiscount(
  price: number,
  discountType: "none" | "percentage" | "fixed",
  discountValue: number,
): string | null {
  if (discountType === "none") return null;

  if (discountType === "percentage") {
    if (discountValue < 0 || discountValue > 100) {
      return "El porcentaje de descuento debe estar entre 0 y 100";
    }
    return null;
  }

  if (discountType === "fixed") {
    if (discountValue > price) {
      return "El descuento fijo no puede ser mayor al precio";
    }
    if (discountValue < 0) {
      return "El descuento no puede ser negativo";
    }
    return null;
  }

  return null;
}
