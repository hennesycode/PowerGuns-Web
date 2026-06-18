import { prisma } from "@/lib/prisma";

export const packagesService = {
  async getPackages() {
    const packages = await prisma.package.findMany({ orderBy: { orderNum: "asc" } });
    return packages.map((pkg) => ({
      ...pkg,
      features: JSON.parse(pkg.features as string) as string[],
    }));
  },
};
