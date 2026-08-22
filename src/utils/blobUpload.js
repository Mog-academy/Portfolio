import { upload } from "@vercel/blob/client";

export const DEFAULT_API_BASE = "https://portfolio-bice-kappa-24.vercel.app";

export function getApiBase() {
  const fromEnv = import.meta.env.VITE_API_URL;
  if (fromEnv) return String(fromEnv).replace(/\/$/, "");
  return DEFAULT_API_BASE;
}

function dataUrlToFile(dataUrl, filename) {
  const [header, base64] = dataUrl.split(",");
  const mimeMatch = header?.match(/data:([^;]+)/);
  const mime = mimeMatch?.[1] || "application/octet-stream";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new File([bytes], filename, { type: mime });
}

/**
 * Upload a data-URL media file directly to Vercel Blob (bypasses 4.5MB function limit).
 * Returns the public blob URL.
 */
export async function uploadDataUrl(dataUrl, filename) {
  const file = dataUrlToFile(dataUrl, filename);
  const handleUploadUrl = `${getApiBase()}/api/upload`;
  const isVideo = file.type.startsWith("video/");

  const blob = await upload(`project_images/${filename}`, file, {
    access: "public",
    handleUploadUrl,
    multipart: isVideo || file.size > 4 * 1024 * 1024,
  });

  return blob.url;
}
