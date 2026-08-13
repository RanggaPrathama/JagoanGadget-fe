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

export const menuListQueryKey = ["menus"] as const;

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

export async function getMenuById(menuId: string) {
  const response = await api.get<ApiResponse<MenuItem>>(
    `admin/menus/${menuId}`,
  );
  return unwrapData<MenuItem>(response.data);
}

export async function createMenu(payload: MenuPayload) {
  const response = await api.post<ApiResponse<MenuItem>>(
    "admin/menus",
    payload,
  );
  return unwrapData<MenuItem>(response.data);
}

export async function updateMenu(menuId: string, payload: MenuPayload) {
  const response = await api.put<ApiResponse<MenuItem>>(
    `admin/menus/${menuId}`,
    payload,
  );
  return unwrapData<MenuItem>(response.data);
}

export async function deleteMenu(menuId: string) {
  const response = await api.delete<ApiResponse<{ success?: boolean }>>(
    `admin/menus/${menuId}`,
  );
  return unwrapData<{ success?: boolean }>(response.data);
}

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

export {
  getMenusListQueryKey,
  getMenusListQueryOptions,
  getMenuByIdQueryOptions,
  useGetMenusListQuery,
  useGetMenuByIdQuery,
  invalidateMenuQueries,
} from "./menu.queries";
export {
  useDeleteMenu,
  useGenerateMenuCode,
  useCreateMenu,
  useUpdateMenu,
} from "./menu.mutations";
