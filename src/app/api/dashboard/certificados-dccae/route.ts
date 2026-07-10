import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { activityService } from "@/server/services/activity.service";
import { certificadosDccaeService } from "@/server/services/certificados-dccae.service";
import { createCertificateFolderSchema, validateCertificateFile } from "@/lib/validations/certificados-dccae";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const parentId = searchParams.get("parentId");
    const data = await certificadosDccaeService.list(parentId);
    return NextResponse.json(data);
  } catch (error) {
    console.error("[GET /api/dashboard/certificados-dccae]", error);
    const message = error instanceof Error ? error.message : "Error al cargar certificados";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  let session = await getSession();
  try {
    if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file");
      const parentIdRaw = formData.get("parentId");
      const parentId = typeof parentIdRaw === "string" && parentIdRaw ? parentIdRaw : null;

      if (!file || !(file instanceof File)) {
        return NextResponse.json({ error: "Archivo requerido" }, { status: 400 });
      }
      validateCertificateFile(file);

      const item = await certificadosDccaeService.uploadFile({ file, parentId });
      activityService.logFromSession(session, {
        action: "certificate_file_uploaded",
        entityType: "certificate_dccae_item",
        entityId: item.id,
        entityName: item.name,
        description: `Archivo "${item.name}" cargado en Certificados DCCAE`,
        page: "/dashboard/certificados-dccae",
        section: "Certificados DCCAE",
      });
      return NextResponse.json(item, { status: 201 });
    }

    const body = await request.json();
    const validation = createCertificateFolderSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues.map((issue) => issue.message).join(", ") },
        { status: 400 },
      );
    }

    const folder = await certificadosDccaeService.createFolder(validation.data);
    activityService.logFromSession(session, {
      action: "certificate_folder_created",
      entityType: "certificate_dccae_item",
      entityId: folder.id,
      entityName: folder.name,
      description: `Carpeta "${folder.name}" creada en Certificados DCCAE`,
      page: "/dashboard/certificados-dccae",
      section: "Certificados DCCAE",
    });
    return NextResponse.json(folder, { status: 201 });
  } catch (error) {
    console.error("[POST /api/dashboard/certificados-dccae]", error);
    const message = error instanceof Error ? error.message : "Error al guardar";
    if (!session) session = await getSession();
    if (session) {
      activityService.logFromSession(session, {
        action: "certificate_item_saved",
        entityType: "certificate_dccae_item",
        description: `Error en Certificados DCCAE: ${message}`,
        status: "error",
        errorMessage: message,
        page: "/dashboard/certificados-dccae",
        section: "Certificados DCCAE",
      });
    }
    const status = message.includes("existe") || message.includes("obligatorio") || message.includes("permitido") ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
