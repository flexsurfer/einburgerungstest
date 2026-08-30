import { afterEach, describe, expect, it, vi } from "vitest";
import { createUkladTestHarness } from "@ukladjs/core/testing";
import { PERSIST_IDS } from "@ukladjs/persist";
import {
  APP_PERSISTENCE_PREFIX,
  APP_PERSISTENCE_VERSION,
  appIds,
  attachAsyncAppPersistence,
  attachSyncAppPersistence,
  createLegacyCompatibleAsyncStorage,
  createLegacyCompatibleSyncStorage,
  createAppRuntime,
  registerSharedModules,
  stateKeys,
} from "../src/app/uklad/index.ts";

const runtimes = [];
const handles = [];

afterEach(async () => {
  while (handles.length > 0) await handles.pop().dispose();
  while (runtimes.length > 0) runtimes.pop().dispose();
  vi.restoreAllMocks();
});

function canonicalKey(stateKey, prefix = APP_PERSISTENCE_PREFIX) {
  return `${prefix}/${encodeURIComponent(stateKey)}`;
}

function envelope(data, version = APP_PERSISTENCE_VERSION) {
  return JSON.stringify({ v: version, data });
}

function legacy(value) {
  return JSON.stringify(value);
}

function createSyncStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  const calls = { get: [], set: [], remove: [] };
  const failures = {
    read: new Set(),
    write: new Set(),
    remove: new Set(),
  };

  return {
    values,
    calls,
    failures,
    getItem(key) {
      calls.get.push(key);
      if (failures.read.has(key)) throw new Error(`read ${key}`);
      return values.get(key) ?? null;
    },
    setItem(key, value) {
      calls.set.push([key, value]);
      if (failures.write.has(key)) throw new Error(`write ${key}`);
      values.set(key, value);
    },
    removeItem(key) {
      calls.remove.push(key);
      if (failures.remove.has(key)) throw new Error(`remove ${key}`);
      values.delete(key);
    },
  };
}

function createAsyncStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  const calls = { get: [], set: [], remove: [] };
  const failures = {
    read: new Set(),
    write: new Set(),
    remove: new Set(),
  };

  return {
    values,
    calls,
    failures,
    async getItem(key) {
      calls.get.push(key);
      await Promise.resolve();
      if (failures.read.has(key)) throw new Error(`read ${key}`);
      return values.get(key) ?? null;
    },
    async setItem(key, value) {
      calls.set.push([key, value]);
      await Promise.resolve();
      if (failures.write.has(key)) throw new Error(`write ${key}`);
      values.set(key, value);
    },
    async removeItem(key) {
      calls.remove.push(key);
      await Promise.resolve();
      if (failures.remove.has(key)) throw new Error(`remove ${key}`);
      values.delete(key);
    },
  };
}

function createFixture({ target, storage, onError } = {}) {
  const runtime = createAppRuntime({
    runtimeId: `persistence-${runtimes.length + 1}`,
  });
  runtimes.push(runtime);
  registerSharedModules(runtime);

  const handle =
    target === "native"
      ? attachAsyncAppPersistence(runtime, storage, { target, onError })
      : attachSyncAppPersistence(runtime, storage, { target, onError });
  handles.push(handle);

  return {
    handle,
    harness: createUkladTestHarness(runtime),
    runtime,
    storage,
  };
}

function hydrateSync(handle) {
  handle.hydrate();
  return handle.whenHydrated();
}

async function hydrateAsync(handle) {
  handle.hydrate();
  await handle.whenHydrated();
}

describe("Uklad Persist application boundary", () => {
  it("imports web legacy roots and preserves manual theme mode", async () => {
    const storage = createSyncStorage({
      userAnswers: legacy({ 1: 2 }),
      favorites: legacy([1, 4]),
      theme: legacy("dark"),
      selectedCategory: legacy("Politik"),
      currentQuestionIndex: legacy(7),
    });
    const { handle, harness } = createFixture({
      target: "web",
      storage,
    });

    await hydrateSync(handle);

    expect(harness.getSubscriptionValue([PERSIST_IDS.STATUS])).toBe("hydrated");
    expect(harness.getState()[stateKeys.practiceUserAnswers]).toEqual({ 1: 2 });
    expect(harness.getState()[stateKeys.practiceFavorites]).toEqual([1, 4]);
    expect(harness.getState()[stateKeys.preferencesTheme]).toBe("dark");
    expect(harness.getState()[stateKeys.preferencesUseSystemTheme]).toBe(false);
    // Web intentionally does not restore the native navigation roots.
    expect(harness.getState()[stateKeys.navigationSelectedCategory]).toBe(null);
    expect(harness.getState()[stateKeys.navigationCurrentQuestionIndex]).toBe(
      0,
    );

    for (const key of [
      stateKeys.practiceUserAnswers,
      stateKeys.practiceFavorites,
      stateKeys.preferencesTheme,
      stateKeys.preferencesUseSystemTheme,
    ]) {
      expect(JSON.parse(storage.values.get(canonicalKey(key)))).toEqual({
        v: APP_PERSISTENCE_VERSION,
        data: expect.anything(),
      });
    }
    expect(storage.values.get("userAnswers")).toBe(legacy({ 1: 2 }));
    expect(storage.values.get("theme")).toBe(legacy("dark"));
  });

  it("imports all durable roots for native AsyncStorage and keeps navigation", async () => {
    const storage = createAsyncStorage({
      userAnswers: legacy({ 2: 1 }),
      favorites: legacy([2]),
      theme: legacy("light"),
      selectedCategory: legacy("test"),
      currentQuestionIndex: legacy(3),
    });
    const { handle, harness } = createFixture({
      target: "native",
      storage,
    });

    await hydrateAsync(handle);

    expect(harness.getSubscriptionValue([PERSIST_IDS.STATUS])).toBe("hydrated");
    expect(harness.getState()[stateKeys.practiceUserAnswers]).toEqual({ 2: 1 });
    expect(harness.getState()[stateKeys.practiceFavorites]).toEqual([2]);
    expect(harness.getState()[stateKeys.preferencesTheme]).toBe("light");
    expect(harness.getState()[stateKeys.preferencesUseSystemTheme]).toBe(false);
    expect(harness.getState()[stateKeys.navigationSelectedCategory]).toBe(
      "test",
    );
    expect(harness.getState()[stateKeys.navigationCurrentQuestionIndex]).toBe(
      3,
    );
    await handle.flush();

    expect(storage.values.get("userAnswers")).toBe(legacy({ 2: 1 }));
    expect(storage.values.get("favorites")).toBe(legacy([2]));
    expect(storage.values.get("theme")).toBe(legacy("light"));
    expect(storage.values.get("selectedCategory")).toBe(legacy("test"));
    expect(storage.values.get("currentQuestionIndex")).toBe(legacy(3));
    expect(
      JSON.parse(
        storage.values.get(canonicalKey(stateKeys.practiceUserAnswers)),
      ),
    ).toEqual(JSON.parse(envelope({ 2: 1 })));
  });

  it("leaves the system-theme default enabled when the legacy theme is absent", async () => {
    const storage = createSyncStorage({
      userAnswers: legacy({ 1: 0 }),
    });
    const { handle, harness } = createFixture({ target: "web", storage });

    await hydrateSync(handle);

    expect(harness.getState()[stateKeys.preferencesTheme]).toBe("light");
    expect(harness.getState()[stateKeys.preferencesUseSystemTheme]).toBe(true);
    expect(storage.calls.set).toEqual([
      [canonicalKey(stateKeys.practiceUserAnswers), envelope({ 1: 0 })],
    ]);
  });

  it("does not let a missing canonical entry override a legacy value, but gives canonical precedence", () => {
    const storage = createSyncStorage({
      [canonicalKey(stateKeys.practiceFavorites)]: envelope([9]),
      favorites: legacy([1]),
    });
    const compatible = createLegacyCompatibleSyncStorage(storage);

    expect(compatible.getItem(canonicalKey(stateKeys.practiceFavorites))).toBe(
      envelope([9]),
    );
    expect(
      compatible.getItem(canonicalKey(stateKeys.practiceUserAnswers)),
    ).toBe(null);
  });

  it("removes the mapped legacy fallback from synchronous storage", () => {
    const storage = createSyncStorage({
      [canonicalKey(stateKeys.practiceUserAnswers)]: envelope({ 1: 0 }),
      userAnswers: legacy({ 1: 0 }),
    });
    const compatible = createLegacyCompatibleSyncStorage(storage);

    compatible.removeItem(canonicalKey(stateKeys.practiceUserAnswers));

    expect(
      storage.values.has(canonicalKey(stateKeys.practiceUserAnswers)),
    ).toBe(false);
    expect(storage.values.has("userAnswers")).toBe(false);
  });

  it("removes the mapped legacy fallback from asynchronous storage", async () => {
    const storage = createAsyncStorage({
      [canonicalKey(stateKeys.practiceUserAnswers)]: envelope({ 1: 0 }),
      userAnswers: legacy({ 1: 0 }),
    });
    const compatible = createLegacyCompatibleAsyncStorage(storage);

    await compatible.removeItem(canonicalKey(stateKeys.practiceUserAnswers));

    expect(
      storage.values.has(canonicalKey(stateKeys.practiceUserAnswers)),
    ).toBe(false);
    expect(storage.values.has("userAnswers")).toBe(false);
  });

  it("reports malformed raw legacy JSON without silently hydrating it", async () => {
    const diagnostics = [];
    const storage = createSyncStorage({ userAnswers: "not-json" });
    const { handle, harness } = createFixture({
      target: "web",
      storage,
      onError: (diagnostic) => diagnostics.push(diagnostic),
    });
    vi.spyOn(console, "warn").mockImplementation(() => {});

    handle.hydrate();

    await expect(handle.whenHydrated()).rejects.toThrow("Hydration failed");
    expect(harness.getSubscriptionValue([PERSIST_IDS.STATUS])).toBe("failed");
    expect(diagnostics).toContainEqual({
      code: "invalid-json",
      phase: "parse",
      key: stateKeys.practiceUserAnswers,
    });
    expect(storage.calls.set).toEqual([]);
    expect(storage.values.get("userAnswers")).toBe("not-json");
  });

  it("keeps writes closed after an async read failure and supports hydration retry", async () => {
    const diagnostics = [];
    const storage = createAsyncStorage();
    storage.failures.read.add(canonicalKey(stateKeys.practiceFavorites));
    const { handle, harness } = createFixture({
      target: "native",
      storage,
      onError: (diagnostic) => diagnostics.push(diagnostic),
    });
    vi.spyOn(console, "warn").mockImplementation(() => {});

    handle.hydrate();
    await expect(handle.whenHydrated()).rejects.toThrow("Hydration failed");
    expect(harness.getSubscriptionValue([PERSIST_IDS.STATUS])).toBe("failed");
    expect(diagnostics).toContainEqual({
      code: "storage-read-failed",
      phase: "read",
      key: stateKeys.practiceFavorites,
    });
    expect(storage.calls.set).toEqual([]);

    storage.failures.read.delete(canonicalKey(stateKeys.practiceFavorites));
    await hydrateAsync(handle);
    expect(harness.getSubscriptionValue([PERSIST_IDS.STATUS])).toBe("hydrated");
  });

  it("reports malformed current data and leaves affected roots at defaults", async () => {
    const diagnostics = [];
    const storage = createSyncStorage({
      [canonicalKey(stateKeys.practiceUserAnswers)]: envelope(["bad"]),
      [canonicalKey(stateKeys.practiceFavorites)]: envelope([1]),
      [canonicalKey(stateKeys.preferencesTheme)]: envelope("sepia"),
      [canonicalKey(stateKeys.preferencesUseSystemTheme)]: envelope(false),
    });
    const { handle, harness } = createFixture({
      target: "web",
      storage,
      onError: (diagnostic) => diagnostics.push(diagnostic),
    });
    vi.spyOn(console, "warn").mockImplementation(() => {});

    await expect(hydrateSync(handle)).rejects.toThrow("Hydration failed");

    expect(harness.getSubscriptionValue([PERSIST_IDS.STATUS])).toBe("failed");
    expect(harness.getState()[stateKeys.practiceUserAnswers]).toEqual({});
    // Valid entries may still overlay while the attachment remains failed.
    expect(harness.getState()[stateKeys.practiceFavorites]).toEqual([1]);
    expect(harness.getState()[stateKeys.preferencesTheme]).toBe("light");
    expect(harness.getState()[stateKeys.preferencesUseSystemTheme]).toBe(false);
    expect(diagnostics).toContainEqual({
      code: "deserialize-failed",
      phase: "deserialize",
      key: stateKeys.practiceUserAnswers,
    });
    expect(diagnostics).toContainEqual({
      code: "deserialize-failed",
      phase: "deserialize",
      key: stateKeys.preferencesTheme,
    });
    expect(storage.calls.set).toEqual([]);
  });

  it("purges malformed legacy data so a later hydration can use defaults", async () => {
    const storage = createSyncStorage({ userAnswers: "not-json" });
    const { handle, harness } = createFixture({
      target: "web",
      storage,
    });
    vi.spyOn(console, "warn").mockImplementation(() => {});

    handle.hydrate();
    await expect(handle.whenHydrated()).rejects.toThrow("Hydration failed");

    await handle.purge();
    await hydrateSync(handle);

    expect(harness.getSubscriptionValue([PERSIST_IDS.STATUS])).toBe("hydrated");
    expect(harness.getState()[stateKeys.practiceUserAnswers]).toEqual({});
    expect(storage.values.has("userAnswers")).toBe(false);
  });

  it("migrates an older canonical envelope and rewrites only that root", async () => {
    const storage = createSyncStorage({
      [canonicalKey(stateKeys.practiceFavorites)]: envelope([3], 1),
    });
    const { handle, harness } = createFixture({ target: "web", storage });

    await hydrateSync(handle);

    expect(harness.getState()[stateKeys.practiceFavorites]).toEqual([3]);
    expect(storage.calls.set).toEqual([
      [canonicalKey(stateKeys.practiceFavorites), envelope([3])],
    ]);
  });

  it("does not echo a current hydration snapshot back to storage", async () => {
    const storage = createSyncStorage({
      [canonicalKey(stateKeys.practiceUserAnswers)]: envelope({ 1: 0 }),
      [canonicalKey(stateKeys.practiceFavorites)]: envelope([1]),
      [canonicalKey(stateKeys.preferencesTheme)]: envelope("dark"),
      [canonicalKey(stateKeys.preferencesUseSystemTheme)]: envelope(false),
    });
    const { handle } = createFixture({ target: "web", storage });

    await hydrateSync(handle);

    expect(storage.calls.set).toEqual([]);
  });

  it("keeps system mode when a current canonical theme has no mode root", async () => {
    const storage = createSyncStorage({
      [canonicalKey(stateKeys.preferencesTheme)]: envelope("dark"),
    });
    const { handle, harness } = createFixture({ target: "web", storage });

    await hydrateSync(handle);

    expect(harness.getState()[stateKeys.preferencesTheme]).toBe("dark");
    expect(harness.getState()[stateKeys.preferencesUseSystemTheme]).toBe(true);
    expect(storage.calls.set).toEqual([]);
  });

  it("keeps system mode for async storage when the mode root is absent", async () => {
    const storage = createAsyncStorage({
      [canonicalKey(stateKeys.preferencesTheme)]: envelope("dark"),
    });
    const { handle, harness } = createFixture({ target: "native", storage });

    await hydrateAsync(handle);

    expect(harness.getState()[stateKeys.preferencesTheme]).toBe("dark");
    expect(harness.getState()[stateKeys.preferencesUseSystemTheme]).toBe(true);
    expect(storage.calls.set).toEqual([]);
  });

  it("keeps async write failures visible to flush until a later write succeeds", async () => {
    const storage = createAsyncStorage();
    const diagnostics = [];
    const { handle, harness } = createFixture({
      target: "native",
      storage,
      onError: (diagnostic) => diagnostics.push(diagnostic),
    });
    vi.spyOn(console, "warn").mockImplementation(() => {});

    await hydrateAsync(handle);
    storage.failures.write.add(canonicalKey(stateKeys.practiceUserAnswers));
    harness.dispatchSync([appIds.events.practiceQuestionAnswered, 1, 0]);

    await expect(handle.flush()).rejects.toThrow("storage writes failed");
    expect(diagnostics).toContainEqual({
      code: "storage-write-failed",
      phase: "write",
      key: stateKeys.practiceUserAnswers,
    });

    storage.failures.write.delete(canonicalKey(stateKeys.practiceUserAnswers));
    harness.dispatchSync([appIds.events.practiceQuestionAnswered, 1, 1]);
    await handle.flush();
    expect(
      storage.values.get(canonicalKey(stateKeys.practiceUserAnswers)),
    ).toBe(envelope({ 1: 1 }));
  });

  it("reports synchronous write failures without aborting the causing event", async () => {
    const diagnostics = [];
    const storage = createSyncStorage();
    const { handle, harness } = createFixture({
      target: "web",
      storage,
      onError: (diagnostic) => diagnostics.push(diagnostic),
    });
    vi.spyOn(console, "warn").mockImplementation(() => {});

    await hydrateSync(handle);
    storage.failures.write.add(canonicalKey(stateKeys.practiceFavorites));
    harness.dispatchSync([appIds.events.practiceFavoriteToggled, 4]);

    expect(harness.getState()[stateKeys.practiceFavorites]).toEqual([4]);
    expect(diagnostics).toContainEqual({
      code: "storage-write-failed",
      phase: "write",
      key: stateKeys.practiceFavorites,
    });

    storage.failures.write.delete(canonicalKey(stateKeys.practiceFavorites));
    harness.dispatchSync([appIds.events.practiceFavoriteToggled, 4]);
    harness.dispatchSync([appIds.events.practiceFavoriteToggled, 4]);
    expect(storage.values.get(canonicalKey(stateKeys.practiceFavorites))).toBe(
      envelope([4]),
    );
  });

  it("purges configured entries without resetting state and reopens writes", async () => {
    const storage = createAsyncStorage({
      [canonicalKey(stateKeys.practiceUserAnswers)]: envelope({ 1: 0 }),
      [canonicalKey(stateKeys.practiceFavorites)]: envelope([1]),
      [canonicalKey(stateKeys.preferencesTheme)]: envelope("dark"),
      [canonicalKey(stateKeys.preferencesUseSystemTheme)]: envelope(false),
      [canonicalKey(stateKeys.navigationSelectedCategory)]: envelope("Politik"),
      [canonicalKey(stateKeys.navigationCurrentQuestionIndex)]: envelope(2),
      userAnswers: legacy({ 1: 0 }),
      favorites: legacy([1]),
      theme: legacy("dark"),
      selectedCategory: legacy("Politik"),
      currentQuestionIndex: legacy(2),
    });
    const { handle, harness } = createFixture({
      target: "native",
      storage,
    });

    await hydrateAsync(handle);
    const beforePurge = {
      ...harness.getState()[stateKeys.practiceUserAnswers],
    };
    await handle.purge();
    await harness.flush();

    expect(harness.getState()[stateKeys.practiceUserAnswers]).toEqual(
      beforePurge,
    );
    expect(harness.getSubscriptionValue([PERSIST_IDS.STATUS])).toBe("hydrated");
    for (const key of [
      stateKeys.practiceUserAnswers,
      stateKeys.practiceFavorites,
      stateKeys.preferencesTheme,
      stateKeys.preferencesUseSystemTheme,
      stateKeys.navigationSelectedCategory,
      stateKeys.navigationCurrentQuestionIndex,
    ]) {
      expect(storage.values.has(canonicalKey(key))).toBe(false);
    }
    for (const key of [
      "userAnswers",
      "favorites",
      "theme",
      "selectedCategory",
      "currentQuestionIndex",
    ]) {
      expect(storage.values.has(key)).toBe(false);
    }

    harness.dispatchSync([appIds.events.practiceQuestionAnswered, 1, 1]);
    await handle.flush();
    expect(
      storage.values.get(canonicalKey(stateKeys.practiceUserAnswers)),
    ).toBe(envelope({ 1: 1 }));
  });

  it("reports purge failures and permits a later purge retry", async () => {
    const diagnostics = [];
    const storage = createAsyncStorage({
      [canonicalKey(stateKeys.practiceFavorites)]: envelope([1]),
    });
    const { handle, harness } = createFixture({
      target: "native",
      storage,
      onError: (diagnostic) => diagnostics.push(diagnostic),
    });
    vi.spyOn(console, "warn").mockImplementation(() => {});

    await hydrateAsync(handle);
    storage.failures.remove.add(canonicalKey(stateKeys.practiceFavorites));
    await expect(handle.purge()).rejects.toThrow("Purge failed");
    await harness.flush();

    expect(harness.getSubscriptionValue([PERSIST_IDS.STATUS])).toBe("failed");
    expect(diagnostics).toContainEqual({
      code: "storage-remove-failed",
      phase: "purge",
      key: stateKeys.practiceFavorites,
    });
    expect(storage.values.has(canonicalKey(stateKeys.practiceFavorites))).toBe(
      true,
    );

    storage.failures.remove.delete(canonicalKey(stateKeys.practiceFavorites));
    await handle.purge();
    await harness.flush();
    expect(harness.getSubscriptionValue([PERSIST_IDS.STATUS])).toBe("hydrated");
    expect(storage.values.has(canonicalKey(stateKeys.practiceFavorites))).toBe(
      false,
    );
  });

  it("allows a disposed attachment to be reattached to the same runtime", async () => {
    const storage = createSyncStorage();
    const runtime = createAppRuntime({ runtimeId: "reattach" });
    runtimes.push(runtime);
    registerSharedModules(runtime);
    const first = attachSyncAppPersistence(runtime, storage, { target: "web" });
    handles.push(first);

    expect(() =>
      attachSyncAppPersistence(runtime, storage, { target: "web" }),
    ).toThrow("already attached");

    await first.dispose();
    const second = attachSyncAppPersistence(runtime, storage, {
      target: "web",
    });
    handles.push(second);
    await hydrateSync(second);
    expect(second).toBeDefined();
  });
});
