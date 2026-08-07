import type { ReactNode } from "react";
import { useHasPermission } from "@/hooks/useHasPermission";

type CanAccessProps = {
  permission: string | string[];
  children: ReactNode;
  /** Rendered while the `/me` cache is loading or the user lacks the permission. */
  fallback?: ReactNode;
};

/**
 * Render guard for permission-level access.
 * Only controls visibility — route-level authorization is handled by the
 * `requireAdminPageAccess` beforeLoad guard. Superadmins always pass.
 */
export function CanAccess({
  permission,
  children,
  fallback = null,
}: CanAccessProps) {
  const { has, isLoading } = useHasPermission(permission);

  if (isLoading) return fallback;
  if (!has) return fallback;

  return children;
}
