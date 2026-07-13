import { z } from "zod/v4";

export const PAYMENT_PROVIDERS = ["daviplata", "nequi", "bancolombia", "davivienda", "bbva"] as const;

export const paymentMethodSchema = z.object({
  type: z.literal("bank_transfer").default("bank_transfer"),
  provider: z.enum(PAYMENT_PROVIDERS),
  accountNumber: z.string().trim().min(1, "Número de cuenta requerido").max(80),
  accountHolderName: z.string().trim().min(1, "Nombre completo requerido").max(150),
  identificationNumber: z.string().trim().max(50).optional().nullable(),
  isActive: z.boolean().default(true),
});

export type PaymentMethodInput = z.infer<typeof paymentMethodSchema>;
