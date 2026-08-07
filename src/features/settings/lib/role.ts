import type { MeData } from "@/features/auth/types/me";

export const isStaff = (me?: MeData) =>
  Boolean(me?.accessControl.canAccessAdmin || me?.user.isSuperadmin);

export const getRoleLabel = (me?: MeData) =>
  isStaff(me) ? "Karyawan" : "Member";
