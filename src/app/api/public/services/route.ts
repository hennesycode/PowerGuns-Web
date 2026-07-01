import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim() ?? "";
    const sort = searchParams.get("sort") ?? "date-desc";

    const where: Prisma.TrainingServiceWhereInput = { isActive: true };

    if (q) {
      where.OR = [
        { name: { contains: q } },
        { title: { contains: q } },
        { shortDescription: { contains: q } },
        { tags: { contains: q } },
        { seoKeywords: { contains: q } },
      ];
    }

    const orderBy: Prisma.TrainingServiceOrderByWithRelationInput[] = (() => {
      switch (sort) {
        case "featured":
          return [{ isFeatured: "desc" }, { createdAt: "desc" }];
        case "price-asc":
          return [{ finalPrice: "asc" }];
        case "price-desc":
          return [{ finalPrice: "desc" }];
        case "duration-asc":
          return [{ durationMinutes: "asc" }];
        case "duration-desc":
          return [{ durationMinutes: "desc" }];
        case "date-desc":
        default:
          return [{ createdAt: "desc" }];
      }
    })();

    const services = await prisma.trainingService.findMany({
      where,
      orderBy,
      select: {
        id: true,
        name: true,
        title: true,
        slug: true,
        mainImageUrl: true,
        shortDescription: true,
        price: true,
        discountType: true,
        discountValue: true,
        finalPrice: true,
        durationMinutes: true,
        isFeatured: true,
      },
    });

    const serialized = services.map((s) => ({
      id: s.id,
      name: s.name,
      title: s.title,
      slug: s.slug,
      mainImageUrl: s.mainImageUrl,
      shortDescription: s.shortDescription,
      price: Number(s.price),
      discountType: s.discountType,
      discountValue: s.discountValue ? Number(s.discountValue) : null,
      finalPrice: Number(s.finalPrice),
      durationMinutes: s.durationMinutes,
      isFeatured: s.isFeatured,
    }));

    return NextResponse.json({ services: serialized });
  } catch (error) {
    console.error("[GET /api/public/services]", error);
    return NextResponse.json(
      { error: "Error al cargar servicios", services: [] },
      { status: 500 },
    );
  }
}
