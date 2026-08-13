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
import { queryOptions, useQuery, useMutation, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { type QueryConfig } from "@/lib/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/utils/error";
import { invalidateMe } from "@/features/auth/service/me.service";

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

export type MenuListParams = {
  search?: string;
  show?: "active" | "inactive" | "all";
  page?: number;
  limit?: number;
};

export const getMenusListQueryKey = (params?: MenuListParams): unknown[] => [
  ...menuListQueryKey,
  params?.search ?? "",
  params?.show ?? "all",
  params?.page ?? 1,
  params?.limit ?? 25,
];

export const getMenusListQueryOptions = (params?: MenuListParams) =>
  queryOptions({
    queryKey: getMenusListQueryKey(params),
    queryFn: () => getMenusList(params),
  });

export const getMenuByIdQueryOptions = (menuId: string) => {
  return queryOptions({
    queryKey: [...menuListQueryKey, menuId],
    queryFn: () => getMenuById(menuId),
  });
};

type UseMenusQueryOptions = { queryConfig?: QueryConfig<typeof getMenusListQueryOptions> };

export const useGetMenusListQuery = (
  params?: MenuListParams,
  { queryConfig }: UseMenusQueryOptions = {},
) => useQuery({ ...getMenusListQueryOptions(params), ...queryConfig });

export const useGetMenuByIdQuery = (
  menuId: string,
  { queryConfig }: { queryConfig?: QueryConfig<typeof getMenuByIdQueryOptions> } = {},
) => useQuery({ ...getMenuByIdQueryOptions(menuId), ...queryConfig });

export function invalidateMenuQueries(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: menuListQueryKey });
}

export const useDeleteMenu = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteMenu,
    onSuccess: async () => {
      toast.success("Menu berhasil dihapus.");
      await invalidateMenuQueries(queryClient);
      await invalidateMe(queryClient);
    },
    onError: (error: Error) => toast.error(getErrorMessage(error, "Gagal menghapus menu.")),
  });
};

export const useGenerateMenuCode = () => {
  return useMutation({
    mutationFn: generateMenuCode,
    onError: (error: Error) =>
      toast.error(getErrorMessage(error, "Gagal membuat kode menu secara otomatis.")),
  });
};

export const useCreateMenu = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createMenu,
    onSuccess: async () => {
      toast.success("Menu berhasil ditambahkan.");
      await invalidateMenuQueries(queryClient);
      await invalidateMe(queryClient);
    },
    onError: (error: Error) => toast.error(getErrorMessage(error, "Gagal menambahkan menu.")),
  });
};

export const useUpdateMenu = (menuId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: MenuPayload) => updateMenu(menuId, payload),
    onSuccess: async () => {
      toast.success("Menu berhasil diperbarui.");
      await invalidateMenuQueries(queryClient);
      await invalidateMe(queryClient);
    },
    onError: (error: Error) => toast.error(getErrorMessage(error, "Gagal memperbarui menu.")),
  });
};
