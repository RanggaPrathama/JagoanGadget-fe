import { api } from "@/lib/axios";
import { unwrapData, unwrapPaginated } from "@/lib/api-response";
import type { ApiResponse, PaginatedResponse } from "@/lib/api-response";
import type { BrandItem, BrandPayload } from "../types";

export type { BrandItem, BrandPayload } from "../types";

// GET admin/brands — fetch paginated brand list with optional search + pagination.
export async function getBrandsList(params?: {
  search?: string;
  page?: number;
  limit?: number;
}) {
  const response = await api.get<PaginatedResponse<BrandItem>>("admin/brands", {
    params,
  });
  return unwrapPaginated<BrandItem>(response.data);
}

// GET admin/brands/:brandId — fetch single brand detail by ID.
export async function getBrandById(brandId: string) {
  const response = await api.get<ApiResponse<BrandItem>>(`admin/brands/${brandId}`);
  return unwrapData<BrandItem>(response.data);
}

// POST admin/brands — create a new brand.
export async function createBrand(payload: BrandPayload) {
  const response = await api.post<ApiResponse<BrandItem>>("admin/brands", payload);
  return unwrapData<BrandItem>(response.data);
}

// PUT admin/brands/:brandId — update an existing brand.
export async function updateBrand(brandId: string, payload: BrandPayload) {
  const response = await api.put<ApiResponse<BrandItem>>(
    `admin/brands/${brandId}`,
    payload,
  );
  return unwrapData<BrandItem>(response.data);
}

// DELETE admin/brands/:brandId — delete a brand by ID.
export async function deleteBrand(brandId: string) {
  const response = await api.delete<ApiResponse<{ success?: boolean }>>(
    `admin/brands/${brandId}`,
  );
  return unwrapData<{ success?: boolean }>(response.data);
}
