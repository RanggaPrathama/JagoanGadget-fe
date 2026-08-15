import { api } from "@/lib/axios";
import { unwrapData, unwrapPaginated } from "@/lib/api-response";
import type { ApiResponse, PaginatedResponse } from "@/lib/api-response";
import type {
  MenuItem,
  MenuPayload,
  GenerateMenuCodePayload,
  GenerateMenuCodeData,
} from "../types";
export type { MenuItem, MenuPayload } from "../types";



// GET admin/menus — fetch paginated menu list with optional search, active status, permission, and pagination params.
export async function getMenusList(params?: {
  search?: string;
  isActive?: boolean;
  hasPermission?: boolean;
  page?: number;
  limit?: number;
}) {
  const response = await api.get<PaginatedResponse<MenuItem>>("admin/menus", {
    params,
  });
  return unwrapPaginated<MenuItem>(response.data);
}

// GET admin/menus/:menuId — fetch single menu detail by ID.
export async function getMenuById(menuId: string) {
  const response = await api.get<ApiResponse<MenuItem>>(
    `admin/menus/${menuId}`,
  );
  return unwrapData<MenuItem>(response.data);
}

// POST admin/menus — create a new menu entry.
export async function createMenu(payload: MenuPayload) {
  const response = await api.post<ApiResponse<MenuItem>>(
    "admin/menus",
    payload,
  );
  return unwrapData<MenuItem>(response.data);
}

// PUT admin/menus/:menuId — update an existing menu entry.
export async function updateMenu(menuId: string, payload: MenuPayload) {
  const response = await api.put<ApiResponse<MenuItem>>(
    `admin/menus/${menuId}`,
    payload,
  );
  return unwrapData<MenuItem>(response.data);
}

// DELETE admin/menus/:menuId — delete a menu entry by ID.
export async function deleteMenu(menuId: string) {
  const response = await api.delete<ApiResponse<{ success?: boolean }>>(
    `admin/menus/${menuId}`,
  );
  return unwrapData<{ success?: boolean }>(response.data);
}

// GET admin/menus/generate-code — generate a menu code slug and derived route path from a name + optional parentId.
export async function generateMenuCode(payload: GenerateMenuCodePayload) {
  const response = await api.get<ApiResponse<GenerateMenuCodeData>>(
    "admin/menus/generate-code",
    {
      params: {
        name: payload.name,
        parentId: payload.parentId || undefined,
      },
    },
  );

  const data = unwrapData<GenerateMenuCodeData>(response.data);
  const code = data?.code ?? "";
  const route = `/admin/${code}`.split(".").join("/");

  return {
    code,
    route,
    fullPath: data?.fullPath ?? [],
  };
}


