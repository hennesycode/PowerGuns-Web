import { z } from "zod";

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
