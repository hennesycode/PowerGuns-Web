import "dotenv/config";
import { S3Client, HeadBucketCommand, PutObjectCommand } from "@aws-sdk/client-s3";

const client = new S3Client({
  region: process.env.R2_REGION || "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  },
});

async function test() {
  try {
    console.log("Probing bucket:", process.env.R2_BUCKET_NAME);
    await client.send(new HeadBucketCommand({ Bucket: process.env.R2_BUCKET_NAME! }));
    console.log("Bucket found");

    const key = "__test_r2__powerguns.txt";
    await client.send(new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
      Body: "Power Guns R2 test — " + new Date().toISOString(),
      ContentType: "text/plain",
    }));
    console.log("Test file uploaded:", key);
    console.log("Cloudflare R2 connected successfully");
  } catch (err: unknown) {
    const e = err as { message?: string; Code?: string; $metadata?: object; name?: string };
    console.error("Error:", e.name || "Unknown", e.message);
    console.error("Full:", JSON.stringify(err, null, 2).slice(0, 500));
    if ((e as Record<string,string>).Code === "SignatureDoesNotMatch") console.error("Check R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY");
    if ((e as Record<string,string>).Code === "NoSuchBucket") console.error("Bucket not found:", process.env.R2_BUCKET_NAME);
  }
}

test();
