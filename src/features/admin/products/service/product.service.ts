import { api } from "@/lib/axios";
import { unwrapData, unwrapPaginated } from "@/lib/api-response";
import type { ApiResponse, PaginatedResponse } from "@/lib/api-response";
import type { ProductItem, ProductPayload } from "../types";

export type { ProductItem, ProductPayload } from "../types";

// GET admin/products — fetch the paginated product list with optional search, status, and pagination.
export async function getProductsList(params?: {
  search?: string;
  show?: "active" | "inactive";
  page?: number;
  limit?: number;
  no_pagination?: boolean;
}) {
  const response = await api.get<PaginatedResponse<ProductItem>>(
    "admin/products",
    { params },
  );
  return unwrapPaginated<ProductItem>(response.data);
}

// GET admin/products/:productId — fetch a single product with its full SKU matrix.
export async function getProductById(productId: string) {
  const response = await api.get<ApiResponse<ProductItem>>(
    `admin/products/${productId}`,
  );
  return unwrapData<ProductItem>(response.data);
}

// POST admin/products — create a new product with its SKUs.
export async function createProduct(payload: ProductPayload) {
  const response = await api.post<ApiResponse<ProductItem>>(
    "admin/products",
    payload,
  );
  return unwrapData<ProductItem>(response.data);
}

// PUT admin/products/:productId — update a product's scalar fields only (SKU matrix not editable via API).
export async function updateProduct(productId: string, payload: ProductPayload) {
  const response = await api.put<ApiResponse<ProductItem>>(
    `admin/products/${productId}`,
    payload,
  );
  return unwrapData<ProductItem>(response.data);
}

// DELETE admin/products/:productId — delete a product (cascades SKUs, images, attribute values).
export async function deleteProduct(productId: string) {
  const response = await api.delete<ApiResponse<{ success?: boolean }>>(
    `admin/products/${productId}`,
  );
  return unwrapData<{ success?: boolean }>(response.data);
}
