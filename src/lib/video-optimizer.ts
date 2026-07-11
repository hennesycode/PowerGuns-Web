import { execFile } from "node:child_process";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export const ALLOWED_VIDEO_TYPES = ["video/mp4"];
export const MAX_VIDEO_UPLOAD_SIZE = 150 * 1024 * 1024;

export function validateVideo(file: File): void {
  if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
    throw new Error("Formato no permitido. Usa videos MP4.");
  }
  if (file.size > MAX_VIDEO_UPLOAD_SIZE) {
    throw new Error(`El video es demasiado grande. Máximo ${MAX_VIDEO_UPLOAD_SIZE / 1024 / 1024} MB`);
  }
}

export async function optimizeMp4(buffer: Buffer): Promise<Buffer> {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "powerguns-gallery-"));
  const input = path.join(tempDir, "input.mp4");
  const output = path.join(tempDir, "output.mp4");

  try {
    await fs.writeFile(input, buffer);
    await execFileAsync("ffmpeg", [
      "-y",
      "-i",
      input,
      "-vf",
      "scale='min(1280,iw)':-2",
      "-c:v",
      "libx264",
      "-preset",
      "medium",
      "-crf",
      "28",
      "-movflags",
      "+faststart",
      "-c:a",
      "aac",
      "-b:a",
      "96k",
      output,
    ], { windowsHide: true });

    return await fs.readFile(output);
  } catch (error) {
    throw new Error(error instanceof Error ? `No se pudo optimizar el video: ${error.message}` : "No se pudo optimizar el video");
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
}
