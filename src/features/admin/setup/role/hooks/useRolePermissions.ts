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

  // Convert permission IDs array to a Set for fast O(1) membership checks.
  const selectedPermissionSet = useMemo(
    () => new Set(selectedPermissionIds),
    [selectedPermissionIds],
  );

  // Group fetched permissions by their menuId so the UI can render one card per menu.
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

  // Filter selected menu IDs by the user's search query so only matching menus render.
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

  // Add or remove a single permission ID from the form's permissionIds array.
  const togglePermission = (permissionId: string, checked: boolean) => {
    if (checked) {
      setPermissionIds(
        Array.from(new Set([...selectedPermissionIds, permissionId])),
      );
      return;
    }
    setPermissionIds(selectedPermissionIds.filter((id) => id !== permissionId));
  };

  // Add or remove all permissions from a selected menu at once (select-all per menu).
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

  // Replaces the selected menu IDs when the user picks menus from the selector.
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
