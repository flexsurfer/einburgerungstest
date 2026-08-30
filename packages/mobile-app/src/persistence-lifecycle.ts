import { AppState, type AppStateStatus } from "react-native";

export interface FlushablePersistence {
  flush(): Promise<void>;
}

export interface MobilePersistenceLifecycleOptions {
  readonly onFlushError?: (error: unknown) => void;
}

export interface MobilePersistenceLifecycle {
  markHydrated(): void;
  flush(): Promise<void>;
  stop(): void;
}

/**
 * Connect the AsyncStorage persistence owner to native lifecycle boundaries.
 * AppState events are best-effort; explicit disposal still awaits the final
 * flush before fencing the persistence attachment.
 */
export function createMobilePersistenceLifecycle(
  persistence: FlushablePersistence,
  options: MobilePersistenceLifecycleOptions = {},
): MobilePersistenceLifecycle {
  let hydrationSucceeded = false;
  let activeFlush: Promise<void> | undefined;
  let stopped = false;

  const reportFlushFailure = (error: unknown): void => {
    try {
      options.onFlushError?.(error);
    } catch (callbackError) {
      // A diagnostics callback must not create an unhandled rejection or
      // prevent the persistence lifecycle from releasing its listener.
      console.error("Persistence flush error callback failed:", callbackError);
    }
  };

  const flush = (): Promise<void> => {
    if (!hydrationSucceeded) return Promise.resolve();
    if (activeFlush) return activeFlush;

    let pendingFlush: Promise<void>;
    try {
      pendingFlush = Promise.resolve(persistence.flush());
    } catch (error) {
      pendingFlush = Promise.reject(error);
    }

    const trackedFlush = pendingFlush
      .catch((error) => {
        reportFlushFailure(error);
        throw error;
      })
      .finally(() => {
        activeFlush = undefined;
      });

    activeFlush = trackedFlush;
    return trackedFlush;
  };

  const handleAppStateChange = (nextState: AppStateStatus): void => {
    if (stopped) return;
    if (nextState !== "inactive" && nextState !== "background") return;

    // AppState cannot await this callback. Catch the rejection here while
    // keeping it observable through onFlushError and explicit flush callers.
    void flush().catch(() => undefined);
  };

  const subscription =
    typeof AppState.addEventListener === "function"
      ? AppState.addEventListener("change", handleAppStateChange)
      : undefined;

  return {
    markHydrated() {
      hydrationSucceeded = true;
    },
    flush,
    stop() {
      if (stopped) return;
      stopped = true;
      subscription?.remove();
    },
  };
}
