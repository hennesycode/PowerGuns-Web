import { z } from "zod/v4";

export const reservationStatusSchema = z.enum([
  "pending",
  "in_review",
  "confirmed",
  "completed",
  "canceled",
]);

export const identificationTypeSchema = z.enum([
  "cedula",
  "pasaporte",
  "cedula_extranjeria",
]);

export const reservationCustomerSchema = z.object({
  firstName: z
    .string()
    .min(2, "Mínimo 2 caracteres")
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, "Solo letras y espacios"),
  lastName: z
    .string()
    .min(2, "Mínimo 2 caracteres")
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, "Solo letras y espacios"),
  identificationType: identificationTypeSchema,
  identificationNumber: z
    .string()
    .min(4, "Mínimo 4 dígitos")
    .max(11, "Máximo 11 dígitos")
    .regex(/^\d+$/, "Solo números"),
  email: z.string().email("Correo electrónico inválido"),
  phone: z
    .string()
    .length(10, "Debe tener 10 dígitos")
    .regex(/^3\d{9}$/, "Debe iniciar en 3 y tener 10 dígitos"),
  address: z.string().trim().max(200, "Máximo 200 caracteres").default(""),
  country: z.string().default("Colombia"),
  department: z.string().trim().max(80, "Máximo 80 caracteres").default(""),
  city: z.string().trim().max(80, "Máximo 80 caracteres").default(""),
});

export const reservationScheduleSchema = z.object({
  reservationDate: z
    .string()
    .min(1, "Selecciona una fecha")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida"),
  reservationTime: z.string().min(1, "Selecciona una hora"),
  durationHours: z.coerce.number().int().min(1, "Duración mínima 1 hora").max(8, "Duración máxima 8 horas").default(1),
  scheduleNotes: z.string().max(500, "Máximo 500 caracteres").optional(),
});

export const reservationPaymentSchema = z.object({
  paymentMethodId: z.string().trim().optional().nullable(),
});

export const reservationSchema = reservationCustomerSchema.merge(reservationScheduleSchema).merge(reservationPaymentSchema);

export const reservationItemSchema = z.object({
  serviceId: z.coerce.number().int().positive("Servicio inválido"),
  quantity: z.coerce.number().int().min(1, "Cantidad mínima 1").max(20, "Cantidad máxima 20"),
  hours: z.coerce.number().int().min(1, "Horas mínimas 1").max(8, "Horas máximas 8").default(1),
});

export const publicReservationSchema = reservationSchema.extend({
  items: z.array(reservationItemSchema).min(1, "Selecciona al menos un servicio"),
  couponCode: z.string().trim().max(50).optional().nullable(),
});

export const dashboardReservationSchema = publicReservationSchema.extend({
  userId: z.coerce.number().int().positive().optional().nullable(),
  status: reservationStatusSchema.default("pending"),
});

export const updateReservationSchema = dashboardReservationSchema.extend({
  status: reservationStatusSchema,
});

export const reservationQuerySchema = z.object({
  q: z.string().trim().optional().default(""),
  status: z.union([reservationStatusSchema, z.literal("all")]).optional().default("all"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal("")),
});

export type ReservationFormData = z.infer<typeof reservationSchema>;
export type PublicReservationInput = z.infer<typeof publicReservationSchema>;
export type DashboardReservationInput = z.infer<typeof dashboardReservationSchema>;
export type UpdateReservationInput = z.infer<typeof updateReservationSchema>;
export type ReservationStatusInput = z.infer<typeof reservationStatusSchema>;
