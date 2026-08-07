import { useMemo } from "react";
import { useMe } from "@/hooks/useMe";
import { flattenPermissionCodes } from "@/utils/access-control";

/**
 * Subscribe to the current user's permission codes from the `/me` cache.
 * Superadmins bypass all permission checks.
 */
export function useHasPermission(permission: string | string[]) {
  // React Query v4 — `isLoading` (not `isPending`) = first load, no cached data.
  const { data, isLoading } = useMe();

  // Flatten the permission-code tree once per `/me` snapshot. `data` reference
  // is stable between renders (react-query keeps it across refetches), so this
  // Set is rebuilt only when the access-control data actually changes.
  const permissionCodes = useMemo(
    () =>
      data
        ? flattenPermissionCodes(data.accessControl.menus)
        : new Set<string>(),
    [data],
  );

  const has = data
    ? data.user.isSuperadmin ||
      (Array.isArray(permission) ? permission : [permission]).some((code) =>
        permissionCodes.has(code),
      )
    : false;

  return { has, isLoading };
}

