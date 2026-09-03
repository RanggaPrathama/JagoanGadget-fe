import type { RoleItem } from "../../setup/role/service/role.service";

export type UserEntity = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  phoneNumber: string | null;
  avatarUrl: string | null;
  isActive: boolean;
  isSuperadmin: boolean;
  lastActiveAt: string | null; // using string for date from API
  createdAt: string;
  updatedAt: string;
  userRoles?: UserRoleEntity[];
};

export type UserRoleEntity = {
  id: string;
  userId: string;
  roleId: string;
  role?: RoleItem; // Populated role data
};

export type UserFormInput = {
  name: string;
  email: string;
  phoneNumber?: string;
  isActive: boolean;
  // isSuperadmin: boolean;
  roleIds: string[]; // For assigning roles during creation/edit
  avatarTempKey?: string;
};

export type UserStats = {
  totalUsers: number;
  totalActiveUsers: number;
  totalInactiveUsers: number;
  totalSuperAdmins: number;
}