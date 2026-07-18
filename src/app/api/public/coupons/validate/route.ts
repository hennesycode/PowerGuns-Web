import { NextResponse } from "next/server";
import { couponService } from "@/server/services/coupon.service";

export async function POST(request: Request) {
  try {
    const { code, subtotal } = await request.json();

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { valid: false, discountAmount: 0, message: "Código de cupón requerido" },
        { status: 400 },
      );
    }

    const numericSubtotal = Number(subtotal);
    if (isNaN(numericSubtotal)) return NextResponse.json({ valid: false, discountAmount: 0, message: "Subtotal inválido" });

    const result = await couponService.validate(code, numericSubtotal, null, { skipCustomerRules: true });
    if (!result.valid) return NextResponse.json({ valid: false, discountAmount: 0, message: result.message });

    return NextResponse.json({
      valid: true,
      code: result.code,
      discountType: result.discountType,
      discountValue: result.discountValue,
      discountAmount: result.discountAmount,
      message: result.message,
    });
  } catch (error) {
    console.error("[POST /api/public/coupons/validate]", error);
    return NextResponse.json(
      { valid: false, discountAmount: 0, message: "Error al validar cupón. Intenta de nuevo." },
      { status: 500 },
    );
  }
}
