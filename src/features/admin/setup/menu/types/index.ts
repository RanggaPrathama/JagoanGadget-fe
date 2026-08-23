export type MenuItem = {
  id: string;
  name: string;
  code: string;
  route?: string | null;
  iconName?: string | null;
  sortOrder?: number;
  isActive?: boolean;
  parentId?: string | null;
  parent?: {
    id: string;
    name: string;
  } | null;
  parentName?: string | null;
  type?: string;
};

export type MenuPayload = {
  name: string;
  code: string;
  route?: string | null;
  iconName?: string | null;
  sortOrder?: number;
  isActive?: boolean;
  type: string;
  parentId?: string | null;
  createPermission?: boolean;
  permissionName?: string;
};

export type GenerateMenuCodePayload = {
  name: string;
  parentId?: string | null;
};

export type GenerateMenuCodeData = {
  code: string;
  fullPath: string[];
};

