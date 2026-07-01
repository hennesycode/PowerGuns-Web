import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import type {
  CreateServiceInput,
  UpdateServiceInput,
} from "@/lib/validations/service";
import {
  calculateFinalPrice,
  generateSlug,
  validateDiscount,
} from "@/lib/validations/service";

type TrainingServiceWithImages = Prisma.TrainingServiceGetPayload<{
  include: { images: true };
}>;

function safeParseJSON(value: string | null): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function serializeService(service: TrainingServiceWithImages) {
  return {
    id: service.id,
    name: service.name,
    title: service.title,
    slug: service.slug,
    mainImageUrl: service.mainImageUrl,
    mainImageKey: service.mainImageKey,
    shortDescription: service.shortDescription,
    longDescription: service.longDescription,
    seoTitle: service.seoTitle,
    seoDescription: service.seoDescription,
    seoKeywords: service.seoKeywords,
    tags: service.tags ?? "",
    price: Number(service.price),
    discountType: service.discountType,
    discountValue: service.discountValue != null ? Number(service.discountValue) : null,
    finalPrice: Number(service.finalPrice),
    durationMinutes: service.durationMinutes,
    includes: safeParseJSON(service.includes),
    isActive: service.isActive,
    isFeatured: service.isFeatured,
    createdAt: service.createdAt,
    updatedAt: service.updatedAt,
    images: service.images?.map((img) => ({
      id: img.id,
      serviceId: img.serviceId,
      imageUrl: img.imageUrl,
      imageKey: img.imageKey,
      altText: img.altText,
      sortOrder: Number(img.sortOrder),
      createdAt: img.createdAt,
    })),
  } as const;
}

function serializeServices(services: TrainingServiceWithImages[]) {
  return services.map(serializeService);
}

function buildSlug(name: string, existingCount: number): string {
  const base = generateSlug(name);
  if (existingCount === 0) return base;
  return `${base}-${existingCount + 1}`;
}

export const trainingService = {
  async list(): Promise<ReturnType<typeof serializeService>[]> {
    const services = await prisma.trainingService.findMany({
      include: { images: true },
      orderBy: { createdAt: "desc" },
    });
    return serializeServices(services);
  },

  async getById(
    id: number,
  ): Promise<ReturnType<typeof serializeService> | null> {
    const service = await prisma.trainingService.findUnique({
      where: { id },
      include: { images: true },
    });
    return service ? serializeService(service) : null;
  },

  async getBySlug(
    slug: string,
  ): Promise<ReturnType<typeof serializeService> | null> {
    const service = await prisma.trainingService.findUnique({
      where: { slug },
      include: { images: true },
    });
    return service ? serializeService(service) : null;
  },

  async create(
    input: CreateServiceInput,
    mainImageUrl: string,
    mainImageKey: string,
    galleryImages: { url: string; key: string; altText?: string }[],
  ): Promise<ReturnType<typeof serializeService>> {
    const slug = input.slug || generateSlug(input.name);
    const discountType = input.discountType || "none";
    const discountValue = Number(input.discountValue ?? 0);
    const finalPrice = calculateFinalPrice(
      input.price,
      discountType,
      discountValue,
    );

    // Validate uniqueness of slug
    const existingCount = await prisma.trainingService.count({
      where: { slug: { startsWith: slug } },
    });
    const uniqueSlug = buildSlug(input.name, existingCount);

    // Validate discount
    const discountError = validateDiscount(
      input.price,
      discountType,
      discountValue,
    );
    if (discountError) {
      throw new Error(discountError);
    }

    const service = await prisma.trainingService.create({
      data: {
        name: input.name,
        title: input.title,
        slug: uniqueSlug,
        mainImageUrl,
        mainImageKey,
        shortDescription: input.shortDescription,
        longDescription: input.longDescription,
        seoTitle: input.seoTitle || input.title,
        seoDescription: input.seoDescription || input.shortDescription.slice(0, 160),
        seoKeywords: input.seoKeywords || "",
        tags: input.tags || "",
        price: input.price,
        discountType,
        discountValue,
        finalPrice,
        durationMinutes: input.durationMinutes,
        includes: JSON.stringify(input.includes),
        isActive: input.isActive ?? true,
        images: {
          create: galleryImages.map((img, index) => ({
            imageUrl: img.url,
            imageKey: img.key,
            altText: img.altText || input.title,
            sortOrder: index,
          })),
        },
      },
      include: { images: true },
    });

    return serializeService(service);
  },

  async update(
    id: number,
    input: UpdateServiceInput,
    mainImage?: { url: string; key: string } | null,
    galleryImages?: { url: string; key: string; altText?: string }[] | null,
    imagesToDelete?: string[],
  ): Promise<ReturnType<typeof serializeService>> {
    const existing = await prisma.trainingService.findUnique({
      where: { id },
      include: { images: true },
    });
    if (!existing) throw new Error("Servicio no encontrado");

    const discountType = input.discountType || "none";
    const discountValue = Number(input.discountValue ?? 0);
    const finalPrice = calculateFinalPrice(
      input.price,
      discountType,
      discountValue,
    );

    const discountError = validateDiscount(
      input.price,
      discountType,
      discountValue,
    );
    if (discountError) {
      throw new Error(discountError);
    }

    const data: Prisma.TrainingServiceUpdateInput = {
      name: input.name,
      title: input.title,
      shortDescription: input.shortDescription,
      longDescription: input.longDescription,
      seoTitle: input.seoTitle || undefined,
      seoDescription: input.seoDescription || undefined,
      seoKeywords: input.seoKeywords || undefined,
      tags: input.tags || undefined,
      price: input.price,
      discountType,
      discountValue,
      finalPrice,
      durationMinutes: input.durationMinutes,
      includes: JSON.stringify(input.includes),
      isActive: input.isActive,
    };

    if (input.slug) {
      data.slug = input.slug;
    }

    if (mainImage) {
      data.mainImageUrl = mainImage.url;
      data.mainImageKey = mainImage.key;
    }

    if (imagesToDelete && imagesToDelete.length > 0) {
      await prisma.trainingServiceImage.deleteMany({
        where: {
          serviceId: id,
          imageKey: { in: imagesToDelete },
        },
      });
    }

    if (galleryImages && galleryImages.length > 0) {
      const nextOrder = await prisma.trainingServiceImage.count({
        where: { serviceId: id },
      });
      for (let i = 0; i < galleryImages.length; i++) {
        const img = galleryImages[i];
        await prisma.trainingServiceImage.create({
          data: {
            serviceId: id,
            imageUrl: img.url,
            imageKey: img.key,
            altText: img.altText || input.title,
            sortOrder: nextOrder + i,
          },
        });
      }
    }

    const updated = await prisma.trainingService.update({
      where: { id },
      data,
      include: { images: true },
    });

    return serializeService(updated);
  },

  async toggleStatus(
    id: number,
  ): Promise<ReturnType<typeof serializeService>> {
    const existing = await prisma.trainingService.findUnique({
      where: { id },
      include: { images: true },
    });
    if (!existing) throw new Error("Servicio no encontrado");

    const updated = await prisma.trainingService.update({
      where: { id },
      data: { isActive: !existing.isActive },
      include: { images: true },
    });

    return serializeService(updated);
  },

  async toggleFeatured(
    id: number,
  ): Promise<ReturnType<typeof serializeService>> {
    const existing = await prisma.trainingService.findUnique({
      where: { id },
      include: { images: true },
    });
    if (!existing) throw new Error("Servicio no encontrado");

    const updated = await prisma.trainingService.update({
      where: { id },
      data: { isFeatured: !existing.isFeatured },
      include: { images: true },
    });

    return serializeService(updated);
  },

  async delete(id: number): Promise<void> {
    const service = await prisma.trainingService.findUnique({
      where: { id },
      include: { images: true },
    });
    if (!service) throw new Error("Servicio no encontrado");

    await prisma.trainingService.delete({ where: { id } });
  },

  async getImagesToDelete(
    id: number,
  ): Promise<{ mainImageKey: string; galleryKeys: string[] }> {
    const service = await prisma.trainingService.findUnique({
      where: { id },
      include: { images: true },
    });
    if (!service) return { mainImageKey: "", galleryKeys: [] };
    return {
      mainImageKey: service.mainImageKey,
      galleryKeys: service.images.map((img) => img.imageKey),
    };
  },
};
