import { api } from "@/lib/axios";
import { unwrapData, unwrapPaginated } from "@/lib/api-response";
import type { ApiResponse, PaginatedResponse } from "@/lib/api-response";
import type { RoleItem, RolePayload, RoleStats } from "../types";

// Fetch a paginated role list.
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

// fetch statistics for roles (total, active, system, custom)
export async function getRoleStatistics() {
  const response = await api.get<ApiResponse<RoleStats>>(
    "admin/roles/statistics",
  );
  return unwrapData<RoleStats>(response.data);
}

// Fetch a single role by id (includes its permission tree).
export async function getRoleById(roleId: string) {
  const response = await api.get<ApiResponse<RoleItem>>(
    `admin/roles/${roleId}`,
  );
  return unwrapData<RoleItem>(response.data);
}

// Create a new role.
export async function createRole(payload: RolePayload) {
  const response = await api.post<ApiResponse<RoleItem>>(
    "admin/roles",
    payload,
  );
  return unwrapData<RoleItem>(response.data);
}

// Update an existing role.
export async function updateRole(roleId: string, payload: RolePayload) {
  const response = await api.put<ApiResponse<RoleItem>>(
    `admin/roles/${roleId}`,
    payload,
  );
  return unwrapData<RoleItem>(response.data);
}

// Delete a role by id.
export async function deleteRole(roleId: string) {
  const response = await api.delete<ApiResponse<{ success?: boolean }>>(
    `admin/roles/${roleId}`,
  );
  return unwrapData<{ success?: boolean }>(response.data);
}
