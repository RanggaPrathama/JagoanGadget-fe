import { api } from "@/lib/axios";
import { unwrapPaginated, unwrapData } from "@/lib/api-response";
import type { PaginatedResponse, ApiResponse } from "@/lib/api-response";
import type { PermissionItem, PermissionPayload } from "../types";
// Re-export domain types so callers importing from this file keep working.
export type { PermissionItem, PermissionPayload } from "../types";

// Fetch a paginated permission list, optionally filtered by search/menu.
export async function getPermissions(params?: {
  search?: string;
  menuId?: string;
  menuIds?: string[];
  page?: number;
  limit?: number;
  no_pagination?: boolean;
}) {
  const response = await api.get<PaginatedResponse<PermissionItem>>(
    "admin/permissions",
    {
      params: {
        ...params,
        menuIds: params?.menuIds?.join(","),
      },
    },
  );
  return unwrapPaginated<PermissionItem>(response.data);
}

// Fetch a single permission by id.
export async function getPermissionById(permissionId: string) {
  const response = await api.get<ApiResponse<PermissionItem>>(
    `admin/permissions/${permissionId}`,
  );
  return unwrapData<PermissionItem>(response.data);
}

// Create a new permission.
export async function createPermission(payload: PermissionPayload) {
  const response = await api.post<ApiResponse<PermissionItem>>(
    "admin/permissions",
    payload,
  );
  return unwrapData<PermissionItem>(response.data);
}

// Update an existing permission.
export async function updatePermission(
  permissionId: string,
  payload: PermissionPayload,
) {
  const response = await api.put<ApiResponse<PermissionItem>>(
    `admin/permissions/${permissionId}`,
    payload,
  );
  return unwrapData<PermissionItem>(response.data);
}

// Delete a permission by id.
export async function deletePermission(permissionId: string) {
  const response = await api.delete<ApiResponse<{ success?: boolean }>>(
    `admin/permissions/${permissionId}`,
  );
  return unwrapData<{ success?: boolean }>(response.data);
}
