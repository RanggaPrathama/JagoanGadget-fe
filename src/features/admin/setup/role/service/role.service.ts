import { api } from "@/lib/axios";
import { unwrapData, unwrapPaginated } from "@/lib/api-response";
import type { ApiResponse, PaginatedResponse } from "@/lib/api-response";
import type { PermissionItem } from "@/features/admin/setup/permission/service/permission.service";

export type RolePermissionEntry = {
  id: string;
  roleId: string;
  permissionId: string;
  permission: PermissionItem;
};

export type RoleMenuPermission = {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  is_checked: boolean;
};

export type RoleMenuEntry = {
  id: string;
  name: string;
  code: string;
  iconName?: string;
  sortOrder?: number;
  permissions: RoleMenuPermission[];
};

export type RoleItem = {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  isActive?: boolean;
  isSystem?: boolean;
  menus?: RoleMenuEntry[];
  rolePermissions?: RolePermissionEntry[];
  permissionIds?: string[];
  createdAt?: string;
  updatedAt?: string;
};

export type RolePayload = {
  name: string;
  code: string;
  description?: string | null;
  isActive: boolean;
  permissionIds: string[];
};

export async function getRoles(params?: {
  search?: string;
  page?: number;
  limit?: number;
}) {
  const response = await api.get<PaginatedResponse<RoleItem>>("admin/roles", {
    params,
  });
  return unwrapPaginated<RoleItem>(response.data);
}

export async function getRoleById(roleId: string) {
  const response = await api.get<ApiResponse<RoleItem>>(
    `admin/roles/${roleId}`,
  );
  return unwrapData<RoleItem>(response.data);
}

export async function createRole(payload: RolePayload) {
  const response = await api.post<ApiResponse<RoleItem>>(
    "admin/roles",
    payload,
  );
  return unwrapData<RoleItem>(response.data);
}

export async function updateRole(roleId: string, payload: RolePayload) {
  const response = await api.put<ApiResponse<RoleItem>>(
    `admin/roles/${roleId}`,
    payload,
  );
  return unwrapData<RoleItem>(response.data);
}

export async function deleteRole(roleId: string) {
  const response = await api.delete<ApiResponse<{ success?: boolean }>>(
    `admin/roles/${roleId}`,
  );
  return unwrapData<{ success?: boolean }>(response.data);
}
