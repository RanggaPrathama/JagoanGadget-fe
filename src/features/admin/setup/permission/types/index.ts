// Types describing a permission record and the payload used to create/update it.
export type PermissionItem = {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  menuId?: string | null;
  menuName?: string | null;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  menu: {
    id: string;
    name: string;
    code: string;
    route?: string | null;
    iconName?: string | null;
  };
};

// Payload sent to the create/update permission endpoints.
export type PermissionPayload = {
  name: string;
  code: string;
  description?: string | null;
  menuId?: string | null;
};
