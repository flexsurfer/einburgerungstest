import {
  appIds,
  createAppRuntime,
  registerSharedModules,
  type AppRuntime,
  type AppRuntimeOptions,
} from "@ebtest/shared/uklad";
import {
  mobileQuestionsData,
  registerMobilePlatform,
  watchMobileSystemTheme,
  type MobilePlatform,
} from "./platform";
import {
  attachMobilePersistence,
  type MobilePersistenceOptions,
} from "./persistence";
import { createMobilePersistenceLifecycle } from "./persistence-lifecycle";
import { resolveLanguage } from "./i18n";

export interface MobileBootstrapOptions {
  readonly platform: MobilePlatform;
  /** Preconfigured runtimes should be created with `createMobileAppRuntime`. */
  readonly runtime?: AppRuntime;
  readonly persistence?: ReturnType<typeof attachMobilePersistence>;
  readonly persistenceFactory?: (
    runtime: AppRuntime,
  ) => ReturnType<typeof attachMobilePersistence>;
  readonly persistenceOptions?: MobilePersistenceOptions;
  readonly runtimeId?: string;
  readonly onHydrationError?: (error: unknown) => void;
  readonly onPersistenceFlushError?: (error: unknown) => void;
}

export type MobileHydrationResult =
  { readonly ok: true } | { readonly ok: false; readonly error: unknown };

export interface MobileApp {
  readonly runtime: AppRuntime;
  readonly persistence: ReturnType<typeof attachMobilePersistence>;
  readonly hydration: Promise<MobileHydrationResult>;
  readonly retryHydration: () => Promise<MobileHydrationResult>;
  dispose(): Promise<void>;
}

export type MobileAppRuntimeOptions = Omit<
  AppRuntimeOptions,
  "initialQuestions"
>;

/** Create a native runtime whose first snapshot already contains questions. */
export function createMobileAppRuntime(
  options: MobileAppRuntimeOptions = {},
): AppRuntime {
  const {
    runtimeId = "einburgerungstest-native",
    name = "Einbürgerungstest Native",
    ...runtimeOptions
  } = options;

  return createAppRuntime({
    ...runtimeOptions,
    runtimeId,
    name,
    initialQuestions: mobileQuestionsData,
  });
}

/**
 * Create and start one native runtime with one persistence attachment. The
 * bundled question catalog is already present in the first runtime snapshot;
 * persisted user state continues hydrating asynchronously.
 */
export function bootstrapMobileApp(options: MobileBootstrapOptions): MobileApp {
  const runtime =
    options.runtime ??
    createMobileAppRuntime({
      runtimeId: options.runtimeId ?? "einburgerungstest-native",
      initialLanguage: resolveLanguage(options.platform.getDeviceLanguage?.()),
    });

  registerSharedModules(runtime);
  registerMobilePlatform(runtime, options.platform);

  const persistence =
    options.persistence ??
    options.persistenceFactory?.(runtime) ??
    attachMobilePersistence(runtime, options.persistenceOptions);
  const persistenceLifecycle = createMobilePersistenceLifecycle(persistence, {
    onFlushError: options.onPersistenceFlushError,
  });

  let initialized = false;
  let disposed = false;
  let stopSystemThemeWatch = () => {};

  const initialize = () => {
    if (initialized || disposed) return;
    initialized = true;
    // Questions are already present on native, so hydrated legacy answers can
    // be normalized immediately before the remaining boot actions are queued.
    runtime.dispatch([appIds.events.practiceLegacyMistakesMigrated]);
    stopSystemThemeWatch = watchMobileSystemTheme(runtime);
    runtime.dispatch([appIds.events.appInitialize]);
  };

  let activeHydration: Promise<MobileHydrationResult> | undefined;

  const reportHydrationFailure = (error: unknown): MobileHydrationResult => {
    try {
      options.onHydrationError?.(error);
    } catch (callbackError) {
      // A diagnostics callback must not turn a handled storage failure into
      // an unhandled promise rejection or bypass the recovery UI.
      console.error("Hydration error callback failed:", callbackError);
    }
    return { ok: false, error };
  };

  const runHydration = (): Promise<MobileHydrationResult> => {
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
        persistenceLifecycle.markHydrated();
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
      if (disposed) return;
      disposed = true;
      stopSystemThemeWatch();
      persistenceLifecycle.stop();

      let disposalError: unknown;
      try {
        await persistenceLifecycle.flush();
      } catch (error) {
        disposalError = error;
      }

      try {
        await persistence.dispose();
      } catch (error) {
        disposalError ??= error;
      }

      try {
        runtime.dispose();
      } catch (error) {
        disposalError ??= error;
      }

      if (disposalError !== undefined) throw disposalError;
    },
  };
}
