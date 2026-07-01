import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { trainingService } from "@/server/services/training.service";
import { updateServiceSchema } from "@/lib/validations/service";
import { optimizeImageToWebp, validateImage } from "@/lib/image-optimizer";
import {
  uploadToR2,
  deleteFromR2Silent,
  generateStorageKey,
} from "@/lib/storage";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const service = await trainingService.getById(Number(id));
    if (!service) {
      return NextResponse.json(
        { error: "Servicio no encontrado" },
        { status: 404 },
      );
    }

    return NextResponse.json(service);
  } catch (error) {
    console.error("[GET /api/dashboard/services/[id]]", error);
    return NextResponse.json(
      { error: "Error al obtener el servicio" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const existing = await trainingService.getById(Number(id));
    if (!existing) {
      return NextResponse.json(
        { error: "Servicio no encontrado" },
        { status: 404 },
      );
    }

    const formData = await request.formData();
    const payloadRaw = formData.get("payload");
    if (!payloadRaw || typeof payloadRaw !== "string") {
      return NextResponse.json(
        { error: "Datos del servicio requeridos" },
        { status: 400 },
      );
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(payloadRaw);
    } catch {
      return NextResponse.json(
        { error: "Formato de datos inválido" },
        { status: 400 },
      );
    }

    const validation = updateServiceSchema.safeParse(parsed);
    if (!validation.success) {
      const errors = validation.error.issues.map((i) => i.message).join(", ");
      return NextResponse.json({ error: errors }, { status: 400 });
    }

    const data = validation.data;

    // Process main image (optional on update)
    let mainImage: { url: string; key: string } | null = null;
    const mainImageFile = formData.get("mainImage");
    if (mainImageFile && mainImageFile instanceof File) {
      validateImage(mainImageFile);
      const buffer = Buffer.from(await mainImageFile.arrayBuffer());
      const optimized = await optimizeImageToWebp(buffer, {
        maxWidth: 1200,
        maxHeight: 1200,
        quality: 82,
        fit: "cover",
      });

      const key = generateStorageKey(
        "powerguns/services",
        `main-${Date.now()}.webp`,
      );
      const url = await uploadToR2(optimized, key, "image/webp");
      mainImage = { url, key };
    }

    // Process gallery images
    const galleryImages: { url: string; key: string; altText?: string }[] = [];
    const galleryFiles = formData.getAll("galleryImages");

    for (let i = 0; i < galleryFiles.length; i++) {
      const file = galleryFiles[i];
      if (!(file instanceof File)) continue;
      validateImage(file);

      const buffer = Buffer.from(await file.arrayBuffer());
      const optimized = await optimizeImageToWebp(buffer, {
        maxWidth: 1600,
        maxHeight: 1600,
        quality: 82,
        fit: "inside",
      });

      const key = generateStorageKey(
        "powerguns/services",
        `gallery-${Date.now()}-${i}.webp`,
      );
      const url = await uploadToR2(optimized, key, "image/webp");

      galleryImages.push({ url, key, altText: data.title });
    }

    // Images to delete
    const deleteKeysRaw = formData.get("deleteImageKeys");
    let imagesToDelete: string[] = [];
    if (deleteKeysRaw && typeof deleteKeysRaw === "string") {
      imagesToDelete = deleteKeysRaw.split(",").filter(Boolean);
    }

    // 1. Update database first (with new image URLs if provided)
    const updated = await trainingService.update(
      Number(id),
      data,
      mainImage,
      galleryImages.length > 0 ? galleryImages : null,
      imagesToDelete,
    );

    // 2. Only after DB is updated, clean up old R2 images
    if (mainImage && existing.mainImageKey) {
      await deleteFromR2Silent(existing.mainImageKey);
    }
    for (const key of imagesToDelete) {
      await deleteFromR2Silent(key);
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[PUT /api/dashboard/services/[id]]", error);
    const message =
      error instanceof Error ? error.message : "Error al actualizar el servicio";
    const status = message.includes("no encontrado") ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const existing = await trainingService.getById(Number(id));
    if (!existing) {
      return NextResponse.json(
        { error: "Servicio no encontrado" },
        { status: 404 },
      );
    }

    // 1. Delete from database first
    await trainingService.delete(Number(id));

    // 2. Then clean up R2 images (silently — DB record is already safe)
    await deleteFromR2Silent(existing.mainImageKey);
    for (const img of existing.images) {
      await deleteFromR2Silent(img.imageKey);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/dashboard/services/[id]]", error);
    const message =
      error instanceof Error ? error.message : "Error al eliminar el servicio";
    const status = message.includes("no encontrado") ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
