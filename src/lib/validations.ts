import { z } from "zod";

// ── Existing public schemas ──────────────────────────────────

export const bookingSchema = z.object({
  name: z.string().min(3, "Nombre requerido (mín. 3 caracteres)"),
  phone: z
    .string()
    .min(7, "Teléfono requerido")
    .regex(/^\+?\d{7,15}$/, "Formato de teléfono inválido"),
  email: z.string().email("Correo inválido").or(z.literal("")),
  serviceId: z.number().int().positive("Debe seleccionar un servicio"),
  packageId: z.number().int().positive("Debe seleccionar un paquete"),
  date: z.string().min(1, "Debe seleccionar una fecha"),
  timeSlot: z.string().min(1, "Debe seleccionar un horario"),
  persons: z.number().int().min(1, "Mínimo 1 persona").max(20, "Máximo 20 personas"),
  notes: z.string().max(500).optional().default(""),
  acceptedTerms: z.literal(true, {
    message: "Debe aceptar los términos y condiciones de seguridad",
  }),
});

export const contactSchema = z.object({
  name: z.string().min(3, "Nombre requerido (mín. 3 caracteres)"),
  phone: z
    .string()
    .min(7, "Teléfono requerido")
    .regex(/^\+?\d{7,15}$/, "Formato de teléfono inválido"),
  email: z.string().email("Correo inválido").or(z.literal("")),
  message: z.string().min(10, "Mensaje muy corto").max(1000, "Mensaje demasiado largo"),
});

export type BookingInput = z.infer<typeof bookingSchema>;
export type ContactInput = z.infer<typeof contactSchema>;

// ── Auth schemas ─────────────────────────────────────────────

const PASSWORD_RULES =
  "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial";

export const passwordSchema = z
  .string()
  .min(8, PASSWORD_RULES)
  .regex(/[A-Z]/, PASSWORD_RULES)
  .regex(/[a-z]/, PASSWORD_RULES)
  .regex(/[0-9]/, PASSWORD_RULES)
  .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, PASSWORD_RULES);

export const registerSchema = z.object({
  username: z.string().min(3, "Mínimo 3 caracteres").max(30),
  firstName: z.string().min(1, "Requerido"),
  lastName: z.string().min(1, "Requerido"),
  email: z.string().email("Correo inválido"),
  identificationType: z.enum(["cedula", "pasaporte", "cedula_extranjeria"]),
  identificationNumber: z.string().min(3, "Requerido"),
  role: z
    .enum(["administrador", "finanzas", "editor", "cliente", "instructor"])
    .default("cliente"),
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: z.string().min(1, "Requerido"),
  password: z.string().min(1, "Requerido"),
});
