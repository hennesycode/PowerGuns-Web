import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";

const adapter = new PrismaMariaDb(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

const r2 = new S3Client({
  region: process.env.R2_REGION || "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const bucket = process.env.R2_BUCKET_NAME!;
const publicUrl = (process.env.R2_PUBLIC_URL || "").replace(/\/$/, "");

async function uploadPlaceholder(
  color: string,
  label: string,
  width = 1200,
  height = 1200,
): Promise<{ url: string; key: string }> {
  const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="${color}"/>
    <text x="50%" y="50%" text-anchor="middle" dy=".1em" fill="white" font-family="Arial" font-size="48" font-weight="bold">${label}</text>
  </svg>`;

  const webp = await sharp(Buffer.from(svg)).resize(width, height).webp({ quality: 60 }).toBuffer();

  const key = `powerguns/services/placeholder-${Date.now()}-${Math.random().toString(36).slice(2, 6)}.webp`;
  await r2.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: webp,
      ContentType: "image/webp",
    }),
  );

  return { url: `${publicUrl}/${key}`, key };
}

async function main() {
  console.log("Creating placeholder images...");

  const main1 = await uploadPlaceholder("#1a3a5c", "Básico Pistola");
  const main2 = await uploadPlaceholder("#5c3a1a", "Tiro Defensivo");
  const main3 = await uploadPlaceholder("#2d5c1a", "Precisión Rifle");
  const main4 = await uploadPlaceholder("#5c1a3a", "Tiro Avanzado");
  const main5 = await uploadPlaceholder("#1a5c5c", "Mujer Armada");
  const main6 = await uploadPlaceholder("#3a1a5c", "Instructor");

  const gallery = await uploadPlaceholder("#333333", "Galería", 1600, 900);

  type ServiceData = {
    name: string;
    title: string;
    slug: string;
    mainImageUrl: string;
    mainImageKey: string;
    shortDescription: string;
    longDescription: string;
    seoTitle: string;
    seoDescription: string;
    seoKeywords: string;
    tags: string;
    price: number;
    discountType: "none" | "percentage" | "fixed";
    discountValue: number;
    finalPrice: number;
    durationMinutes: number;
    includes: string[];
    isActive: boolean;
  };

  const services: ServiceData[] = [
    {
      name: "Tiro Básico con Pistola",
      title: "Tiro Básico con Pistola — Introducción al Calibre 9mm",
      slug: "tiro-basico-pistola",
      mainImageUrl: main1.url,
      mainImageKey: main1.key,
      shortDescription:
        "Curso ideal para principiantes que desean iniciarse en el tiro deportivo con pistola. Incluye instrucción, equipo y 50 disparos.",
      longDescription:
        "Perfecto para quienes nunca han disparado o tienen poca experiencia. Un instructor certificado te guiará paso a paso por los fundamentos de seguridad, postura, empuñadura, puntería y control del gatillo. Practicarás con pistolas Glock 17, Beretta 92FS y Sig Sauer P320 en nuestro polígono techado con iluminación profesional y sistema de ventilación de última generación. Al finalizar recibirás un diploma digital de participación.",
      seoTitle: "Curso de Tiro Básico con Pistola en Villavicencio | Power Guns",
      seoDescription:
        "Aprende tiro deportivo con pistola desde cero en Power Guns. Instructores certificados, 50 disparos en 9mm, equipo completo incluido. Reserva tu cupo.",
      seoKeywords: "curso tiro básico, pistola, villavicencio, principiantes, power guns",
      tags: "básico, principiante, pistola, 9mm, introducción",
      price: 90000,
      discountType: "none",
      discountValue: 0,
      finalPrice: 90000,
      durationMinutes: 60,
      includes: [
        "Instructor certificado",
        "Pistola Glock 17 / Beretta 92FS",
        "50 disparos calibre 9mm",
        "Equipo de protección completo",
        "Target de papel",
        "Diploma digital de participación",
      ],
      isActive: true,
    },
    {
      name: "Tiro Defensivo Avanzado",
      title: "Tiro Defensivo Avanzado — Técnicas de Supervivencia",
      slug: "tiro-defensivo-avanzado",
      mainImageUrl: main2.url,
      mainImageKey: main2.key,
      shortDescription:
        "Curso táctico para portadores de licencia. Cubre extracción rápida, disparo en movimiento, coberturas y simulaciones de escenarios reales.",
      longDescription:
        "Diseñado para civiles con permiso de porte que buscan llevar sus habilidades al siguiente nivel. Trabajarás con instructores ex-fuerzas especiales en drills de extracción rápida, transiciones de objetivo, disparo en movimiento, uso de coberturas y recarga táctica bajo presión. Las simulaciones se realizan con blancos electrónicos y cronometraje preciso. Se requiere experiencia previa mínima de 2 visitas al polígono o curso básico completado.",
      seoTitle: "Curso de Tiro Defensivo Avanzado en Villavicencio | Power Guns",
      seoDescription:
        "Entrenamiento táctico intensivo para portadores de licencia en Villavicencio. Instructores ex-militares, simulaciones reales, cronometraje.",
      seoKeywords: "tiro defensivo, portadores, licencia, villavicencio, táctico, power guns",
      tags: "avanzado, defensivo, táctico, portadores, licencia",
      price: 180000,
      discountType: "percentage",
      discountValue: 10,
      finalPrice: 162000,
      durationMinutes: 120,
      includes: [
        "Instructor ex-fuerzas especiales",
        "Pistola semiautomática 9mm",
        "100 disparos calibre 9mm",
        "Funda táctica",
        "Blancos electrónicos",
        "Análisis de video",
        "Certificación de tiro defensivo",
      ],
      isActive: true,
    },
    {
      name: "Precisión con Rifle",
      title: "Precisión con Rifle — Tiro a Larga Distancia",
      slug: "precision-rifle",
      mainImageUrl: main3.url,
      mainImageKey: main3.key,
      shortDescription:
        "Expertos en rifle semiautomático y cerrojo. Trabajo en distancias de 15 a 25m con plataformas AR-15, Ruger Precision y más.",
      longDescription:
        "Sumérgete en el arte del tiro de precisión con rifles. Trabajamos con plataformas AR-15 de 5.56mm, Ruger Precision Rifle en .308 y rifles de cerrojo de alta precisión. El curso cubre ajuste de miras ópticas y abiertas, control de respiración, técnica de gatillo para precisión, lectura de viento en interior y agrupación de grupos submétrica. Ideal para tiradores deportivos que buscan competir o simplemente mejorar su agrupación. Se recomienda haber tomado al menos el curso básico de pistola.",
      seoTitle: "Curso de Tiro de Precisión con Rifle | Power Guns Villavicencio",
      seoDescription:
        "Entrenamiento profesional de tiro con rifle de precisión en Villavicencio. Plataformas AR-15 y Ruger Precision, instructores certificados.",
      seoKeywords: "rifle precisión, ar-15, tiro larga distancia, villavicencio, power guns",
      tags: "rifle, precisión, ar-15, larga distancia, óptica",
      price: 220000,
      discountType: "fixed",
      discountValue: 20000,
      finalPrice: 200000,
      durationMinutes: 150,
      includes: [
        "Instructor certificado",
        "Rifle AR-15 / Ruger Precision a elección",
        "80 disparos de precisión",
        "Miras ópticas y abiertas",
        "Targets de precisión impresos",
        "Análisis de agrupación",
        "Guía de mantenimiento de rifle",
      ],
      isActive: true,
    },
    {
      name: "Tiro Avanzado Combinado",
      title: "Tiro Avanzado Combinado — Pistola + Rifle en un Solo Curso",
      slug: "tiro-avanzado-combinado",
      mainImageUrl: main4.url,
      mainImageKey: main4.key,
      shortDescription:
        "Experiencia completa que combina pistola y rifle en una sola sesión intensiva. Transiciones, cambios de estación y drills tácticos combinados.",
      longDescription:
        "El curso más completo de Power Guns. Combina 2 horas de instrucción divididas en estaciones de pistola y rifle con transiciones rápidas entre plataformas. Trabajarás en drills de cambio de arma, adquisición rápida de blanco con ambas plataformas, recarga con estrés controlado y escenarios combinados. Se utiliza cronometraje electrónico y análisis de video frame por frame para corrección de técnica. Incluye almuerzo táctico y sesión de fotos profesional.",
      seoTitle: "Curso de Tiro Avanzado Pistola y Rifle | Power Guns Villavicencio",
      seoDescription:
        "Curso intensivo combinado de pistola y rifle en Power Guns. Drills tácticos, transiciones, cronometraje y análisis de video. Reserva ahora.",
      seoKeywords: "curso combinado, pistola, rifle, avanzado, táctico, villavicencio, power guns",
      tags: "avanzado, combinado, pistola, rifle, táctico, intensivo",
      price: 320000,
      discountType: "percentage",
      discountValue: 15,
      finalPrice: 272000,
      durationMinutes: 180,
      includes: [
        "Instructor táctico certificado",
        "Pistola + Rifle a elección",
        "150 disparos (100 pistola + 50 rifle)",
        "Equipo táctico completo",
        "Almuerzo incluido",
        "Video análisis frame por frame",
        "Sesión de fotos profesional",
        "Certificado de curso avanzado",
      ],
      isActive: true,
    },
    {
      name: "Curso Mujer Armada",
      title: "Curso Mujer Armada — Tiro y Autodefensa Femenil",
      slug: "mujer-armada",
      mainImageUrl: main5.url,
      mainImageKey: main5.key,
      shortDescription:
        "Espacio exclusivo para mujeres que desean aprender tiro deportivo y defensa personal en un ambiente seguro y de confianza.",
      longDescription:
        "Un curso diseñado por y para mujeres. Ambiente exclusivo, sin presión, con instructoras femeninas certificadas. Aprenderás desde cero los fundamentos del tiro con pistola, técnicas de autodefensa aplicada, conciencia situacional y manejo seguro del arma en el hogar. Trabajamos con pistolas de menor calibre y menor peso para facilitar el aprendizaje. Todas las armas y equipos están incluidos. Al finalizar recibirás un kit de bienvenida Power Guns.",
      seoTitle: "Curso de Tiro para Mujeres en Villavicencio | Mujer Armada Power Guns",
      seoDescription:
        "Curso exclusivo de tiro y defensa personal para mujeres en Villavicencio. Ambiente seguro, instructoras certificadas, equipo incluido. Reserva.",
      seoKeywords: "mujer armada, curso tiro mujeres, defensa personal femenil, villavicencio, power guns",
      tags: "mujeres, femenil, defensa, autodefensa, principiante",
      price: 110000,
      discountType: "none",
      discountValue: 0,
      finalPrice: 110000,
      durationMinutes: 90,
      includes: [
        "Instructora certificada",
        "Pistola calibre .380 o 9mm compacta",
        "50 disparos",
        "Equipo de protección",
        "Kit de bienvenida Power Guns",
        "Guía de seguridad en el hogar",
        "Certificado de participación",
      ],
      isActive: true,
    },
    {
      name: "Instructor por un Día",
      title: "Instructor por un Día — Experiencia Premium Exclusiva",
      slug: "instructor-por-un-dia",
      mainImageUrl: main6.url,
      mainImageKey: main6.key,
      shortDescription:
        "Vive la experiencia de ser instructor por un día. Acceso VIP completo, instructor personal dedicado, armería completa y sesión de lujo.",
      longDescription:
        "La experiencia más exclusiva de Power Guns. Tendrás un instructor personal dedicado que te acompañará durante toda la jornada. Acceso completo a la armería para probar todas las plataformas disponibles: pistolas Glock, Beretta, Sig Sauer, CZ, revólveres Smith & Wesson, rifles AR-15, Ruger Precision, escopetas y más. Incluye sesión de fotos profesional con tu arma favorita, video editado de tu sesión, targets firmados, almuerzo VIP en zona privada y membresía Platinum por 3 meses.",
      seoTitle: "Experiencia VIP Instructor por un Día | Power Guns Villavicencio",
      seoDescription:
        "Experiencia premium de tiro en Villavicencio: instructor personal, armería completa, fotos profesionales, video editado y membresía Platinum.",
      seoKeywords: "experiencia vip, instructor, día, premium, armería completa, villavicencio, power guns",
      tags: "vip, premium, exclusivo, instructor personal, armería completa",
      price: 550000,
      discountType: "fixed",
      discountValue: 50000,
      finalPrice: 500000,
      durationMinutes: 300,
      includes: [
        "Instructor personal dedicado",
        "Acceso completo a la armería (10+ plataformas)",
        "300 disparos surtidos",
        "Sesión de fotos profesional",
        "Video editado de la sesión",
        "Almuerzo VIP en zona privada",
        "Targets firmados y enmarcados",
        "Membresía Platinum 3 meses",
        "Certificado de experiencia premium",
      ],
      isActive: true,
    },
  ];

  console.log(`Creating ${services.length} services...`);

  for (const s of services) {
    const existing = await prisma.trainingService.findUnique({ where: { slug: s.slug } });
    if (existing) {
      console.log(`  SKIP: "${s.name}" already exists (slug: ${s.slug})`);
      continue;
    }

    await prisma.trainingService.create({
      data: {
        name: s.name,
        title: s.title,
        slug: s.slug,
        mainImageUrl: s.mainImageUrl,
        mainImageKey: s.mainImageKey,
        shortDescription: s.shortDescription,
        longDescription: s.longDescription,
        seoTitle: s.seoTitle,
        seoDescription: s.seoDescription,
        seoKeywords: s.seoKeywords,
        tags: s.tags,
        price: s.price,
        discountType: s.discountType,
        discountValue: s.discountValue || null,
        finalPrice: s.finalPrice,
        durationMinutes: s.durationMinutes,
        includes: JSON.stringify(s.includes),
        isActive: s.isActive,
        images: {
          create: [
            {
              imageUrl: gallery.url,
              imageKey: gallery.key,
              altText: `Galería ${s.name}`,
              sortOrder: 0,
            },
            {
              imageUrl: gallery.url,
              imageKey: gallery.key,
              altText: `Galería ${s.name} 2`,
              sortOrder: 1,
            },
          ],
        },
      },
    });

    console.log(`  ✓ "${s.name}" — $${s.price.toLocaleString("es-CO")} → $${s.finalPrice.toLocaleString("es-CO")} — ${s.durationMinutes} min`);
  }

  await prisma.$disconnect();
  console.log("\nDone! 6 services created.");
}

main().catch((e) => {
  console.error("Seed error:", e);
  process.exit(1);
});
