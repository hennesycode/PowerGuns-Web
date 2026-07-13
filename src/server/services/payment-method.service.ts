import { prisma } from "@/lib/prisma";
import type { PaymentMethodInput } from "@/lib/validations/payment-methods";

const PROVIDER_LABELS: Record<string, string> = {
  cash: "Pago en efectivo",
  daviplata: "Daviplata",
  nequi: "Nequi",
  bancolombia: "Bancolombia",
  davivienda: "Davivienda",
  bbva: "BBVA",
};

function serialize(method: {
  id: string;
  type: string;
  provider: string;
  accountNumber: string;
  accountHolderName: string;
  identificationNumber: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: method.id,
    type: method.type,
    provider: method.provider,
    providerLabel: PROVIDER_LABELS[method.provider] ?? method.provider,
    accountNumber: method.accountNumber,
    accountHolderName: method.accountHolderName,
    identificationNumber: method.identificationNumber,
    isActive: method.isActive,
    createdAt: method.createdAt.toISOString(),
    updatedAt: method.updatedAt.toISOString(),
  };
}

async function ensureCashMethod() {
  const existing = await prisma.paymentMethod.findFirst({ where: { type: "cash", provider: "cash" } });
  if (existing) return existing;

  return prisma.paymentMethod.create({
    data: {
      type: "cash",
      provider: "cash",
      accountNumber: "N/A",
      accountHolderName: "Pago en efectivo",
      isActive: true,
    },
  });
}

function sortMethods<T extends { type: string; createdAt: string }>(methods: T[]) {
  return [...methods].sort((a, b) => {
    if (a.type === "cash" && b.type !== "cash") return -1;
    if (a.type !== "cash" && b.type === "cash") return 1;
    return b.createdAt.localeCompare(a.createdAt);
  });
}

export const paymentMethodService = {
  async list() {
    await ensureCashMethod();
    const methods = await prisma.paymentMethod.findMany({ orderBy: { createdAt: "desc" } });
    return sortMethods(methods.map(serialize));
  },

  async listActivePublic() {
    await ensureCashMethod();
    const methods = await prisma.paymentMethod.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    });

    return sortMethods(methods.map(serialize)).map((method) => ({
      id: method.id,
      type: method.type,
      provider: method.provider,
      providerLabel: method.providerLabel,
    }));
  },

  async create(input: PaymentMethodInput) {
    const method = await prisma.paymentMethod.create({
      data: {
        type: input.type,
        provider: input.provider,
        accountNumber: input.accountNumber.trim(),
        accountHolderName: input.accountHolderName.trim(),
        identificationNumber: input.identificationNumber?.trim() || null,
        isActive: input.isActive,
      },
    });
    return serialize(method);
  },

  async update(id: string, input: PaymentMethodInput) {
    const method = await prisma.paymentMethod.update({
      where: { id },
      data: {
        type: input.type,
        provider: input.provider,
        accountNumber: input.accountNumber.trim(),
        accountHolderName: input.accountHolderName.trim(),
        identificationNumber: input.identificationNumber?.trim() || null,
        isActive: input.isActive,
      },
    });
    return serialize(method);
  },

  async updateStatus(id: string, isActive: boolean) {
    const method = await prisma.paymentMethod.update({
      where: { id },
      data: { isActive },
    });
    return serialize(method);
  },

  async getActiveById(id: string) {
    const method = await prisma.paymentMethod.findFirst({ where: { id, isActive: true } });
    return method ? serialize(method) : null;
  },

  async delete(id: string) {
    await prisma.paymentMethod.delete({ where: { id } });
  },
};
