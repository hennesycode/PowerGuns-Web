import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();

async function main() {
  // Services
  await prisma.service.createMany({
    data: [
      {
        name: "Tiro con Pistola",
        description:
          "Glock, Beretta, Sig Sauer, CZ y más. Modalidades de tiro de precisión y velocidad. Munición incluida. Apto para todos los niveles desde principiantes hasta avanzados.",
        icon: "target",
        orderNum: 1,
      },
      {
        name: "Tiro con Rifle",
        description:
          "Plataformas AR, bolt-action y rifles de asalto. Distancias de 15 a 25 m. Cabinas acústicas con sistema de ventilación industrial.",
        icon: "crosshair",
        orderNum: 2,
      },
      {
        name: "Defensa Personal",
        description:
          "Cursos prácticos para portadores de licencia. Técnicas de manejo seguro, tiro de estrés, retención de arma y situaciones reales. Instructores ex-fuerzas especiales.",
        icon: "shield",
        orderNum: 3,
      },
      {
        name: "Eventos Corporativos",
        description:
          "Team building con experiencia de tiro real. Grupos empresariales, fuerzas de seguridad, despedidas, cumpleaños y celebraciones especiales.",
        icon: "users",
        orderNum: 4,
      },
    ],
  });

  // Packages
  await prisma.package.createMany({
    data: [
      {
        name: "INICIACIÓN",
        tier: "NIVEL 01",
        tierLevel: 1,
        description: "Paquete perfecto para quienes quieren experimentar el tiro deportivo por primera vez.",
        price: 85000,
        unit: "COP por persona",
        features: JSON.stringify([
          "50 disparos calibre 9mm",
          "1 pistola a elección",
          "Instrucción de seguridad básica",
          "Equipo de protección completo",
          "Duración: ~45 minutos",
        ]),
        duration: "45 min",
        isPopular: false,
        orderNum: 1,
      },
      {
        name: "TÁCTICO",
        tier: "NIVEL 02",
        tierLevel: 2,
        description: "La experiencia más popular. Combina pistola y rifle con instrucción personalizada.",
        price: 165000,
        unit: "COP por persona",
        features: JSON.stringify([
          "100 disparos — pistola + rifle",
          "2 armas a elección",
          "Instrucción técnica personalizada",
          "Video de tu sesión de tiro",
          "Targets impresos de recuerdo",
          "Duración: ~90 minutos",
        ]),
        duration: "90 min",
        isPopular: true,
        orderNum: 2,
      },
      {
        name: "ELITE",
        tier: "NIVEL 03",
        tierLevel: 3,
        description: "Acceso total a la armería con instructor dedicado exclusivo y rango privado.",
        price: 280000,
        unit: "COP por persona",
        features: JSON.stringify([
          "200 disparos — sin restricción de calibre",
          "Acceso completo a la armería",
          "Instructor dedicado exclusivo",
          "Sesión de fotos profesional",
          "Cronometraje y análisis de tiro",
          "Rango privado disponible",
          "Duración: ~3 horas",
        ]),
        duration: "3 horas",
        isPopular: false,
        orderNum: 3,
      },
    ],
  });

  // Populate next 30 days of availability
  const today = new Date();
  const timeSlots = [
    { start: "08:00", end: "10:00" },
    { start: "10:00", end: "12:00" },
    { start: "14:00", end: "16:00" },
    { start: "16:00", end: "18:00" },
  ];

  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    if (date.getDay() === 0) {
      // Sunday: only 2 morning slots
      timeSlots.slice(0, 2).forEach(async (slot) => {
        await prisma.availabilitySlot.create({
          data: {
            date,
            startTime: slot.start,
            endTime: slot.end,
            slots: 4,
          },
        });
      });
    } else {
      timeSlots.forEach(async (slot) => {
        await prisma.availabilitySlot.create({
          data: {
            date,
            startTime: slot.start,
            endTime: slot.end,
            slots: 6,
          },
        });
      });
    }
  }

  console.log("Seed completed successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
