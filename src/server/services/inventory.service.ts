import { prisma } from "@/lib/prisma";
import type { CategoryInput, ProductInput, ProductQueryInput } from "@/lib/validations/inventory";

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function serializeCategory(c: Record<string, unknown> & { id: string; name: string; slug: string; description: string | null; isActive: boolean; sortOrder: number; parentId: string | null; createdAt: Date; _count?: { products: number }; children?: Array<{ id: string; name: string; parentId: string | null; _count?: { products: number } }> }) {
  return {
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    isActive: c.isActive,
    sortOrder: c.sortOrder,
    parentId: c.parentId ?? null,
    productCount: (c._count?.products ?? 0) + ((c.children as Array<{ _count?: { products: number } }> | undefined)?.reduce((sum, child) => sum + (child._count?.products ?? 0), 0) ?? 0),
    children: (c.children ?? []).map((child) => ({
      id: child.id, name: child.name, parentId: child.parentId ?? null,
      productCount: child._count?.products ?? 0,
    })),
    createdAt: c.createdAt.toISOString(),
  };
}

// ---- Categories ----

export const inventoryService = {
  async listCategoriesForSelect() {
    const categories = await prisma.inventoryCategory.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true, parentId: true },
    });
    return categories.map((c) => ({ id: c.id, name: c.name, parentId: c.parentId ?? null }));
  },

  async listCategories() {
    const categories = await prisma.inventoryCategory.findMany({
      where: { parentId: null },
      orderBy: { sortOrder: "asc" },
      include: {
        _count: { select: { products: { where: { deletedAt: null } } } },
        children: { include: { _count: { select: { products: { where: { deletedAt: null } } } } } },
      },
    });
    return categories.map(serializeCategory);
  },

  async createCategory(input: CategoryInput) {
    const slug = input.slug?.trim() || slugify(input.name);
    const parentId = input.type === "child" ? input.parentId : null;
    if (input.type === "child" && !parentId) throw new Error("Selecciona una categoría padre");
    return prisma.inventoryCategory.create({
      data: { name: input.name.trim(), slug, description: input.description?.trim() || null, isActive: input.isActive, sortOrder: input.sortOrder, parentId },
    });
  },

  async updateCategory(id: string, input: CategoryInput) {
    const existing = await prisma.inventoryCategory.findUnique({ where: { id } });
    if (!existing) throw new Error("Categoría no encontrada");
    const slug = input.slug?.trim() || (input.name ? slugify(input.name) : existing.slug);
    const parentId = input.type === "child" ? input.parentId : null;
    if (input.type === "child" && !parentId) throw new Error("Selecciona una categoría padre");
    if (input.type === "child" && parentId === id) throw new Error("Una categoría no puede ser su propio padre");
    return prisma.inventoryCategory.update({
      where: { id },
      data: { name: input.name?.trim(), slug, description: input.description?.trim() ?? null, isActive: input.isActive, sortOrder: input.sortOrder, parentId },
    });
  },

  async deleteCategory(id: string) {
    const productCount = await prisma.inventoryProduct.count({ where: { categoryId: id, deletedAt: null } });
    if (productCount > 0) throw new Error("No puedes eliminar esta categoría porque tiene productos asociados.");
    const childCount = await prisma.inventoryCategory.count({ where: { parentId: id } });
    if (childCount > 0) throw new Error("No puedes eliminar esta categoría porque tiene subcategorías asociadas.");
    await prisma.inventoryCategory.delete({ where: { id } });
  },

  // ---- Products ----

  async listProducts(query: ProductQueryInput) {
    const where: Record<string, unknown> = { deletedAt: null };

    if (query.categoryId) {
      const childIds = await prisma.inventoryCategory.findMany({
        where: { parentId: query.categoryId },
        select: { id: true },
      });
      const allIds = [query.categoryId, ...childIds.map((c) => c.id)];
      where.categoryId = { in: allIds };
    }
    if (query.status === "active") where.isActive = true;
    if (query.status === "inactive") where.isActive = false;

    if (query.q) {
      where.OR = [
        { name: { contains: query.q } },
        { sku: { contains: query.q } },
        { location: { contains: query.q } },
      ];
    }

    let products = await prisma.inventoryProduct.findMany({
      where: where as never,
      include: { category: true },
      orderBy: { updatedAt: "desc" },
    });

    if (query.stock === "low") products = products.filter((p) => p.quantity <= p.minStock && p.minStock > 0);
    if (query.stock === "none") products = products.filter((p) => p.quantity === 0);

    return products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      sku: p.sku,
      description: p.description,
      quantity: p.quantity,
      minStock: p.minStock,
      location: p.location,
      isActive: p.isActive,
      imageUrl: p.imageUrl,
      imageKey: p.imageKey,
      imageAlt: p.imageAlt,
      categoryId: p.categoryId,
      categoryName: p.category.name,
      deletedAt: p.deletedAt,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    }));
  },

  async getProduct(id: string) {
    return prisma.inventoryProduct.findUnique({ where: { id }, include: { category: true } });
  },

  async createProduct(input: ProductInput, changedByName: string, image?: { url: string; key: string } | null) {
    const slug = input.slug?.trim() || slugify(input.name);
    const p = await prisma.inventoryProduct.create({
      data: {
        name: input.name.trim(), slug, sku: input.sku?.trim() || null,
        description: input.description?.trim() || null, quantity: input.quantity,
        minStock: input.minStock, location: input.location?.trim() || null,
        isActive: input.isActive, categoryId: input.categoryId,
        imageUrl: image?.url ?? null, imageKey: image?.key ?? null, imageAlt: input.imageAlt?.trim() || null,
      },
    });
    await prisma.inventoryProductHistory.create({
      data: { productId: p.id, action: "created", note: "Producto creado", changedByName },
    });
    return p;
  },

  async updateProduct(id: string, input: ProductInput, changedByName: string, image?: { url: string; key: string } | null) {
    const existing = await prisma.inventoryProduct.findUnique({ where: { id } });
    if (!existing) throw new Error("Producto no encontrado");

    const slug = input.slug?.trim() || slugify(input.name);

    const historyEntries: Array<{
      productId: string; action: string; field: string;
      oldValue: string; newValue: string; changedByName: string;
    }> = [];

    const compare = (field: string, oldVal: unknown, newVal: unknown) => {
      const o = String(oldVal ?? "");
      const n = String(newVal ?? "");
      if (o !== n) {
        historyEntries.push({ productId: id, action: "updated", field, oldValue: o, newValue: n, changedByName });
      }
    };

    compare("name", existing.name, input.name);
    compare("sku", existing.sku, input.sku);
    compare("quantity", existing.quantity, input.quantity);
    compare("minStock", existing.minStock, input.minStock);
    compare("location", existing.location, input.location);
    compare("description", existing.description, input.description);
    compare("isActive", existing.isActive, input.isActive);
    if (input.categoryId && existing.categoryId !== input.categoryId) {
      compare("categoryId", existing.categoryId, input.categoryId);
    }
    if (image) {
      historyEntries.push({ productId: id, action: "updated", field: "image", oldValue: existing.imageUrl ?? "", newValue: image.url, changedByName });
    }

    const p = await prisma.inventoryProduct.update({
      where: { id },
      data: {
        name: input.name?.trim(), slug, sku: input.sku?.trim() ?? null,
        description: input.description?.trim() ?? null, quantity: input.quantity,
        minStock: input.minStock, location: input.location?.trim() ?? null,
        isActive: input.isActive, categoryId: input.categoryId ?? undefined,
        imageAlt: input.imageAlt?.trim() || null,
        ...(image ? { imageUrl: image.url, imageKey: image.key } : {}),
      },
    });

    if (historyEntries.length > 0) {
      await prisma.inventoryProductHistory.createMany({ data: historyEntries });
    }

    return p;
  },

  async deleteProduct(id: string, changedByName: string) {
    await prisma.inventoryProduct.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
    await prisma.inventoryProductHistory.create({
      data: { productId: id, action: "deleted", note: "Producto desactivado", changedByName },
    });
  },

  async getHistory(productId: string) {
    return prisma.inventoryProductHistory.findMany({
      where: { productId },
      orderBy: { createdAt: "desc" },
    });
  },
};
