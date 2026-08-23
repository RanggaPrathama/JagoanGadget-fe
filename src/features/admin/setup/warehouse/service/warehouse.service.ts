import { api } from "@/lib/axios";
import { unwrapData, unwrapPaginated } from "@/lib/api-response";
import type { ApiResponse, PaginatedResponse } from "@/lib/api-response";
import type { WarehouseItem, WarehousePayload } from "../types";
export type { WarehouseItem, WarehousePayload } from "../types";

// GET admin/warehouses — fetch the paginated warehouse list with optional search, active status, and pagination params.
export async function getWarehousesList(params?: {
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
  no_pagination?: boolean;
}) {
  const response = await api.get<PaginatedResponse<WarehouseItem>>(
    "admin/warehouses",
    { params },
  );
  return unwrapPaginated<WarehouseItem>(response.data);
}

// GET admin/warehouses/:id — fetch a single warehouse detail by ID.
export async function getWarehouseById(id: string) {
  const response = await api.get<ApiResponse<WarehouseItem>>(
    `admin/warehouses/${id}`,
  );
  return unwrapData<WarehouseItem>(response.data);
}

// POST admin/warehouses — create a new warehouse.
export async function createWarehouse(payload: WarehousePayload) {
  const response = await api.post<ApiResponse<WarehouseItem>>(
    "admin/warehouses",
    payload,
  );
  return unwrapData<WarehouseItem>(response.data);
}

// PUT admin/warehouses/:id — update an existing warehouse.
export async function updateWarehouse(id: string, payload: WarehousePayload) {
  const response = await api.put<ApiResponse<WarehouseItem>>(
    `admin/warehouses/${id}`,
    payload,
  );
  return unwrapData<WarehouseItem>(response.data);
}

// DELETE admin/warehouses/:id — delete a warehouse by ID.
export async function deleteWarehouse(id: string) {
  const response = await api.delete<ApiResponse<{ success?: boolean }>>(
    `admin/warehouses/${id}`,
  );
  return unwrapData<{ success?: boolean }>(response.data);
}
