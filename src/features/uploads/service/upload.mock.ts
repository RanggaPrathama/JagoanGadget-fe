/**
 * Mock upload registry (mock backend only).
 *
 * `uploadTempFile` in the real flow returns a `tempKey` that the server can
 * resolve back to a committed URL later. With the backend mocked there is no
 * server, so this Map remembers each tempKey → object URL so the mock profile
 * update can resolve `avatarTempKey` into a viewable `avatarUrl`.
 *
 * Object URLs only live for the current page session — acceptable for a mock.
 */

const mockUploadRegistry = new Map<string, string>();

export function registerMockUploadUrl(tempKey: string, url: string) {
  mockUploadRegistry.set(tempKey, url);
}

export function resolveMockUploadUrl(tempKey: string | null): string | null {
  if (!tempKey) return null;
  return mockUploadRegistry.get(tempKey) ?? null;
}
