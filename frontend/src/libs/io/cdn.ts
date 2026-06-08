import {post} from "@/libs/io/rest";

/**
 * Client für den CDN-artigen Bilddienst des Backends.
 * Bilder werden hochgeladen und als URL (/cdn/<id>.<ext>) referenziert –
 * NICHT als base64 im Dokument gespeichert.
 */

const API_BASE = (import.meta as any).env.VITE_APP_API_URL || "";

/** Macht aus einem gespeicherten Asset-Pfad eine ladbare URL. */
export function resolveAssetUrl(path?: string | null): string {
  if (!path) return "";
  // Bereits absolute URL oder (Alt-)Daten-URL unverändert lassen.
  if (/^(https?:|data:|blob:)/.test(path)) return path;
  if (path.startsWith("/cdn/")) return `${API_BASE}${path}`;
  return path;
}

/** Lädt eine Bilddatei hoch und gibt den relativen CDN-Pfad zurück. */
export async function uploadImage(file: File): Promise<string | null> {
  try {
    const dataUrl = await fileToDataURL(file);
    const [status, data] = await post<{ url: string }>("/cdn/upload", {data: dataUrl});
    if (status === 200 && data?.url) {
      return data.url;
    }
    console.error("Image upload failed", status);
    return null;
  } catch (e) {
    console.error("Image upload error", e);
    return null;
  }
}

function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
