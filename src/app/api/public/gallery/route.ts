import { NextResponse } from "next/server";
import { galleryService } from "@/server/services/gallery.service";

export async function GET() {
  try {
    const items = await galleryService.list();
    return NextResponse.json({ items });
  } catch (error) {
    console.error("[GET /api/public/gallery]", error);
    return NextResponse.json({ error: "Error al obtener galería" }, { status: 500 });
  }
}
