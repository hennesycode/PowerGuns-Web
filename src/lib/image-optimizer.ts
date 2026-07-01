import sharp from "sharp";

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export const MAX_UPLOAD_SIZE = 10 * 1024 * 1024; // 10 MB

export interface OptimizeOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  fit?: "cover" | "contain" | "fill" | "inside" | "outside";
}

export async function optimizeImageToWebp(
  buffer: Buffer,
  options: OptimizeOptions = {},
): Promise<Buffer> {
  const {
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 82,
    fit = "inside",
  } = options;

  return sharp(buffer)
    .resize(maxWidth, maxHeight, { fit, withoutEnlargement: true })
    .webp({ quality })
    .toBuffer();
}

export function validateImage(file: File | Buffer): void {
  if (file instanceof File) {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      throw new Error(
        `Formato no permitido. Usa: ${ALLOWED_IMAGE_TYPES.join(", ")}`,
      );
    }
    if (file.size > MAX_UPLOAD_SIZE) {
      throw new Error(
        `La imagen es demasiado grande. Máximo ${MAX_UPLOAD_SIZE / 1024 / 1024} MB`,
      );
    }
  }
}

export function generateImageFilename(
  prefix: string,
  suffix: number | string,
): string {
  const timestamp = Date.now();
  const safeSuffix = String(suffix).replace(/[^a-zA-Z0-9_-]/g, "");
  return `${prefix}-${timestamp}-${safeSuffix}.webp`;
}
