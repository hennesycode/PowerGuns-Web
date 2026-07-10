import { prisma } from "@/lib/prisma";
import { comparePassword, hashPassword } from "@/lib/auth";
import type { AdminCreateUserInput, AdminUpdateUserInput, ProfilePasswordInput, ProfileUpdateInput } from "@/lib/validations";

const userSelect = {
  id: true,
  username: true,
  firstName: true,
  lastName: true,
  email: true,
  identificationType: true,
  identificationNumber: true,
  role: true,
  isActive: true,
  avatarUrl: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
};

function serializeUser(user: {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  identificationType: string;
  identificationNumber: string;
  role: string;
  isActive: boolean;
  avatarUrl: string | null;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    ...user,
    lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

async function assertUniqueUserFields(input: {
  username: string;
  email: string;
  identificationNumber: string;
}, excludeUserId?: number) {
  const existing = await prisma.user.findFirst({
    where: {
      OR: [
        { username: input.username },
        { email: input.email },
        { identificationNumber: input.identificationNumber },
      ],
      ...(excludeUserId ? { NOT: { id: excludeUserId } } : {}),
    },
    select: { username: true, email: true, identificationNumber: true },
  });

  if (!existing) return;
  if (existing.email === input.email) throw new Error("El correo electrónico ya está registrado");
  if (existing.username === input.username) throw new Error("El nombre de usuario ya está en uso");
  throw new Error("El número de identificación ya está registrado");
}

export const userService = {
  async list() {
    const users = await prisma.user.findMany({
      orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
      select: userSelect,
    });
    return users.map(serializeUser);
  },

  async create(input: AdminCreateUserInput) {
    await assertUniqueUserFields(input);
    const passwordHash = await hashPassword(input.password);
    const user = await prisma.user.create({
      data: {
        username: input.username,
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        identificationType: input.identificationType,
        identificationNumber: input.identificationNumber,
        role: input.role,
        isActive: input.isActive,
        passwordHash,
      },
      select: userSelect,
    });
    return serializeUser(user);
  },

  async getProfile(id: number) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: userSelect,
    });
    if (!user || !user.isActive) throw new Error("Usuario no encontrado");
    return serializeUser(user);
  },

  async updateProfile(id: number, input: ProfileUpdateInput) {
    const existing = await prisma.user.findUnique({
      where: { id },
      select: { id: true, username: true, isActive: true },
    });
    if (!existing || !existing.isActive) throw new Error("Usuario no encontrado");

    await assertUniqueUserFields({
      username: existing.username,
      email: input.email,
      identificationNumber: input.identificationNumber,
    }, id);

    const user = await prisma.user.update({
      where: { id },
      data: {
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        identificationType: input.identificationType,
        identificationNumber: input.identificationNumber,
      },
      select: userSelect,
    });
    return serializeUser(user);
  },

  async updateOwnPassword(id: number, input: ProfilePasswordInput) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, passwordHash: true, isActive: true },
    });
    if (!user || !user.isActive) throw new Error("Usuario no encontrado");

    const valid = await comparePassword(input.currentPassword, user.passwordHash);
    if (!valid) throw new Error("La contraseña actual no es correcta");

    await prisma.user.update({
      where: { id },
      data: { passwordHash: await hashPassword(input.newPassword) },
    });
  },

  async update(id: number, input: AdminUpdateUserInput) {
    const existing = await prisma.user.findUnique({
      where: { id },
      select: { id: true, role: true, isActive: true },
    });
    if (!existing) throw new Error("Usuario no encontrado");

    if (existing.role === "administrador" && (input.role !== "administrador" || !input.isActive)) {
      const activeAdmins = await prisma.user.count({
        where: { role: "administrador", isActive: true, NOT: { id } },
      });
      if (activeAdmins === 0) throw new Error("Debe existir al menos un administrador activo");
    }

    await assertUniqueUserFields(input, id);
    const password = input.password?.trim();
    const user = await prisma.user.update({
      where: { id },
      data: {
        username: input.username,
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        identificationType: input.identificationType,
        identificationNumber: input.identificationNumber,
        role: input.role,
        isActive: input.isActive,
        ...(password ? { passwordHash: await hashPassword(password) } : {}),
      },
      select: userSelect,
    });
    return serializeUser(user);
  },

  async delete(id: number, currentUserId: number) {
    if (id === currentUserId) throw new Error("No puedes eliminar tu propio usuario");

    const existing = await prisma.user.findUnique({
      where: { id },
      select: { id: true, firstName: true, lastName: true, username: true, role: true, isActive: true },
    });
    if (!existing) throw new Error("Usuario no encontrado");

    if (existing.role === "administrador" && existing.isActive) {
      const activeAdmins = await prisma.user.count({
        where: { role: "administrador", isActive: true, NOT: { id } },
      });
      if (activeAdmins === 0) throw new Error("Debe existir al menos un administrador activo");
    }

    await prisma.$transaction([
      prisma.loginAttempt.updateMany({ where: { userId: id }, data: { userId: null } }),
      prisma.reservation.updateMany({ where: { userId: id }, data: { userId: null } }),
      prisma.user.delete({ where: { id } }),
    ]);

    return existing;
  },
};
