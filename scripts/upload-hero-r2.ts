import "dotenv/config";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const client = new S3Client({
  region: process.env.R2_REGION || "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  },
});

const dir = "public/media/hero";
const files = readdirSync(dir).filter((f) => f.endsWith(".web.mp4"));

async function main() {
  for (const file of files) {
    const path = join(dir, file);
    const body = readFileSync(path);
    const sizeMB = (body.length / (1024 * 1024)).toFixed(2);
    console.log(`Uploading ${file} (${sizeMB} MB)...`);

    try {
      await client.send(
        new PutObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME!,
          Key: `hero/${file}`,
          Body: body,
          ContentType: "video/mp4",
          CacheControl: "public, max-age=31536000, immutable",
        })
      );
      console.log(`  -> ${process.env.R2_PUBLIC_URL}/hero/${file}`);
    } catch (e: unknown) {
      console.error(`  FAILED: ${(e as Error).message}`);
    }
  }
}

main().then(() => console.log("Done")).catch(console.error);
