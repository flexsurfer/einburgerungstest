import {
  appIds,
  createAppRuntime,
  registerSharedModules,
  type AppRuntime,
} from "@ebtest/shared/uklad";
import {
  attachWebPersistence,
  type WebPersistenceOptions,
} from "./persistence";
import {
  registerWebPlatform,
  watchWebSystemTheme,
  type WebPlatformOptions,
} from "./platform";
import { createBrowserNavigation } from "./navigation";

export interface WebBootstrapOptions extends WebPlatformOptions {
  readonly runtime?: AppRuntime;
  readonly runtimeId?: string;
  readonly persistence?: ReturnType<typeof attachWebPersistence>;
  readonly persistenceOptions?: WebPersistenceOptions;
  readonly onHydrationError?: (error: unknown) => void;
}

export type WebHydrationResult =
  { readonly ok: true } | { readonly ok: false; readonly error: unknown };

export interface WebApp {
  readonly runtime: AppRuntime;
  readonly persistence: ReturnType<typeof attachWebPersistence>;
  readonly hydration: Promise<WebHydrationResult>;
  readonly retryHydration: () => Promise<WebHydrationResult>;
  dispose(): Promise<void>;
}

/**
 * Create the browser runtime and start persistence hydration. Domain actions
 * are dispatched only after persistence hydration succeeds, so restored
 * answers cannot be overwritten by boot events and failed persistence cannot
 * silently turn the app into a non-durable session.
 */
export function createWebApp(options: WebBootstrapOptions = {}): WebApp {
  const runtime =
    options.runtime ||
    createAppRuntime({
      runtimeId: options.runtimeId || "einburgerungstest-web",
      name: "Einbürgerungstest Web",
    });

  registerSharedModules(runtime);
  const navigation = createBrowserNavigation(runtime);
  registerWebPlatform(runtime, options, navigation);

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

  let activeHydration: Promise<WebHydrationResult> | undefined;

  const reportHydrationFailure = (error: unknown): WebHydrationResult => {
    try {
      options.onHydrationError?.(error);
    } catch (callbackError) {
      // A diagnostics callback must not turn a handled storage failure into
      // an unhandled promise rejection or bypass the recovery UI.
      console.error("Hydration error callback failed:", callbackError);
    }
    return { ok: false, error };
  };

  const runHydration = (): Promise<WebHydrationResult> => {
    if (activeHydration) return activeHydration;

    let hydration: Promise<unknown>;
    try {
      persistence.hydrate();
      hydration = Promise.resolve(persistence.whenHydrated());
    } catch (error) {
      hydration = Promise.reject(error);
    }

    const settledHydration = hydration
      .then(() => {
        initialize();
        return { ok: true } as const;
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
      navigation.dispose();
      stopSystemThemeWatch();
      await persistence.dispose();
      runtime.dispose();
    },
  };
}
