import { afterEach, describe, expect, it, vi } from "vitest";
import { createUkladTestHarness } from "@ukladjs/core/testing";
import { Alert, AppState, Appearance } from "react-native";
import {
  appIds,
  createAppRuntime,
  registerSharedModules,
  stateKeys,
} from "@ebtest/shared/uklad";
import {
  registerMobilePlatform,
  watchMobileSystemTheme,
  type MobilePlatform,
} from "../src/platform";
import { bootstrapMobileApp } from "../src/bootstrap";

vi.mock("@react-native-async-storage/async-storage", () => ({
  default: {
    getItem: vi.fn(async () => null),
    setItem: vi.fn(async () => undefined),
    removeItem: vi.fn(async () => undefined),
  },
}));

const runtimes: Array<ReturnType<typeof createAppRuntime>> = [];
const apps: Array<ReturnType<typeof bootstrapMobileApp>> = [];
type TestAppStateStatus = "active" | "inactive" | "background";

function emitAppStateChange(state: TestAppStateStatus): void {
  (
    AppState as unknown as {
      emitChange(nextState: TestAppStateStatus): void;
    }
  ).emitChange(state);
}

afterEach(async () => {
  while (apps.length > 0) await apps.pop()?.dispose();
  while (runtimes.length > 0) runtimes.pop()?.dispose();
  vi.restoreAllMocks();
});

function createRuntime(
  platform: MobilePlatform = { applySystemBarTheme: vi.fn() },
) {
  const runtime = createAppRuntime({
    runtimeId: `mobile-platform-${runtimes.length + 1}`,
  });
  runtimes.push(runtime);
  registerSharedModules(runtime);
  registerMobilePlatform(runtime, platform);
  return { runtime, harness: createUkladTestHarness(runtime), platform };
}

describe("Uklad mobile platform", () => {
  it("loads bundled questions through the shared request lifecycle", async () => {
    const { harness } = createRuntime();

    harness.dispatchSync([appIds.events.questionsFetchRequested]);
    await harness.flush();

    expect(harness.getState()[stateKeys.questionsLoading]).toBe(false);
    expect(harness.getState()[stateKeys.questionsLoaded]).toBe(true);
    expect(harness.getState()[stateKeys.questionsItems].length).toBeGreaterThan(
      0,
    );

    harness.dispatchSync([appIds.events.vocabularyFetchRequested]);
    await harness.flush();
    expect(harness.getState()[stateKeys.vocabularyData]).not.toBeNull();
  });

  it("applies the persisted/system theme through the host platform", () => {
    const applySystemBarTheme = vi.fn();
    const { harness } = createRuntime({ applySystemBarTheme });
    vi.spyOn(Appearance, "getColorScheme").mockReturnValue("dark");

    harness.dispatchSync([appIds.events.appInitialize]);

    expect(harness.getState()[stateKeys.preferencesTheme]).toBe("dark");
    expect(applySystemBarTheme).toHaveBeenCalledWith("dark");
  });

  it("forwards native system-theme changes only while system mode is enabled", async () => {
    const listeners: Array<
      (event: { colorScheme: "light" | "dark" | null }) => void
    > = [];
    vi.spyOn(Appearance, "addChangeListener").mockImplementation((listener) => {
      listeners.push(listener);
      return { remove: vi.fn() };
    });

    const { runtime, harness } = createRuntime();
    const stop = watchMobileSystemTheme(runtime);

    listeners[0]?.({ colorScheme: "dark" });
    await harness.flush();
    expect(harness.getState()[stateKeys.preferencesTheme]).toBe("dark");

    harness.dispatchSync([appIds.events.preferencesThemeToggled]);
    listeners[0]?.({ colorScheme: "light" });
    await harness.flush();
    expect(harness.getState()[stateKeys.preferencesTheme]).toBe("light");

    stop();
  });

  it("confirms before clearing answers through the native dialog", async () => {
    vi.spyOn(Alert, "alert").mockImplementation((_title, _message, buttons) => {
      buttons?.[1]?.onPress?.();
    });
    const { harness } = createRuntime();

    harness.dispatchSync([appIds.events.practiceQuestionAnswered, 1, 0]);
    harness.dispatchSync([appIds.events.practiceClearAnswersRequested]);
    await harness.flush();

    expect(harness.getState()[stateKeys.practiceUserAnswers]).toEqual({});
    expect(Alert.alert).toHaveBeenCalledWith(
      "Clear progress",
      "Are you sure you want to clear ALL your progress?",
      expect.any(Array),
    );
  });

  it("does not dispatch boot events until persistence hydration settles", async () => {
    let resolveHydration: (() => void) | undefined;
    const hydrationPromise = new Promise<void>((resolve) => {
      resolveHydration = resolve;
    });
    const persistence = {
      hydrate: vi.fn(),
      whenHydrated: vi.fn(() => hydrationPromise),
      purge: vi.fn(async () => undefined),
      flush: vi.fn(async () => undefined),
      dispose: vi.fn(async () => undefined),
    } as unknown as ReturnType<
      typeof import("../src/persistence").attachMobilePersistence
    >;
    const applySystemBarTheme = vi.fn();
    const runtime = createAppRuntime({
      runtimeId: "mobile-bootstrap",
    });
    runtimes.push(runtime);

    const app = bootstrapMobileApp({
      runtime,
      platform: { applySystemBarTheme },
      persistence,
    });
    apps.push(app);
    const harness = createUkladTestHarness(runtime);

    expect(persistence.hydrate).toHaveBeenCalledTimes(1);
    expect(harness.getState()[stateKeys.questionsLoading]).toBe(false);
    emitAppStateChange("background");
    await Promise.resolve();
    expect(persistence.flush).not.toHaveBeenCalled();

    resolveHydration?.();
    await app.hydration;
    await harness.flush();

    expect(harness.getState()[stateKeys.questionsLoaded]).toBe(true);
    expect(applySystemBarTheme).toHaveBeenCalledWith("light");
  });

  it("does not purge stored data when hydration fails", async () => {
    const purge = vi.fn();
    const onHydrationError = vi.fn();
    const persistence = {
      hydrate: vi.fn(),
      whenHydrated: vi.fn(() =>
        Promise.reject(new Error("temporary read failure")),
      ),
      purge,
      flush: vi.fn(async () => undefined),
      dispose: vi.fn(async () => undefined),
    } as unknown as ReturnType<
      typeof import("../src/persistence").attachMobilePersistence
    >;
    const runtime = createAppRuntime({
      runtimeId: "mobile-hydration-failure",
    });
    runtimes.push(runtime);
    const harness = createUkladTestHarness(runtime);

    const app = bootstrapMobileApp({
      runtime,
      platform: { applySystemBarTheme: vi.fn() },
      persistence,
      onHydrationError,
    });
    apps.push(app);

    await app.hydration;

    expect(onHydrationError).toHaveBeenCalledOnce();
    expect(purge).not.toHaveBeenCalled();
    expect(harness.getState()[stateKeys.questionsLoading]).toBe(false);
    expect(harness.getState()[stateKeys.questionsLoaded]).toBe(false);
  });

  it("keeps boot actions blocked until a hydration retry succeeds", async () => {
    let hydrationAttempt = 0;
    const persistence = {
      hydrate: vi.fn(),
      whenHydrated: vi.fn(() => {
        hydrationAttempt += 1;
        return hydrationAttempt === 1
          ? Promise.reject(new Error("temporary read failure"))
          : Promise.resolve();
      }),
      purge: vi.fn(async () => undefined),
      flush: vi.fn(async () => undefined),
      dispose: vi.fn(async () => undefined),
    } as unknown as ReturnType<
      typeof import("../src/persistence").attachMobilePersistence
    >;
    const runtime = createAppRuntime({
      runtimeId: "mobile-hydration-retry",
    });
    runtimes.push(runtime);
    const app = bootstrapMobileApp({
      runtime,
      platform: { applySystemBarTheme: vi.fn() },
      persistence,
    });
    apps.push(app);
    const harness = createUkladTestHarness(runtime);

    expect((await app.hydration).ok).toBe(false);
    expect(harness.getState()[stateKeys.questionsLoading]).toBe(false);
    expect(harness.getState()[stateKeys.questionsLoaded]).toBe(false);

    expect((await app.retryHydration()).ok).toBe(true);
    await harness.flush();
    expect(harness.getState()[stateKeys.questionsLoading]).toBe(false);
    expect(harness.getState()[stateKeys.questionsLoaded]).toBe(true);
    expect(persistence.hydrate).toHaveBeenCalledTimes(2);
  });

  it("flushes queued persistence when the app enters a background state", async () => {
    const persistence = {
      hydrate: vi.fn(),
      whenHydrated: vi.fn(async () => undefined),
      purge: vi.fn(async () => undefined),
      flush: vi.fn(async () => undefined),
      dispose: vi.fn(async () => undefined),
    } as unknown as ReturnType<
      typeof import("../src/persistence").attachMobilePersistence
    >;
    const app = bootstrapMobileApp({
      platform: { applySystemBarTheme: vi.fn() },
      persistence,
    });
    apps.push(app);

    await app.hydration;
    emitAppStateChange("inactive");
    emitAppStateChange("background");
    await Promise.resolve();

    expect(persistence.flush).toHaveBeenCalledTimes(1);
  });

  it("reports background flush failures without an unhandled rejection", async () => {
    const onPersistenceFlushError = vi.fn();
    let flushAttempt = 0;
    const persistence = {
      hydrate: vi.fn(),
      whenHydrated: vi.fn(async () => undefined),
      purge: vi.fn(async () => undefined),
      flush: vi.fn(async () => {
        flushAttempt += 1;
        if (flushAttempt === 1) throw new Error("background flush failed");
      }),
      dispose: vi.fn(async () => undefined),
    } as unknown as ReturnType<
      typeof import("../src/persistence").attachMobilePersistence
    >;
    const app = bootstrapMobileApp({
      platform: { applySystemBarTheme: vi.fn() },
      persistence,
      onPersistenceFlushError,
    });
    apps.push(app);

    await app.hydration;
    emitAppStateChange("background");
    await vi.waitFor(() =>
      expect(onPersistenceFlushError).toHaveBeenCalledWith(
        expect.objectContaining({ message: "background flush failed" }),
      ),
    );
  });

  it("flushes before disposal and removes the AppState listener", async () => {
    const lifecycle: string[] = [];
    const persistence = {
      hydrate: vi.fn(),
      whenHydrated: vi.fn(async () => undefined),
      purge: vi.fn(async () => undefined),
      flush: vi.fn(async () => {
        lifecycle.push("flush");
      }),
      dispose: vi.fn(async () => {
        lifecycle.push("dispose");
      }),
    } as unknown as ReturnType<
      typeof import("../src/persistence").attachMobilePersistence
    >;
    const app = bootstrapMobileApp({
      platform: { applySystemBarTheme: vi.fn() },
      persistence,
    });
    apps.push(app);

    await app.hydration;
    await app.dispose();
    expect(persistence.flush).toHaveBeenCalledTimes(1);
    expect(lifecycle).toEqual(["flush", "dispose"]);

    emitAppStateChange("background");
    await Promise.resolve();
    expect(persistence.flush).toHaveBeenCalledTimes(1);
    expect(persistence.dispose).toHaveBeenCalledOnce();
  });
});
