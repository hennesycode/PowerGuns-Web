import { prisma } from "@/lib/prisma";

export type GalleryMediaType = "image" | "video";

type CreateGalleryItemInput = {
  name: string;
  mediaType: GalleryMediaType;
  fileUrl: string;
  fileKey: string;
  mimeType: string;
  size: number;
  width?: number | null;
  height?: number | null;
  durationMs?: number | null;
};

function serializeGalleryItem(item: Awaited<ReturnType<typeof prisma.galleryItem.findFirst>>) {
  if (!item) return null;
  return {
    id: item.id,
    name: item.name,
    mediaType: item.mediaType,
    fileUrl: item.fileUrl,
    fileKey: item.fileKey,
    mimeType: item.mimeType,
    size: item.size,
    width: item.width,
    height: item.height,
    durationMs: item.durationMs,
    sortOrder: item.sortOrder,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  };
}

export const galleryService = {
  async list() {
    const items = await prisma.galleryItem.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });
    return items.map((item) => serializeGalleryItem(item));
  },

  async create(input: CreateGalleryItemInput) {
    const max = await prisma.galleryItem.aggregate({ _max: { sortOrder: true } });
    const item = await prisma.galleryItem.create({
      data: {
        ...input,
        sortOrder: (max._max.sortOrder ?? -1) + 1,
      },
    });
    return serializeGalleryItem(item);
  },

  async updateName(id: string, name: string) {
    const item = await prisma.galleryItem.update({
      where: { id },
      data: { name: name.trim() },
    });
    return serializeGalleryItem(item);
  },

  async delete(id: string) {
    return prisma.galleryItem.delete({ where: { id } });
  },

  async reorder(ids: string[]) {
    await prisma.$transaction(
      ids.map((id, index) => prisma.galleryItem.update({ where: { id }, data: { sortOrder: index } })),
    );
    return this.list();
  },
};
