import type { PermissionItem } from "../../permission/types";

// A permission entry attached to a role (join-row shape from the API).
export type RolePermissionEntry = {
  id: string;
  roleId: string;
  permissionId: string;
  permission: PermissionItem;
};

// A permission row inside a role's menu grouping (edit-mode checkbox state).
export type RoleMenuPermission = {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  is_checked: boolean;
};

// A menu node returned when loading a role's permission tree.
export type RoleMenuEntry = {
  id: string;
  name: string;
  code: string;
  iconName?: string;
  sortOrder?: number;
  permissions: RoleMenuPermission[];
};

// A role record as returned by the list/detail endpoints.
export type RoleItem = {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  isActive?: boolean;
  isSystem?: boolean;
  menus?: RoleMenuEntry[];
  rolePermissions?: RolePermissionEntry[];
  permissionIds?: string[];
  createdAt?: string;
  updatedAt?: string;
};

// Payload sent to create/update a role.
export type RolePayload = {
  name: string;
  code: string;
  description?: string | null;
  isActive: boolean;
  permissionIds: string[];
};

export type RoleStats = {
  totalRole: number;
  totalActiveRole: number;
  totalInactiveRole: number;
};
