import { useDeleteMenu } from "../service/menu.mutations";
import { useGetMenusListQuery } from "../service/menu.queries";
import type { MenuItem } from "../types";
import type { UnwrappedPaginated } from "@/lib/api-response";
import { useMemo, useState } from "react";

export type MenuTableRow = MenuItem & {
  parentLabel: string;
  icon: string | null;
};

// Resolve the parent menu label for a row: prefers the embedded parent object, then parentName, then a lookup by parentId.
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

// Hook: fetch, shape, and manage the menu list table data. Maps raw API rows to MenuTableRow with resolved parent label, icon, sortOrder, and isActive defaults.
export function useMenuList(
  search?: string,
  show?: "active" | "inactive" | "all",
  page = 1,
  limit = 25,
) {
  const showParam = show === "all" ? undefined : show;

  const menuQuery = useGetMenusListQuery(
    { search, show: showParam, page, limit },
    { queryConfig: { enabled: true } },
  );

  // hooks for selected menu and delete confirmation dialog
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // handle delete menu mutation
  const deleteMutation = useDeleteMenu();

  const data = menuQuery.data as UnwrappedPaginated<MenuItem> | undefined;
  const pagination = data?.pagination;
  const totalMenus = pagination?.totalItems ?? 0;

  const rawMenus = useMemo(() => data?.items ?? [], [data?.items]);

  const menus = useMemo<MenuTableRow[]>(() => {
    const menuMap = new Map(rawMenus.map((menu) => [menu.id, menu]));
    return rawMenus.map((menu) => ({
      ...menu,
      icon: menu.iconName ?? null,
      parentLabel: resolveParentLabel(menu, menuMap),
      sortOrder: menu.sortOrder ?? 0,
      isActive: menu.isActive ?? true,
    }));
  }, [rawMenus]);

  const selectedMenu = menus.find((m) => m.id === selectedId) ?? null;

  return {
    menus,
    totalMenus,
    pagination,
    isLoading: menuQuery.isLoading,
    isRefreshing: menuQuery.isFetching,
    isDeleting: deleteMutation.isPending,
    selectedId,
    setSelectedId,
    confirmDeleteId,
    setConfirmDeleteId,
    selectedMenu,
    refetchMenus: async () => {
      await menuQuery.refetch();
    },
    deleteMenu: async (menuId: string) => {
      await deleteMutation.mutateAsync(menuId);
    },
  };
}
