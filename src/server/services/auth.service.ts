"use server";

import { prisma } from "@/lib/prisma";
import {
  hashPassword,
  comparePassword,
  createToken,
} from "@/lib/auth";

interface RegisterInput {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  identificationType: "cedula" | "pasaporte" | "cedula_extranjeria";
  identificationNumber: string;
  role: "administrador" | "finanzas" | "editor" | "cliente" | "instructor";
  password: string;
}

interface LoginInput {
  email: string;
  password: string;
  ipAddress?: string;
}

export async function authRegister(input: RegisterInput) {
  const existing = await prisma.user.findFirst({
    where: {
      OR: [
        { username: input.username },
        { email: input.email },
        { identificationNumber: input.identificationNumber },
      ],
    },
  });

  if (existing) {
    if (existing.email === input.email) {
      return { error: "El correo electrónico ya está registrado" };
    }
    if (existing.username === input.username) {
      return { error: "El nombre de usuario ya está en uso" };
    }
    return { error: "El número de identificación ya está registrado" };
  }

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
      passwordHash,
    },
    select: {
      id: true,
      username: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      avatarUrl: true,
    },
  });

  const token = await createToken({
    userId: user.id,
    username: user.username,
    role: user.role,
  });

  return { user, token };
}

export async function authLogin(input: LoginInput) {
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: input.email }, { username: input.email }],
    },
  });

  // Record attempt
  await prisma.loginAttempt.create({
    data: {
      userId: user?.id ?? null,
      email: input.email,
      ipAddress: input.ipAddress ?? null,
      success: false,
    },
  });

  if (!user) {
    return { error: "Credenciales inválidas o acceso temporalmente restringido" };
  }

  if (!user.isActive) {
    return { error: "Credenciales inválidas o acceso temporalmente restringido" };
  }

  const valid = await comparePassword(input.password, user.passwordHash);
  if (!valid) {
    return { error: "Credenciales inválidas o acceso temporalmente restringido" };
  }

  // Mark last attempt as success
  await prisma.loginAttempt.create({
    data: {
      userId: user.id,
      email: input.email,
      ipAddress: input.ipAddress ?? null,
      success: true,
    },
  });

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  const token = await createToken({
    userId: user.id,
    username: user.username,
    role: user.role,
  });

  return {
    user: {
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
    },
    token,
  };
}

export async function authMe(userId: number) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      avatarUrl: true,
      isActive: true,
      lastLoginAt: true,
      createdAt: true,
    },
  });

  if (!user || !user.isActive) return null;
  return user;
}
