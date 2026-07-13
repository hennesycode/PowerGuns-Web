import { z } from "zod/v4";

export const PAYMENT_PROVIDERS = ["cash", "daviplata", "nequi", "bancolombia", "davivienda", "bbva"] as const;

export const paymentMethodSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("bank_transfer").default("bank_transfer"),
    provider: z.enum(["daviplata", "nequi", "bancolombia", "davivienda", "bbva"]),
    accountNumber: z.string().trim().min(1, "Número de cuenta requerido").max(80),
    accountHolderName: z.string().trim().min(1, "Nombre completo requerido").max(150),
    identificationNumber: z.string().trim().max(50).optional().nullable(),
    isActive: z.boolean().default(true),
  }),
  z.object({
    type: z.literal("cash"),
    provider: z.literal("cash"),
    accountNumber: z.string().trim().default("N/A"),
    accountHolderName: z.string().trim().default("Pago en efectivo"),
    identificationNumber: z.string().trim().max(50).optional().nullable(),
    isActive: z.boolean().default(true),
  }),
]);

export const paymentMethodStatusSchema = z.object({
  isActive: z.boolean(),
});

export type PaymentMethodInput = z.infer<typeof paymentMethodSchema>;
