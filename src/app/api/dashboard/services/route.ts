import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { trainingService } from "@/server/services/training.service";
import { activityService } from "@/server/services/activity.service";
import { createServiceSchema } from "@/lib/validations/service";
import { optimizeImageToWebp, validateImage } from "@/lib/image-optimizer";
import {
  uploadToR2,
  generateStorageKey,
} from "@/lib/storage";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const services = await trainingService.list();
    return NextResponse.json(services);
  } catch (error) {
    console.error("[GET /api/dashboard/services]", error);
    return NextResponse.json(
      { error: "Error al obtener servicios" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
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

    const validation = createServiceSchema.safeParse(parsed);
    if (!validation.success) {
      const errors = validation.error.issues.map((i) => i.message).join(", ");
      return NextResponse.json({ error: errors }, { status: 400 });
    }

    const data = validation.data;

    // Process main image
    const mainImageFile = formData.get("mainImage");
    if (!mainImageFile || !(mainImageFile instanceof File)) {
      return NextResponse.json(
        { error: "La imagen principal es obligatoria" },
        { status: 400 },
      );
    }

    validateImage(mainImageFile);
    const mainImageBuffer = Buffer.from(await mainImageFile.arrayBuffer());
    const optimizedMain = await optimizeImageToWebp(mainImageBuffer, {
      maxWidth: 1200,
      maxHeight: 1200,
      quality: 82,
      fit: "cover",
    });

    const mainKey = generateStorageKey(
      "powerguns/services",
      `main-${Date.now()}.webp`,
    );
    const mainImageUrl = await uploadToR2(optimizedMain, mainKey, "image/webp");

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

    const service = await trainingService.create(
      data,
      mainImageUrl,
      mainKey,
      galleryImages,
    );

    activityService.logFromSession(session, {
      action: "service_created",
      entityType: "training_service",
      entityId: String(service.id),
      entityName: service.name,
      description: `Servicio "${service.name}" creado — $${service.finalPrice.toLocaleString("es-CO")} COP`,
      status: "success",
      page: "/dashboard/servicios",
      section: "Servicios",
      metadata: { serviceName: service.name, price: service.finalPrice, isActive: service.isActive },
    });

    return NextResponse.json(service, { status: 201 });
  } catch (error) {
    console.error("[POST /api/dashboard/services]", error);
    const message =
      error instanceof Error ? error.message : "Error al crear el servicio";
    const status = message.includes("Slug") ? 409 : 500;

    const session = await getSession();
    if (session) {
      activityService.logFromSession(session, {
        action: "service_created",
        entityType: "training_service",
        description: `Error al crear servicio: ${message}`,
        status: "error",
        errorMessage: message,
        page: "/dashboard/servicios",
        section: "Servicios",
      });
    }

    return NextResponse.json({ error: message }, { status });
  }
}
