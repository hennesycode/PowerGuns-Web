import { NextResponse } from "next/server";
import { packagesService } from "@/server/services/package.service";

export async function GET() {
  const packages = await packagesService.getPackages();
  return NextResponse.json(packages);
}
