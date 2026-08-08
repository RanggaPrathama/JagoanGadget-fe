import { api } from "@/lib/axios";
import { unwrapData } from "@/lib/api-response";
import type { MeData, MeUser } from "@/features/auth/types/me";
import { isStaff } from "../lib/role";
import type { NotificationPreferences, UpdateMyProfilePayload } from "../types";

export const notificationPrefsQueryKey = [
  "settings",
  "notification-preferences",
] as const;

function seedDefaults(me?: MeData): NotificationPreferences {
  return {
    accountActivity: true,
    systemUpdates: isStaff(me),
    promos: !isStaff(me),
  };
}

/** Local-only: no BE endpoint exists. Seed defaults; toggles update the query cache (see hook). */
export async function getNotificationPreferences(
  me?: MeData,
): Promise<NotificationPreferences> {
  return seedDefaults(me);
}

/** Local-only: returns input unchanged; persistence is the optimistic cache in useUpdateNotificationPreferences. */
export async function updateNotificationPreferences(
  prefs: NotificationPreferences,
): Promise<NotificationPreferences> {
  return prefs;
}

/** PUT /me/update-profile — the BE returns the updated UserEntity inside `data`. */
export async function updateMyProfile(
  payload: UpdateMyProfilePayload,
  currentUser: MeUser,
): Promise<MeUser> {
  const response = await api.put("/me/update-profile", payload);
  return unwrapData<MeUser>(response.data) ?? currentUser;
}
