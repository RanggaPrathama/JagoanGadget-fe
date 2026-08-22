import { api } from "@/lib/axios";
import { unwrapData, unwrapPaginated } from "@/lib/api-response";
import type { ApiResponse, PaginatedResponse } from "@/lib/api-response";
import type { PrefixItem, PrefixPayload } from "../types";

// GET admin/prefixes — fetch paginated prefix list with optional search, active status, and pagination params.
export async function getPrefixesList(params?: {
  search?: string;
  show?: "active" | "inactive" | "all";
  page?: number;
  limit?: number;
}) {
  const response = await api.get<PaginatedResponse<PrefixItem>>(
    "admin/prefixes",
    {
      params,
    },
  );
  return unwrapPaginated<PrefixItem>(response.data);
}

// GET admin/prefixes/:prefixId — fetch single prefix detail by ID.
export async function getPrefixById(prefixId: string) {
  const response = await api.get<ApiResponse<PrefixItem>>(
    `admin/prefixes/${prefixId}`,
  );
  return unwrapData<PrefixItem>(response.data);
}

// POST admin/prefixes — create a new prefix entry.
export async function createPrefix(payload: PrefixPayload) {
  const response = await api.post<ApiResponse<PrefixItem>>(
    "admin/prefixes",
    payload,
  );
  return unwrapData<PrefixItem>(response.data);
}

// PUT admin/prefixes/:prefixId — update an existing prefix entry.
export async function updatePrefix(prefixId: string, payload: PrefixPayload) {
  const response = await api.put<ApiResponse<PrefixItem>>(
    `admin/prefixes/${prefixId}`,
    payload,
  );
  return unwrapData<PrefixItem>(response.data);
}

// DELETE admin/prefixes/:prefixId — delete a prefix entry by ID.
export async function deletePrefix(prefixId: string) {
  const response = await api.delete<ApiResponse<{ success?: boolean }>>(
    `admin/prefixes/${prefixId}`,
  );
  return unwrapData<{ success?: boolean }>(response.data);
}
