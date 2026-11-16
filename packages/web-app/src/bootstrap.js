import {
  appIds,
  createAppRuntime,
  registerSharedModules,
} from "@ebtest/shared/uklad";
import { attachWebPersistence } from "./persistence.js";
import { registerWebPlatform, watchWebSystemTheme } from "./platform.js";

/**
 * Create the browser runtime and start persistence hydration. Domain actions
 * are dispatched only after persistence hydration succeeds, so restored
 * answers cannot be overwritten by boot events and failed persistence cannot
 * silently turn the app into a non-durable session.
 */
export function createWebApp(options = {}) {
  const runtime =
    options.runtime ||
    createAppRuntime({
      runtimeId: options.runtimeId || "einburgerungstest-web",
      name: "Einbürgerungstest Web",
    });

  registerSharedModules(runtime);
  registerWebPlatform(runtime);

  const persistence =
    options.persistence ||
    attachWebPersistence(runtime, options.persistenceOptions);

  let initialized = false;
  let stopSystemThemeWatch = () => {};

  const initialize = () => {
    if (initialized) return;
    initialized = true;
    stopSystemThemeWatch = watchWebSystemTheme(runtime);
    runtime.dispatch([appIds.events.appInitialize]);
    runtime.dispatch([appIds.events.questionsFetchRequested]);
  };

  let activeHydration;

  const reportHydrationFailure = (error) => {
    try {
      options.onHydrationError?.(error);
    } catch (callbackError) {
      // A diagnostics callback must not turn a handled storage failure into
      // an unhandled promise rejection or bypass the recovery UI.
      console.error("Hydration error callback failed:", callbackError);
    }
    return { ok: false, error };
  };

  const runHydration = () => {
    if (activeHydration) return activeHydration;

    let hydration;
    try {
      persistence.hydrate();
      hydration = Promise.resolve(persistence.whenHydrated());
    } catch (error) {
      hydration = Promise.reject(error);
    }

    const settledHydration = hydration
      .then(() => {
        initialize();
        return { ok: true };
      })
      .catch(reportHydrationFailure)
      .finally(() => {
        activeHydration = undefined;
      });

    activeHydration = settledHydration;
    return settledHydration;
  };

  const hydration = runHydration();

  return {
    runtime,
    persistence,
    hydration,
    retryHydration: runHydration,
    async dispose() {
      stopSystemThemeWatch();
      await persistence.dispose();
      runtime.dispose();
    },
  };
}
