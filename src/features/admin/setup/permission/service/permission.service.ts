import { api } from "@/lib/axios";
import { unwrapPaginated, unwrapData } from "@/lib/api-response";
import type { PaginatedResponse, ApiResponse } from "@/lib/api-response";
import type { MenuItem } from "@/features/admin/setup/menu/service/menu.service";

export type PermissionItem = {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  menuId?: string | null;
  menuName?: string | null;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  menu: MenuItem;
};

export type PermissionPayload = {
  name: string;
  code: string;
  description?: string | null;
  menuId?: string | null;
};

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

export async function getPermissionById(permissionId: string) {
  const response = await api.get<ApiResponse<PermissionItem>>(
    `admin/permissions/${permissionId}`,
  );
  return unwrapData<PermissionItem>(response.data);
}

export async function createPermission(payload: PermissionPayload) {
  const response = await api.post<ApiResponse<PermissionItem>>(
    "admin/permissions",
    payload,
  );
  return unwrapData<PermissionItem>(response.data);
}

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

export async function deletePermission(permissionId: string) {
  const response = await api.delete<ApiResponse<{ success?: boolean }>>(
    `admin/permissions/${permissionId}`,
  );
  return unwrapData<{ success?: boolean }>(response.data);
}
