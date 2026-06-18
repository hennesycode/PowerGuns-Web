import { prisma } from "@/lib/prisma";

export const servicesService = {
  async getServices() {
    const services = await prisma.service.findMany({ orderBy: { orderNum: "asc" } });
    return services;
  },
};
