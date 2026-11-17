import {
  attachSyncAppPersistence,
  type AppPersistenceAttachOptions,
  type AppRuntime,
} from "@ebtest/shared/uklad";

export type WebPersistenceOptions = Omit<AppPersistenceAttachOptions, "target">;

/**
 * Browser-owned persistence boundary. `localStorage` is intentionally read at
 * call time so importing this module remains safe during SSR/build tooling.
 */
export function attachWebPersistence(
  runtime: AppRuntime,
  options: WebPersistenceOptions = {},
) {
  return attachSyncAppPersistence(runtime, globalThis.localStorage, {
    ...options,
    target: "web",
  });
}
