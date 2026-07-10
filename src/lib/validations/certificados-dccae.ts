import { z } from "zod";

export const MAX_CERTIFICATE_FILE_SIZE = 20 * 1024 * 1024;

export const CERTIFICATE_ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "text/csv",
  "image/png",
  "image/jpeg",
  "image/webp",
]);

export const createCertificateFolderSchema = z.object({
  name: z.string().trim().min(1, "El nombre de la carpeta es obligatorio").max(120, "El nombre no puede superar 120 caracteres"),
  parentId: z.string().trim().min(1).nullable().optional(),
});

export const updateCertificateItemSchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio").max(120, "El nombre no puede superar 120 caracteres").optional(),
  parentId: z.string().trim().min(1).nullable().optional(),
});

export function sanitizeCertificateName(name: string): string {
  return name
    .replace(/[\\/:*?"<>|]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
}

export function getFileExtension(filename: string): string {
  const clean = filename.trim();
  const index = clean.lastIndexOf(".");
  if (index < 0 || index === clean.length - 1) return "";
  return clean.slice(index + 1).toLowerCase();
}

export function validateCertificateFile(file: File): void {
  if (file.size <= 0) throw new Error("El archivo está vacío");
  if (file.size > MAX_CERTIFICATE_FILE_SIZE) throw new Error("El archivo no puede superar 20 MB");
  if (!CERTIFICATE_ALLOWED_MIME_TYPES.has(file.type)) {
    throw new Error("Formato no permitido. Usa PDF, Word, Excel, PowerPoint, TXT, CSV o imágenes");
  }
}
