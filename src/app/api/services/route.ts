import { NextResponse } from "next/server";
import { servicesService } from "@/server/services/service.service";

export async function GET() {
  const services = await servicesService.getServices();
  return NextResponse.json(services);
}
