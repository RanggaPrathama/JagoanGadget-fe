import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/utils/error";
import { deleteMenu, getMenusList, type MenuItem } from "../service/menu.service";
import type { UnwrappedPaginated } from "@/lib/api-response";
import { invalidateMe } from "@/features/auth/service/me.service";

export const menuListQueryKey = ["menus"];

export type MenuTableRow = MenuItem & {
  parentLabel: string;
  icon: string | null;
};

function resolveParentLabel(menu: MenuItem, menuMap: Map<string, MenuItem>) {
  if (menu.parent?.name) {
    return menu.parent.name;
  }

  if (menu.parentName) {
    return menu.parentName;
  }

  if (menu.parentId) {
    return menuMap.get(menu.parentId)?.name ?? "-";
  }

  return "-";
}

export function useMenuList(
  search?: string,
  show?: "active" | "inactive" | "all",
  page = 1,
  limit = 25,
) {
  const queryClient = useQueryClient();
  const menuQuery = useQuery({
    queryKey: [
      ...menuListQueryKey,
      ...(search ? [search] : []),
      ...(show && show !== "all" ? [show] : []),
      page,
      limit,
    ],
    queryFn: () =>
      getMenusList({
        search,
        isActive: show === "active" ? true : show === "inactive" ? false : undefined,
        page,
        limit,
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMenu,
    onSuccess: async () => {
      toast.success("Menu berhasil dihapus.");
      await queryClient.invalidateQueries({ queryKey: menuListQueryKey });
      await invalidateMe(queryClient);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Gagal menghapus menu."));
    },
  });

  const data = menuQuery.data as UnwrappedPaginated<MenuItem> | undefined;
  const rawMenus = data?.items ?? [];
  const pagination = data?.pagination;
  const totalMenus = pagination?.totalItems ?? 0;
  const menuMap = new Map(rawMenus.map((menu) => [menu.id, menu]));
  const menus: MenuTableRow[] = rawMenus.map((menu) => ({
    ...menu,
    icon: menu.iconName ?? null,
    parentLabel: resolveParentLabel(menu, menuMap),
    sortOrder: menu.sortOrder ?? 0,
    isActive: menu.isActive ?? true,
  }));

  return {
    menus,
    totalMenus,
    pagination,
    isLoading: menuQuery.isLoading,
    isRefreshing: menuQuery.isFetching,
    isDeleting: deleteMutation.isPending,
    refetchMenus: async () => {
      await menuQuery.refetch();
    },
    deleteMenu: async (menuId: string) => {
      await deleteMutation.mutateAsync(menuId);
    },
  };
}
