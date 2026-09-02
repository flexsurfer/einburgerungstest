import {
  asyncStorageAdapter,
  persist,
  syncStorageAdapter,
  type AsyncStorageLike,
  type PersistDiagnostic,
  type PersistHandle,
  type PersistKey,
  type PersistKeyConfig,
  type SyncStorageLike,
} from "@ukladjs/persist";
import type { UkladRuntime } from "@ukladjs/core/vanilla";
import { stateKeys } from "./catalog.js";
import { FEDERAL_LANDS, type AppContracts } from "./contracts.js";
import type {
  Favorites,
  FederalLand,
  Theme,
  UserAnswers,
} from "./contracts.js";
import {
  createLegacyCompatibleAsyncStorage,
  createLegacyCompatibleSyncStorage,
  migrateAppPersistence,
} from "./legacy-persistence.js";
import type { LegacyStorageMap } from "./legacy-persistence.js";
import {
  APP_PERSISTENCE_PREFIX,
  APP_PERSISTENCE_VERSION,
} from "./persistence-config.js";

// Re-export the compatibility boundary from its dedicated module so existing
// imports keep working while new persistence code stays here.
export {
  APP_PERSISTENCE_LEGACY_VERSION,
  APP_PERSISTENCE_PREFIX,
  APP_PERSISTENCE_VERSION,
} from "./persistence-config.js";
export {
  appLegacyStorageKeys,
  createLegacyCompatibleAsyncStorage,
  createLegacyCompatibleSyncStorage,
  migrateAppPersistence,
} from "./legacy-persistence.js";
export type {
  LegacyPersistenceOptions,
  LegacyStorageMap,
} from "./legacy-persistence.js";

export type AppPersistenceTarget = "web" | "native";

type AppState = AppContracts["state"];
type PersistedKey<TKey extends keyof AppState & string> = PersistKeyConfig<
  TKey,
  AppState[TKey]
>;

export interface AppPersistenceAttachOptions {
  /** Only domain data is durable; screen/category navigation stays transient. */
  readonly target?: AppPersistenceTarget;
  readonly prefix?: string;
  readonly onError?: (diagnostic: PersistDiagnostic) => void;
  /** Override the legacy key map in an integration or migration fixture. */
  readonly legacyKeys?: LegacyStorageMap;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function deserializeUserAnswers(data: unknown): UserAnswers {
  if (!isRecord(data)) throw new Error("userAnswers must be an object");

  const result: UserAnswers = {};
  for (const [key, value] of Object.entries(data)) {
    const questionIndex = Number(key);
    if (
      !Number.isInteger(questionIndex) ||
      questionIndex < 0 ||
      typeof value !== "number" ||
      !Number.isInteger(value) ||
      value < 0
    ) {
      throw new Error("userAnswers contains an invalid answer");
    }
    result[questionIndex] = value;
  }
  return result;
}

function deserializeFavorites(data: unknown): Favorites {
  if (!Array.isArray(data)) throw new Error("favorites must be an array");

  const result: Favorites = [];
  for (const value of data) {
    if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
      throw new Error("favorites contains an invalid question index");
    }
    if (!result.includes(value)) result.push(value);
  }
  return result;
}

function deserializeTheme(data: unknown): Theme {
  if (data === "light" || data === "dark") return data;
  throw new Error("theme must be light or dark");
}

function deserializeUseSystemTheme(data: unknown): boolean {
  if (typeof data === "boolean") return data;
  throw new Error("useSystemTheme must be a boolean");
}

function deserializeSelectedLand(data: unknown): FederalLand | null {
  if (data === null) return null;
  if (typeof data === "string" && FEDERAL_LANDS.includes(data as FederalLand)) {
    return data as FederalLand;
  }
  throw new Error("selectedLand must be a German federal state or null");
}

function deserializePracticeGlobalIndex(data: unknown): number | null {
  if (data === null) return null;
  if (typeof data === "number" && Number.isInteger(data) && data > 0) {
    return data;
  }
  throw new Error("practiceGlobalIndex must be a positive integer or null");
}

function deserializePracticeLearnGlobalIndex(data: unknown): number | null {
  if (data === null) return null;
  if (typeof data === "number" && Number.isInteger(data) && data > 0) {
    return data;
  }
  throw new Error(
    "practiceLearnGlobalIndex must be a positive integer or null",
  );
}

const userAnswersKey: PersistedKey<typeof stateKeys.practiceUserAnswers> = {
  key: stateKeys.practiceUserAnswers,
  deserialize: deserializeUserAnswers,
};

const favoritesKey: PersistedKey<typeof stateKeys.practiceFavorites> = {
  key: stateKeys.practiceFavorites,
  deserialize: deserializeFavorites,
};

const themeKey: PersistedKey<typeof stateKeys.preferencesTheme> = {
  key: stateKeys.preferencesTheme,
  deserialize: deserializeTheme,
};

const useSystemThemeKey: PersistedKey<
  typeof stateKeys.preferencesUseSystemTheme
> = {
  key: stateKeys.preferencesUseSystemTheme,
  deserialize: deserializeUseSystemTheme,
};

const selectedLandKey: PersistedKey<typeof stateKeys.preferencesSelectedLand> =
  {
    key: stateKeys.preferencesSelectedLand,
    deserialize: deserializeSelectedLand,
  };

const practiceGlobalIndexKey: PersistedKey<
  typeof stateKeys.practiceGlobalIndex
> = {
  key: stateKeys.practiceGlobalIndex,
  deserialize: deserializePracticeGlobalIndex,
};

const practiceLearnGlobalIndexKey: PersistedKey<
  typeof stateKeys.practiceLearnGlobalIndex
> = {
  key: stateKeys.practiceLearnGlobalIndex,
  deserialize: deserializePracticeLearnGlobalIndex,
};

/** Explicit durable root configurations. Keep this map tied to `stateKeys`. */
export const appPersistenceKeys = Object.freeze({
  practiceUserAnswers: userAnswersKey,
  practiceFavorites: favoritesKey,
  practiceGlobalIndex: practiceGlobalIndexKey,
  practiceLearnGlobalIndex: practiceLearnGlobalIndexKey,
  preferencesTheme: themeKey,
  preferencesUseSystemTheme: useSystemThemeKey,
  preferencesSelectedLand: selectedLandKey,
});

/** Return the domain roots that are durable on every execution platform. */
export function getAppPersistenceKeys(
  _target: AppPersistenceTarget,
): readonly PersistKey<AppState>[] {
  return [
    appPersistenceKeys.practiceUserAnswers,
    appPersistenceKeys.practiceFavorites,
    appPersistenceKeys.practiceGlobalIndex,
    appPersistenceKeys.practiceLearnGlobalIndex,
    appPersistenceKeys.preferencesTheme,
    appPersistenceKeys.preferencesUseSystemTheme,
    appPersistenceKeys.preferencesSelectedLand,
  ];
}

function persistenceOptions(
  target: AppPersistenceTarget,
  options: AppPersistenceAttachOptions,
) {
  return {
    keys: getAppPersistenceKeys(target),
    prefix: options.prefix ?? APP_PERSISTENCE_PREFIX,
    version: APP_PERSISTENCE_VERSION,
    migrate: migrateAppPersistence,
    ...(options.onError === undefined ? {} : { onError: options.onError }),
  } as const;
}

/** Attach one synchronous (browser/localStorage or test) persistence owner. */
export function attachSyncAppPersistence(
  runtime: UkladRuntime<AppContracts>,
  storage: SyncStorageLike,
  options: AppPersistenceAttachOptions = {},
): PersistHandle {
  const target = options.target ?? "web";
  const prefix = options.prefix ?? APP_PERSISTENCE_PREFIX;
  const compatibleStorage = createLegacyCompatibleSyncStorage(storage, {
    prefix,
    legacyKeys: options.legacyKeys,
  });

  return persist(runtime, {
    storage: syncStorageAdapter(compatibleStorage),
    ...persistenceOptions(target, options),
  });
}

/** Attach one ordered asynchronous (React Native AsyncStorage) owner. */
export function attachAsyncAppPersistence(
  runtime: UkladRuntime<AppContracts>,
  storage: AsyncStorageLike,
  options: AppPersistenceAttachOptions = {},
): PersistHandle {
  const target = options.target ?? "native";
  const prefix = options.prefix ?? APP_PERSISTENCE_PREFIX;
  const compatibleStorage = createLegacyCompatibleAsyncStorage(storage, {
    prefix,
    legacyKeys: options.legacyKeys,
  });

  return persist(runtime, {
    storage: asyncStorageAdapter(compatibleStorage),
    ...persistenceOptions(target, options),
  });
}
