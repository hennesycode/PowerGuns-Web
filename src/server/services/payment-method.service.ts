import { prisma } from "@/lib/prisma";
import type { PaymentMethodInput } from "@/lib/validations/payment-methods";

const PROVIDER_LABELS: Record<string, string> = {
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

export const paymentMethodService = {
  async list() {
    const methods = await prisma.paymentMethod.findMany({ orderBy: { createdAt: "desc" } });
    return methods.map(serialize);
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

  async delete(id: string) {
    await prisma.paymentMethod.delete({ where: { id } });
  },
};
