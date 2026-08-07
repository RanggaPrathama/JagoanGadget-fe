import { Circle, type LucideIcon } from "lucide-react";
import * as LucideIcons from "lucide-react"; // namespace for runtime icon resolution
import type { MeData, MeMenu, MePermission } from "@/features/auth/types/me";
import type { NavGroup, SidebarData } from "@/types/sidebar";


const fallbackIcon = Circle;

/** Dynamic Lucide resolver — looks up icons by name from the namespace import. */
const _lucideNamespace = LucideIcons as unknown as Record<string, LucideIcon>;

/**
 * Resolve a Lucide icon component by name.
 * Resolution order: exact match (`"Settings"`) → strip `Lucide`/`lucide-`
 * prefix (`"LucideMenuSquare"` → `"MenuSquare"`) → kebab/snake-to-Pascal
 * (`"folder-open"` → `"FolderOpen"`). Returns `null` when not found.
 */
function resolveLucideIcon(name: string): LucideIcon | null {
  // 1. Exact match — e.g. "Settings", "MenuSquare"
  if (_lucideNamespace[name]) return _lucideNamespace[name];

  // 2. Strip "Lucide" / "lucide-" prefix — e.g. "LucideMenuSquare" → "MenuSquare"
  const stripped = name.replace(/^Lucide/i, "").replace(/^lucide-/i, "");
  if (stripped && _lucideNamespace[stripped]) return _lucideNamespace[stripped];

  // 3. Convert kebab-case / snake_case to PascalCase — "folder-open" → "FolderOpen"
  const pascal = stripped
    .split(/[-_]/)
    .map((seg) => seg.charAt(0).toUpperCase() + seg.slice(1))
    .join("");
  if (pascal && _lucideNamespace[pascal]) return _lucideNamespace[pascal];

  return null;
}

// function normalizeSegment(value: string) {
//   return value
//     .trim()
//     .toLowerCase()
//     .replace(/[\s_-]+/g, "");
// }

/**
 * Get the sidebar icon component for a menu. Icon names come from the menu's
 * `iconName` (e.g. `"LayoutDashboard"`, `"folder-open"`).
 * Falls back to `Circle` when the name is empty or unresolvable.
 */
export function getSidebarIcon(iconName: string | null) {
  if (!iconName) return fallbackIcon;

  // Dynamic Lucide resolve ("Settings", "LucideMenuSquare", "folder-open", etc.)
  const resolved = resolveLucideIcon(iconName.trim());
  if (resolved) return resolved;

  // Fallback
  return fallbackIcon;
}

/**
 * Sort menus by `sortOrder` (ascending), recursively sorting each level of
 * children. Returns a new array — the input is not mutated.
 * Used to keep the sidebar ordered exactly as configured in the menu setup.
 */
export function sortMenusByOrder(menus: MeMenu[]): MeMenu[] {
  return [...menus]
    .sort((left, right) => left.sortOrder - right.sortOrder)
    .map((menu) => ({
      ...menu,
      children: sortMenusByOrder(menu.children),
    }));
}

/**
 * Flatten the permission codes of a menu tree into a `Set`.
 * Collects every menu's own `permissions` plus all codes from descendants.
 * Used as the lookup table for `hasPermission`.
 */
export function flattenPermissionCodes(
  menus: MeMenu[],
  permissions: MePermission[] = [],
) {
  const permissionSet = new Set(
    permissions.map((permission) => permission.code),
  );
  

  for (const menu of menus) {
    for (const permission of menu.permissions) {
      permissionSet.add(permission.code);
    }

    if (menu.children.length > 0) {
      for (const code of flattenPermissionCodes(menu.children)) {
        permissionSet.add(code);
      }
    }
  }

  return permissionSet;
}

/**
 * Check the user has at least one of the given permission codes (ANY/OR).
 * Accepts a single code or an array of codes; an array passes when any code
 * is found. Permission codes come from `accessControl.menus[].permissions[].code`.
 * Used by `useHasPermission` and `CanAccess` to guard buttons/columns/tabs.
 */
export function hasPermission(
  menus: MeMenu[],
  permission: string | string[],
) {
  const permissionSet = flattenPermissionCodes(menus);
  const codes = Array.isArray(permission) ? permission : [permission];

  return codes.some((code) => permissionSet.has(code));
}

/**
 * Normalize a route path for comparison: strip the query string and trailing
 * slashes, so `/admin/menu?page=1` and `/admin/menu/` both become `/admin/menu`.
 */
export function normalizeRoutePath(pathname: string) {
  if (!pathname) return "/";
  const [path] = pathname.split("?");
  const sanitized = path.replace(/\/+$/, "");
  return sanitized || "/";
}

/** Gather every `route` in the menu tree (normalized) into a `Set`. */
function collectAllowedRoutes(menus: MeMenu[], routes = new Set<string>()) {
  for (const menu of menus) {
    if (menu.route) {
      routes.add(normalizeRoutePath(menu.route));
    }

    if (menu.children.length > 0) {
      collectAllowedRoutes(menu.children, routes);
    }
  }

  return routes;
}

/**
 * Route-level authorization: does any allowed route match the current pathname?
 * Matches exact, query-stripped, and prefix (`/admin/setup/menu/create` matches
 * `/admin/setup/menu`). Used by the TanStack Router `beforeLoad` guard
 * (`requireAdminPageAccess` in `@/lib/auth.ts`) to redirect to `/403`.
 */
export function canAccessRoute(menus: MeMenu[], pathname: string) {
  const currentPath = normalizeRoutePath(pathname);
  const allowedRoutes = collectAllowedRoutes(menus);

  for (const route of allowedRoutes) {
    if (currentPath === route) return true;
    if (currentPath.startsWith(`${route}/`)) return true;
  }

  return false;
}

/**
 * Build the `SidebarData` for the admin sidebar from the current user's
 * access-control tree (the `["me"]` query snapshot).
 *
 * Each top-level menu becomes exactly one `NavGroup` row, in global `sortOrder`:
 *   - A menu **with children** → group header (`children` filled, no `url`).
 *   - A menu **without children** → leaf nav item (`children: []`, `url` set).
 *   - A leaf without a `route` → skipped (nothing to render).
 * Children are filtered to those with a `route` and flattened to plain links.
 *
 * Consumed by `AppSidebar` → `NavGroup`.
 */
export function buildSidebarDataFromMe(data: MeData): SidebarData {
  const sortedMenus = sortMenusByOrder(data.accessControl.menus);
  const navGroups: NavGroup[] = [];

  for (const menu of sortedMenus) {
    const children = menu.children
      .filter((child) => child.route)
      .map((child) => ({
        title: child.name,
        url: child.route!,
        icon: getSidebarIcon(child.iconName),
      }));

    // Leaf tanpa route → tidak ada apa-apa untuk ditampilkan.
    if (children.length === 0 && !menu.route) {
      continue;
    }

    navGroups.push({
      title: menu.name,
      icon: getSidebarIcon(menu.iconName),
      url: menu.route ?? undefined,
      children,
    });
  }

  return {
    user: {
      name: data.user.name,
      email: data.user.email,
      avatar: data.user.avatarUrl || data.user.image || "",
    },
    teams: [],
    navGroups,
  };
}
