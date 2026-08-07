import type { MeData, MeUser } from "@/features/auth/types/me";
import { resolveMockUploadUrl } from "@/features/uploads/service/upload.mock";
import { config } from "@/config/config";
import { isStaff } from "../lib/role";
import type {
  NotificationPreferences,
  UpdateMyProfilePayload,
} from "../types";
import { getStoredPrefs, setStoredPrefs } from "./mock-store";

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

/**
 * Ambil preferensi notifikasi milik user yang login.
 * Real API (nanti): GET /me/notification-preferences → unwrapData<NotificationPreferences>
 */
export async function getNotificationPreferences(
  me?: MeData,
): Promise<NotificationPreferences> {
  if (config.mockBackend) {
    return getStoredPrefs() ?? seedDefaults(me);
  }

  // const response = await api.get("/me/notification-preferences");
  // return unwrapData<NotificationPreferences>(response.data);
  return seedDefaults(me);
}

/**
 * Simpan preferensi notifikasi.
 * Real API (nanti): PATCH /me/notification-preferences (body: prefs) → unwrapData
 */
export async function updateNotificationPreferences(
  prefs: NotificationPreferences,
): Promise<NotificationPreferences> {
  if (config.mockBackend) {
    setStoredPrefs(prefs);
    return prefs;
  }

  // const response = await api.patch("/me/notification-preferences", prefs);
  // return unwrapData<NotificationPreferences>(response.data);
  return prefs;
}

/**
 * Perbarui identitas dasar user yang login (email tidak termasuk).
 * Real API (nanti): PATCH /me (body: UpdateMyProfilePayload) → updated MeUser
 *
 * Mock: merge payload ke `currentUser` (diambil dari cache `["me"]`) dan balikin
 * user hasil gabungan — TIDAK menyentuh sumber data `["me"]` agar sidebar tetap
 * di-render dari backend asli.
 */
export async function updateMyProfile(
  payload: UpdateMyProfilePayload,
  currentUser: MeUser,
): Promise<MeUser> {
  if (config.mockBackend) {
    const resolvedAvatar = resolveMockUploadUrl(payload.avatarTempKey);
    return {
      ...currentUser,
      name: payload.name,
      phoneNumber: payload.phoneNumber,
      // tempKey null = foto tidak diubah → pertahankan avatarUrl lama.
      avatarUrl: resolvedAvatar ?? currentUser.avatarUrl,
      updatedAt: new Date().toISOString(),
    };
  }

  // const response = await api.patch("/me", payload);
  // return unwrapData<MeUser>(response.data);
  throw new Error("Endpoint belum tersedia.");
}
