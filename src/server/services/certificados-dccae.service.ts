import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";
import { deleteFromR2Silent, generateStorageKey, uploadToR2 } from "@/lib/storage";
import { getFileExtension, sanitizeCertificateName } from "@/lib/validations/certificados-dccae";

type CertificateItemRecord = {
  id: string;
  name: string;
  type: "folder" | "file";
  parentId: string | null;
  fileUrl: string | null;
  fileKey: string | null;
  mimeType: string | null;
  size: number | null;
  extension: string | null;
  createdAt: Date;
  updatedAt: Date;
};

function serialize(item: CertificateItemRecord) {
  return {
    ...item,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  };
}

function ensureR2Configured() {
  const required = [
    "R2_ENDPOINT",
    "R2_ACCESS_KEY_ID",
    "R2_SECRET_ACCESS_KEY",
    "R2_BUCKET_NAME",
    "R2_PUBLIC_URL",
  ];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`R2 no está configurado correctamente: falta ${missing.join(", ")}`);
  }
}

async function ensureFolder(parentId?: string | null) {
  if (!parentId) return null;
  const parent = await prisma.certificateDccaeItem.findUnique({ where: { id: parentId } });
  if (!parent || parent.type !== "folder") throw new Error("La carpeta destino no existe");
  return parent;
}

async function ensureUniqueName(name: string, parentId: string | null, currentId?: string) {
  const siblings = await prisma.certificateDccaeItem.findMany({
    where: { parentId },
    select: { id: true, name: true },
  });

  const exists = siblings.some(
    (item) => item.id !== currentId && item.name.toLowerCase() === name.toLowerCase(),
  );
  if (exists) throw new Error("Ya existe un elemento con ese nombre en esta carpeta");
}

async function assertNotMovingIntoSelf(itemId: string, parentId: string | null) {
  let cursor = parentId;
  while (cursor) {
    if (cursor === itemId) throw new Error("No puedes mover una carpeta dentro de sí misma");
    const parent = await prisma.certificateDccaeItem.findUnique({
      where: { id: cursor },
      select: { parentId: true },
    });
    cursor = parent?.parentId ?? null;
  }
}

export const certificadosDccaeService = {
  async list(parentId?: string | null) {
    await ensureFolder(parentId);
    const [items, breadcrumbs] = await Promise.all([
      prisma.certificateDccaeItem.findMany({
        where: { parentId: parentId || null },
        orderBy: [{ type: "asc" }, { name: "asc" }],
      }),
      this.getBreadcrumbs(parentId || null),
    ]);
    return { items: items.map(serialize), breadcrumbs };
  },

  async getBreadcrumbs(parentId: string | null) {
    const crumbs: { id: string; name: string }[] = [];
    let cursor = parentId;
    while (cursor) {
      const item = await prisma.certificateDccaeItem.findUnique({
        where: { id: cursor },
        select: { id: true, name: true, parentId: true, type: true },
      });
      if (!item || item.type !== "folder") break;
      crumbs.unshift({ id: item.id, name: item.name });
      cursor = item.parentId;
    }
    return crumbs;
  },

  async createFolder(input: { name: string; parentId?: string | null }) {
    const name = sanitizeCertificateName(input.name);
    if (!name) throw new Error("El nombre de la carpeta es obligatorio");
    const parentId = input.parentId || null;
    await ensureFolder(parentId);
    await ensureUniqueName(name, parentId);

    const folder = await prisma.certificateDccaeItem.create({
      data: { name, type: "folder", parentId },
    });
    return serialize(folder);
  },

  async uploadFile(input: { file: File; parentId?: string | null }) {
    ensureR2Configured();
    const parentId = input.parentId || null;
    await ensureFolder(parentId);

    const originalName = sanitizeCertificateName(input.file.name) || `archivo-${Date.now()}`;
    await ensureUniqueName(originalName, parentId);

    const extension = getFileExtension(originalName);
    const buffer = Buffer.from(await input.file.arrayBuffer());
    const key = generateStorageKey(
      "powerguns/certificados-dccae",
      `${Date.now()}-${randomUUID()}${extension ? `.${extension}` : ""}`,
    );
    const fileUrl = await uploadToR2(
      buffer,
      key,
      input.file.type || "application/octet-stream",
      "public, max-age=31536000, immutable",
    );

    try {
      const item = await prisma.certificateDccaeItem.create({
        data: {
          name: originalName,
          type: "file",
          parentId,
          fileUrl,
          fileKey: key,
          mimeType: input.file.type || "application/octet-stream",
          size: input.file.size,
          extension: extension || null,
        },
      });
      return serialize(item);
    } catch (error) {
      await deleteFromR2Silent(key);
      throw error;
    }
  },

  async update(id: string, input: { name?: string; parentId?: string | null }) {
    const item = await prisma.certificateDccaeItem.findUnique({ where: { id } });
    if (!item) throw new Error("El elemento no existe");

    const data: { name?: string; parentId?: string | null } = {};
    const nextParentId = input.parentId === undefined ? item.parentId : input.parentId || null;
    const nextName = input.name === undefined ? item.name : sanitizeCertificateName(input.name);
    if (!nextName) throw new Error("El nombre es obligatorio");

    if (input.parentId !== undefined) {
      await ensureFolder(nextParentId);
      if (item.type === "folder") await assertNotMovingIntoSelf(id, nextParentId);
      data.parentId = nextParentId;
    }
    if (input.name !== undefined) data.name = nextName;

    await ensureUniqueName(nextName, nextParentId, id);
    const updated = await prisma.certificateDccaeItem.update({ where: { id }, data });
    return serialize(updated);
  },

  async delete(id: string) {
    const item = await prisma.certificateDccaeItem.findUnique({ where: { id } });
    if (!item) throw new Error("El elemento no existe");

    const allItems = await prisma.certificateDccaeItem.findMany();
    const ids = new Set([id]);
    let changed = true;
    while (changed) {
      changed = false;
      for (const child of allItems) {
        if (child.parentId && ids.has(child.parentId) && !ids.has(child.id)) {
          ids.add(child.id);
          changed = true;
        }
      }
    }

    const keys = allItems
      .filter((candidate) => ids.has(candidate.id) && candidate.fileKey)
      .map((candidate) => candidate.fileKey as string);

    await prisma.certificateDccaeItem.delete({ where: { id } });
    await Promise.all(keys.map((key) => deleteFromR2Silent(key)));
    return { deleted: true };
  },
};
