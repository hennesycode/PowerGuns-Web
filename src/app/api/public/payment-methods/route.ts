import { NextResponse } from "next/server";
import { paymentMethodService } from "@/server/services/payment-method.service";

export async function GET() {
  try {
    const methods = await paymentMethodService.listActivePublic();
    return NextResponse.json({ methods });
  } catch (error) {
    console.error("[GET /api/public/payment-methods]", error);
    return NextResponse.json({ error: "Error al obtener métodos de pago", methods: [] }, { status: 500 });
  }
}
