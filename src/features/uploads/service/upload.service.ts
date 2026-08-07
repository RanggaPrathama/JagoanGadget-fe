import { api } from "@/lib/axios";
import { unwrapData } from "@/lib/api-response";
import { config } from "@/config/config";
import type {
  PresignResponse,
  UploadPurpose,
  UploadTempResult,
} from "../types";
import { registerMockUploadUrl } from "./upload.mock";

/**
 * request a presigned upload URL for a purpose.
 * Relative path resolves against `apiBaseUrl`; `withCredentials` sends the
 * Better Auth session cookie, and the instance's default JSON header carries
 * the `{ purpose }` body.
 */
export async function presignUpload(
  purpose: UploadPurpose,
): Promise<PresignResponse> {
  const response = await api.post<{ data?: PresignResponse }>(
    "uploads/presign",
    { purpose },
  );
  const data = unwrapData<PresignResponse>(response.data);
  if (!data?.uploadUrl || !data.token) {
    throw new Error("Signed URL tidak diterima dari server. Coba lagi.");
  }
  return data;
}

/**
 * PUT the raw file bytes to the signed URL.
 * Uses plain `fetch` (not the axios instance): the signed URL is anonymous and
 * cross-origin, so we must NOT send the axios JSON content-type default or trip
 * the 401-redirect interceptor. `Content-Type` must match the file's MIME.
 */
export async function putTempFile(
  uploadUrl: string,
  file: File,
): Promise<UploadTempResult> {
  const response = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": file.type || "application/octet-stream",
    },
    body: file,
  });

  if (!response.ok) {
    throw new Error("Gagal mengunggah file. Coba lagi.");
  }

  let data: UploadTempResult | null = null;
  try {
    data = (await response.json()) as UploadTempResult;
  } catch {
    // Some signed-URL hosts return 200 with an empty body — leave data null.
  }

  if (!data?.tempKey) {
    throw new Error("Key file sementara tidak diterima dari server. Coba lagi.");
  }
  return data;
}

/** Full presigned-upload flow: request signed URL, then PUT the file bytes. */
export async function uploadTempFile(
  file: File,
  purpose: UploadPurpose,
): Promise<UploadTempResult> {
  // Mock: no backend, so hand out a tempKey backed by an object URL instead of
  // the presign → PUT round-trip. Removed when config.mockBackend=false.
  if (config.mockBackend) {
    const tempKey = `mock/${purpose}/${Date.now()}-${file.name}`;
    registerMockUploadUrl(tempKey, URL.createObjectURL(file));
    return {
      tempKey,
      filename: file.name,
      mimeType: file.type,
      size: file.size,
    };
  }

  const presign = await presignUpload(purpose);
  return putTempFile(presign.uploadUrl, file);
}
