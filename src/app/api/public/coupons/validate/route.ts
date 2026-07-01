import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { code, subtotal } = await request.json();

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { valid: false, discountAmount: 0, message: "Código de cupón requerido" },
        { status: 400 },
      );
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.trim().toUpperCase() },
    });

    if (!coupon) {
      return NextResponse.json(
        { valid: false, discountAmount: 0, message: "Cupón inválido o expirado" },
      );
    }

    if (!coupon.isActive) {
      return NextResponse.json(
        { valid: false, discountAmount: 0, message: "Cupón no disponible actualmente" },
      );
    }

    const now = new Date();
    if (coupon.startsAt && now < coupon.startsAt) {
      return NextResponse.json(
        { valid: false, discountAmount: 0, message: "Este cupón aún no está vigente" },
      );
    }
    if (coupon.expiresAt && now > coupon.expiresAt) {
      return NextResponse.json(
        { valid: false, discountAmount: 0, message: "Este cupón ha expirado" },
      );
    }

    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json(
        { valid: false, discountAmount: 0, message: "Cupón agotado" },
      );
    }

    const numericSubtotal = Number(subtotal);
    if (isNaN(numericSubtotal) || numericSubtotal < coupon.minimumSubtotal) {
      return NextResponse.json(
        {
          valid: false,
          discountAmount: 0,
          message: `Compra mínima de ${new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(coupon.minimumSubtotal)} para usar este cupón`,
        },
      );
    }

    let discountAmount = 0;
    if (coupon.discountType === "percentage") {
      discountAmount = Math.round(numericSubtotal * (coupon.discountValue / 100));
    } else {
      discountAmount = Math.min(coupon.discountValue, numericSubtotal);
    }
    discountAmount = Math.max(0, Math.min(discountAmount, numericSubtotal));

    return NextResponse.json({
      valid: true,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount,
      message: "Cupón aplicado correctamente",
    });
  } catch (error) {
    console.error("[POST /api/public/coupons/validate]", error);
    return NextResponse.json(
      { valid: false, discountAmount: 0, message: "Error al validar cupón. Intenta de nuevo." },
      { status: 500 },
    );
  }
}
