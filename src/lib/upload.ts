/**
 * File upload rules — mirrors backend `storage.constants.ts` (JagoanGadget-be).
 * Images max 2MB, documents max 5MB. Type gate by MIME, with extension fallback
 * for browsers that report an empty `File.type`.
 */

export const IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
]);

export const DOCUMENT_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
]);

export const MAX_IMAGE_BYTES = 2 * 1024 * 1024; // 2 MB
export const MAX_DOCUMENT_BYTES = 5 * 1024 * 1024; // 5 MB

const IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "gif", "webp", "svg"]);
const DOCUMENT_EXTENSIONS = new Set(["pdf", "doc", "docx", "xls", "xlsx"]);

export type UploadFileKind = "image" | "document" | "unknown";

/**
 * Validate a file against the upload rules.
 * Returns an Indonesian error message, or `null` when the file is accepted.
 */
export function validateUploadFile(file: File): string | null {
  const type = file.type.toLowerCase();

  if (IMAGE_MIME_TYPES.has(type)) {
    if (file.size > MAX_IMAGE_BYTES) return "Ukuran gambar maksimal 2MB.";
    return null;
  }

  if (DOCUMENT_MIME_TYPES.has(type)) {
    if (file.size > MAX_DOCUMENT_BYTES) return "Ukuran dokumen maksimal 5MB.";
    return null;
  }

  // Extension fallback for browsers with empty `file.type`.
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (IMAGE_EXTENSIONS.has(ext)) {
    if (file.size > MAX_IMAGE_BYTES) return "Ukuran gambar maksimal 2MB.";
    return null;
  }
  if (DOCUMENT_EXTENSIONS.has(ext)) {
    if (file.size > MAX_DOCUMENT_BYTES) return "Ukuran dokumen maksimal 5MB.";
    return null;
  }

  return "Tipe file tidak didukung. Gunakan gambar (JPG, PNG, GIF, WEBP, SVG) atau dokumen (PDF, DOC, DOCX, XLS, XLSX).";
}

function getExtensionFromUrl(url: string): string {
  try {
    const pathname = new URL(url, window.location.origin).pathname;
    return pathname.split(".").pop()?.toLowerCase() ?? "";
  } catch {
    return "";
  }
}

/** Detect whether a stored file URL points to an image or a document. */
export function getFileKindFromUrl(url: string): UploadFileKind {
  const ext = getExtensionFromUrl(url);
  if (IMAGE_EXTENSIONS.has(ext)) return "image";
  if (DOCUMENT_EXTENSIONS.has(ext)) return "document";
  return "unknown";
}

/** Extract the file name from a stored file URL. */
export function getFileNameFromUrl(url: string): string {
  try {
    const pathname = new URL(url, window.location.origin).pathname;
    const name = pathname.split("/").filter(Boolean).pop() ?? url;
    return decodeURIComponent(name);
  } catch {
    return url;
  }
}
