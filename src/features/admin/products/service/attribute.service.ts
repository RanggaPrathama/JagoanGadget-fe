import { api } from "@/lib/axios";
import { unwrapData, unwrapPaginated } from "@/lib/api-response";
import type { ApiResponse, PaginatedResponse } from "@/lib/api-response";
import type { AttributeItem, AttributePayload } from "../types";

export type { AttributeItem, AttributePayload } from "../types";

// GET admin/attributes — fetch the global attribute catalog with optional search + pagination.
export async function getAttributesList(params?: {
  search?: string;
  page?: number;
  limit?: number;
  no_pagination?: boolean;
}) {
  const response = await api.get<PaginatedResponse<AttributeItem>>(
    "admin/attributes",
    { params },
  );
  return unwrapPaginated<AttributeItem>(response.data);
}

// POST admin/attributes — create a new global attribute (used by FieldSelectAdd).
export async function createAttribute(payload: AttributePayload) {
  const response = await api.post<ApiResponse<AttributeItem>>(
    "admin/attributes",
    payload,
  );
  return unwrapData<AttributeItem>(response.data);
}
