import type { NotificationPreferences } from "../types";

/**
 * In-memory mock store (mock backend only).
 * Holds notification preferences while the real API does not exist yet.
 * Resets on reload — acceptable for a mock.
 */

let storedPrefs: NotificationPreferences | null = null;

export function getStoredPrefs() {
  return storedPrefs;
}

export function setStoredPrefs(prefs: NotificationPreferences) {
  storedPrefs = prefs;
}
