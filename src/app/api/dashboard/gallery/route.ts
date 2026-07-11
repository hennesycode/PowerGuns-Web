import { NextResponse } from "next/server";
import sharp from "sharp";
import { getSession } from "@/lib/auth";
import { ALLOWED_IMAGE_TYPES, optimizeImageToWebp, validateImage } from "@/lib/image-optimizer";
import { generateStorageKey, uploadToR2 } from "@/lib/storage";
import { ALLOWED_VIDEO_TYPES, optimizeMp4, validateVideo } from "@/lib/video-optimizer";
import { activityService } from "@/server/services/activity.service";
import { galleryService } from "@/server/services/gallery.service";

const ADMIN_ROLES = new Set(["administrador", "editor"]);

async function requireAdmin() {
  const session = await getSession();
  if (!session) return { error: "No autorizado", status: 401 } as const;
  if (!ADMIN_ROLES.has(session.role)) return { error: "No autorizado", status: 403 } as const;
  return { session } as const;
}

function filenameToName(filename: string) {
  return filename.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim() || "Archivo de galería";
}

export async function GET() {
  try {
    const auth = await requireAdmin();
    if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const items = await galleryService.list();
    return NextResponse.json({ items });
  } catch (error) {
    console.error("[GET /api/dashboard/gallery]", error);
    return NextResponse.json({ error: "Error al obtener galería" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAdmin();
    if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const formData = await request.formData();
    const files = formData.getAll("files").filter((file): file is File => file instanceof File && file.size > 0);
    if (files.length === 0) {
      return NextResponse.json({ error: "Selecciona al menos un archivo" }, { status: 400 });
    }

    const created = [];
    for (const file of files) {
      const inputBuffer = Buffer.from(await file.arrayBuffer());
      const baseName = filenameToName(file.name);

      if (ALLOWED_IMAGE_TYPES.includes(file.type)) {
        validateImage(file);
        const optimized = await optimizeImageToWebp(inputBuffer, {
          maxWidth: 1800,
          maxHeight: 1800,
          quality: 82,
          fit: "inside",
        });
        const metadata = await sharp(optimized).metadata();
        const key = generateStorageKey("powerguns/gallery", `${crypto.randomUUID()}.webp`);
        const url = await uploadToR2(optimized, key, "image/webp", "public, max-age=31536000, immutable");
        const item = await galleryService.create({
          name: baseName,
          mediaType: "image",
          fileUrl: url,
          fileKey: key,
          mimeType: "image/webp",
          size: optimized.length,
          width: metadata.width ?? null,
          height: metadata.height ?? null,
        });
        created.push(item);
        continue;
      }

      if (ALLOWED_VIDEO_TYPES.includes(file.type)) {
        validateVideo(file);
        const optimized = await optimizeMp4(inputBuffer);
        const key = generateStorageKey("powerguns/gallery", `${crypto.randomUUID()}.mp4`);
        const url = await uploadToR2(optimized, key, "video/mp4", "public, max-age=31536000, immutable");
        const item = await galleryService.create({
          name: baseName,
          mediaType: "video",
          fileUrl: url,
          fileKey: key,
          mimeType: "video/mp4",
          size: optimized.length,
        });
        created.push(item);
        continue;
      }

      throw new Error(`Formato no permitido: ${file.name}. Usa PNG, JPEG, JPG o MP4.`);
    }

    activityService.logFromSession(auth.session, {
      action: "gallery_uploaded",
      entityType: "gallery_item",
      description: `${created.length} archivo(s) agregados a la galería`,
      status: "success",
      page: "/dashboard/galeria",
      section: "Galería",
      metadata: { count: created.length },
    });

    return NextResponse.json({ items: created }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/dashboard/gallery]", error);
    const message = error instanceof Error ? error.message : "No se pudo subir el archivo";
    return NextResponse.json({ error: message }, { status: message.includes("Formato") || message.includes("grande") ? 400 : 500 });
  }
}
