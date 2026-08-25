// src/features/admin/setup/category/service/category.service.ts
import { api } from "@/lib/axios";
import { unwrapData, unwrapPaginated } from "@/lib/api-response";
import type { ApiResponse, PaginatedResponse } from "@/lib/api-response";
import type { CategoryItem, CategoryPayload } from "../types";

export type { CategoryItem, CategoryPayload } from "../types";

// GET admin/categories — fetch paginated category list with optional search + pagination.
export async function getCategoriesList(params?: {
  search?: string;
  page?: number;
  limit?: number;
}) {
  const response = await api.get<PaginatedResponse<CategoryItem>>("admin/categories", {
    params,
  });
  return unwrapPaginated<CategoryItem>(response.data);
}

// GET admin/categories/:categoryId — fetch single category detail by ID.
export async function getCategoryById(categoryId: string) {
  const response = await api.get<ApiResponse<CategoryItem>>(
    `admin/categories/${categoryId}`,
  );
  return unwrapData<CategoryItem>(response.data);
}

// POST admin/categories — create a new category.
export async function createCategory(payload: CategoryPayload) {
  const response = await api.post<ApiResponse<CategoryItem>>("admin/categories", payload);
  return unwrapData<CategoryItem>(response.data);
}

// PUT admin/categories/:categoryId — update an existing category.
export async function updateCategory(categoryId: string, payload: CategoryPayload) {
  const response = await api.put<ApiResponse<CategoryItem>>(
    `admin/categories/${categoryId}`,
    payload,
  );
  return unwrapData<CategoryItem>(response.data);
}

// DELETE admin/categories/:categoryId — delete a category by ID.
export async function deleteCategory(categoryId: string) {
  const response = await api.delete<ApiResponse<{ success?: boolean }>>(
    `admin/categories/${categoryId}`,
  );
  return unwrapData<{ success?: boolean }>(response.data);
}
