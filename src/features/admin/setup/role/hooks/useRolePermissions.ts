import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPermissions } from "@/features/admin/setup/permission/service/permission.service";
import type { PermissionItem } from "@/features/admin/setup/permission/service/permission.service";

type UseRolePermissionsOptions = {
  /** Current permission IDs from form */
  selectedPermissionIds: string[];
  /** Setter for form's permissionIds field */
  setPermissionIds: (ids: string[]) => void;
  /** Menu IDs from role detail (edit mode) */
  initialMenuIds?: string[];
};

export function useRolePermissions({
  selectedPermissionIds,
  setPermissionIds,
  initialMenuIds = [],
}: UseRolePermissionsOptions) {
  const [selectedMenuIds, setSelectedMenuIds] =
    useState<string[]>(initialMenuIds);

  const [menuSearch, setMenuSearch] = useState("");

  // Use selectedMenuIds if set, otherwise use initialMenuIds
  const effectiveMenuIds =
    selectedMenuIds.length > 0 ? selectedMenuIds : initialMenuIds;

  // Permissions query — always fetch when menu IDs are available
  const queryMenuIds = effectiveMenuIds;
  const menuIdsKey =
    queryMenuIds.length > 0 ? [...queryMenuIds].sort().join(",") : "";
  const permissionsQuery = useQuery({
    queryKey: ["permissions", "by-menus", menuIdsKey],
    queryFn: () =>
      getPermissions({ menuIds: [...queryMenuIds], no_pagination: true }),
    enabled: menuIdsKey !== "",
  });

  const selectedPermissionSet = useMemo(
    () => new Set(selectedPermissionIds),
    [selectedPermissionIds],
  );

  // Group permissions by menuId
  const menuPermissionsMap = useMemo(() => {
    const map = new Map<
      string,
      { menuName: string; permissions: PermissionItem[] }
    >();
    const items = permissionsQuery.data?.items ?? [];

    items.forEach((p) => {
      const menuId = p.menuId ?? p.menu?.id ?? "unknown";
      const menuName = p.menu?.name ?? p.menuName ?? "Tanpa Menu";
      const existing = map.get(menuId);

      if (existing) {
        existing.permissions.push(p);
      } else {
        map.set(menuId, { menuName, permissions: [p] });
      }
    });

    return map;
  }, [permissionsQuery.data]);

  // Filtered menu IDs based on menu search
  const filteredMenuIds = useMemo(() => {
    if (!menuSearch.trim()) return effectiveMenuIds;

    const q = menuSearch.toLowerCase();
    return effectiveMenuIds.filter((menuId) => {
      const group = menuPermissionsMap.get(menuId);
      return group?.menuName.toLowerCase().includes(q);
    });
  }, [effectiveMenuIds, menuSearch, menuPermissionsMap]);

  // Menu names that have at least one selected permission
  const selectedModules = useMemo(() => {
    const names: string[] = [];
    menuPermissionsMap.forEach((group) => {
      if (group.permissions.some((p) => selectedPermissionSet.has(p.id))) {
        names.push(group.menuName);
      }
    });
    return names;
  }, [menuPermissionsMap, selectedPermissionSet]);

  const togglePermission = (permissionId: string, checked: boolean) => {
    if (checked) {
      setPermissionIds(
        Array.from(new Set([...selectedPermissionIds, permissionId])),
      );
      return;
    }
    setPermissionIds(selectedPermissionIds.filter((id) => id !== permissionId));
  };

  const toggleMenuPermissions = (
    menuPermissions: PermissionItem[],
    checked: boolean,
  ) => {
    if (checked) {
      setPermissionIds(
        Array.from(
          new Set([
            ...selectedPermissionIds,
            ...menuPermissions.map((p) => p.id),
          ]),
        ),
      );
      return;
    }
    const ids = new Set(menuPermissions.map((p) => p.id));
    setPermissionIds(selectedPermissionIds.filter((id) => !ids.has(id)));
  };

  const handleMenusChange = (ids: string[]) => {
    setSelectedMenuIds(ids);
  };

  return {
    selectedMenuIds: effectiveMenuIds,
    filteredMenuIds,
    menuSearch,
    setMenuSearch,
    setSelectedMenuIds,
    handleMenusChange,
    menuPermissionsMap,
    selectedPermissionSet,
    selectedModules,
    isPermissionsLoading: permissionsQuery.isLoading,
    togglePermission,
    toggleMenuPermissions,
  };
}
