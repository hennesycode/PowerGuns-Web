import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

function getR2Client(): S3Client {
  return new S3Client({
    region: process.env.R2_REGION || "auto",
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });
}

export async function uploadToR2(
  buffer: Buffer,
  key: string,
  contentType: string,
  cacheControl?: string,
): Promise<string> {
  const client = getR2Client();
  const bucket = process.env.R2_BUCKET_NAME!;

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      CacheControl: cacheControl,
    }),
  );

  return getR2PublicUrl(key);
}

export async function deleteFromR2(key: string): Promise<void> {
  const client = getR2Client();
  const bucket = process.env.R2_BUCKET_NAME!;

  await client.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    }),
  );
}

export async function deleteFromR2Silent(key: string): Promise<void> {
  try {
    await deleteFromR2(key);
  } catch {
    // Silenciar errores al borrar imágenes antiguas
  }
}

export function getR2PublicUrl(key: string): string {
  const publicUrl = process.env.R2_PUBLIC_URL;
  if (publicUrl) {
    return `${publicUrl.replace(/\/$/, "")}/${key}`;
  }
  return key;
}

export function generateStorageKey(folder: string, filename: string): string {
  const safeFolder = folder.replace(/^\/+|\/+$/g, "");
  return `${safeFolder}/${filename}`;
}
