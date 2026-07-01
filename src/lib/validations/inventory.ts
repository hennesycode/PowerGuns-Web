import { z } from "zod/v4";

export const categorySchema = z.object({
  name: z.string().min(1, "Nombre requerido").max(100),
  slug: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().int().min(0).default(0),
  type: z.enum(["parent", "child"]).default("parent"),
  parentId: z.string().nullable().optional().default(null),
});

export const productSchema = z.object({
  name: z.string().min(1, "Nombre requerido").max(150),
  slug: z.string().max(150).optional().nullable(),
  sku: z.string().max(50).optional().nullable(),
  description: z.string().max(1000).optional().nullable(),
  quantity: z.coerce.number().int().min(0).default(0),
  minStock: z.coerce.number().int().min(0).default(0),
  location: z.string().max(200).optional().nullable(),
  isActive: z.boolean().default(true),
  categoryId: z.string().min(1, "Categoría requerida"),
  imageAlt: z.string().max(200).optional().nullable(),
});

export const productQuerySchema = z.object({
  q: z.string().optional().default(""),
  categoryId: z.string().optional().default(""),
  status: z.enum(["all", "active", "inactive"]).optional().default("all"),
  stock: z.enum(["all", "low", "none"]).optional().default("all"),
});

export type CategoryInput = z.infer<typeof categorySchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type ProductQueryInput = z.infer<typeof productQuerySchema>;
