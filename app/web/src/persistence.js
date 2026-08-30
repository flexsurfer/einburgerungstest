import { attachSyncAppPersistence } from "@ebtest/shared/uklad";

/**
 * Browser-owned persistence boundary. `localStorage` is intentionally read at
 * call time so importing this module remains safe during SSR/build tooling.
 */
export function attachWebPersistence(runtime, options = {}) {
  return attachSyncAppPersistence(runtime, globalThis.localStorage, {
    ...options,
    target: "web",
  });
}
