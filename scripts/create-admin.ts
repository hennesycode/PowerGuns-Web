import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import bcrypt from "bcryptjs";

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 4) {
    console.error("Uso: pnpm exec tsx scripts/create-admin.ts <username> <email> <password> <nombre> [apellido]");
    process.exit(1);
  }

  const [username, email, password, firstName, lastName = ""] = args;

  const adapter = new PrismaMariaDb(process.env.DATABASE_URL!);
  const prisma = new PrismaClient({ adapter });

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      username,
      firstName,
      lastName,
      email,
      identificationType: "cedula",
      identificationNumber: `admin-${Date.now()}`,
      role: "administrador",
      passwordHash,
      isActive: true,
    },
  });

  console.log(`Usuario administrador creado:`);
  console.log(`  ID:       ${user.id}`);
  console.log(`  Username: ${user.username}`);
  console.log(`  Email:    ${user.email}`);
  console.log(`  Role:     ${user.role}`);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("Error:", e);
  process.exit(1);
});
