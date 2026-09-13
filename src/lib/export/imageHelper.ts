import fs from "fs";
import path from "path";

export interface ImageResult {
  buffer: Buffer;
  type: "png" | "jpg" | "gif" | "bmp";
  base64DataUrl: string;
}

function detectImageType(url: string, buffer: Buffer): "png" | "jpg" | "gif" | "bmp" {
  const lower = url.toLowerCase();
  if (lower.includes(".jpg") || lower.includes(".jpeg") || lower.includes("image/jpeg")) return "jpg";
  if (lower.includes(".gif") || lower.includes("image/gif")) return "gif";
  if (lower.includes(".bmp") || lower.includes("image/bmp")) return "bmp";
  
  // Inspect magic bytes
  if (buffer.length >= 4) {
    if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return "jpg";
    if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) return "gif";
    if (buffer[0] === 0x42 && buffer[1] === 0x4d) return "bmp";
  }
  return "png";
}

export async function getImageData(url?: string | null): Promise<ImageResult | null> {
  if (!url || typeof url !== "string") return null;

  try {
    let buf: Buffer | null = null;

    // 1. Data URL
    if (url.startsWith("data:image/")) {
      const parts = url.split(",");
      if (parts[1]) {
        buf = Buffer.from(parts[1], "base64");
      }
    } else if (url.startsWith("/")) {
      // 2. Local uploaded file (e.g. /uploads/...)
      const cleanRelative = url.replace(/^\/+/, "");
      const localPath = path.join(process.cwd(), "public", cleanRelative);
      if (fs.existsSync(localPath)) {
        buf = fs.readFileSync(localPath);
      }
    } else if (url.startsWith("http://") || url.startsWith("https://")) {
      // 3. Remote URL
      const res = await fetch(url);
      if (res.ok) {
        const arr = await res.arrayBuffer();
        buf = Buffer.from(arr);
      }
    }

    if (buf && buf.length > 0) {
      const type = detectImageType(url, buf);
      const mime = type === "jpg" ? "image/jpeg" : `image/${type}`;
      const base64DataUrl = `data:${mime};base64,${buf.toString("base64")}`;
      return { buffer: buf, type, base64DataUrl };
    }
  } catch (err) {
    console.warn("Could not load image data for export:", err);
  }

  return null;
}
