import {
  type AsyncStorageLike,
  type PersistData,
  type SyncStorageLike,
} from "@ukladjs/persist";
import {
  APP_PERSISTENCE_LEGACY_VERSION,
  APP_PERSISTENCE_PREFIX,
} from "./persistence-config.js";
import { stateKeys } from "./catalog.js";

/** Mapping from Uklad state roots to the old Reflex storage key names. */
export type LegacyStorageMap = Readonly<Partial<Record<string, string>>>;

export interface LegacyPersistenceOptions {
  readonly prefix?: string;
  readonly legacyKeys?: LegacyStorageMap;
}

const legacyStorageKeys: LegacyStorageMap = Object.freeze({
  [stateKeys.practiceUserAnswers]: "userAnswers",
  [stateKeys.practiceFavorites]: "favorites",
  [stateKeys.preferencesTheme]: "theme",
  // The old theme key also encoded whether the user chose manual mode. A
  // stored theme therefore means `useSystemTheme === false`; no stored theme
  // leaves the new default (`true`) untouched.
  [stateKeys.preferencesUseSystemTheme]: "theme",
});

/** Public read-only map used by migration diagnostics and fixture builders. */
export const appLegacyStorageKeys = legacyStorageKeys;

function decodeStateKey(
  storageKey: string,
  prefix: string,
): string | undefined {
  const marker = `${prefix}/`;
  if (!storageKey.startsWith(marker)) return undefined;

  try {
    return decodeURIComponent(storageKey.slice(marker.length));
  } catch {
    return undefined;
  }
}

function legacyKeyForStorageKey(
  storageKey: string,
  prefix: string,
  legacyKeys: Record<string, string>,
): string | undefined {
  const stateKey = decodeStateKey(storageKey, prefix);
  return stateKey === undefined ? undefined : legacyKeys[stateKey];
}

function themeModeEnvelope(version: number): string {
  return JSON.stringify({
    v: version,
    data: false,
  });
}

function wrapLegacyValue(raw: string): string {
  try {
    const data = JSON.parse(raw) as PersistData;
    return JSON.stringify({ v: APP_PERSISTENCE_LEGACY_VERSION, data });
  } catch {
    // Preserve malformed raw data so @ukladjs/persist reports a sanitized
    // invalid-json diagnostic instead of silently treating it as missing.
    return raw;
  }
}

function resolveLegacyOptions(options: LegacyPersistenceOptions = {}) {
  return {
    prefix: options.prefix ?? APP_PERSISTENCE_PREFIX,
    legacyKeys: {
      ...legacyStorageKeys,
      ...options.legacyKeys,
    },
  };
}

function isLegacyThemeModeKey(
  stateKey: string | undefined,
  legacyKey: string | undefined,
  legacyKeys: Record<string, string>,
): boolean {
  return (
    stateKey === stateKeys.preferencesUseSystemTheme &&
    legacyKey !== undefined &&
    legacyKey === legacyKeys[stateKeys.preferencesTheme]
  );
}

/**
 * Add a read-through importer for the old synchronous storage shape. New
 * writes stay in the Uklad namespace; legacy keys remain intact until an
 * explicit removal or purge.
 */
export function createLegacyCompatibleSyncStorage(
  storage: SyncStorageLike,
  options: LegacyPersistenceOptions = {},
): SyncStorageLike {
  const { prefix, legacyKeys } = resolveLegacyOptions(options);

  return {
    getItem(storageKey) {
      const canonical = storage.getItem(storageKey);
      if (canonical !== null) return canonical;

      const stateKey = decodeStateKey(storageKey, prefix);
      const legacyKey =
        stateKey === undefined ? undefined : legacyKeys[stateKey];
      if (legacyKey === undefined) return null;

      const legacyValue = storage.getItem(legacyKey);
      if (legacyValue === null) return null;
      if (isLegacyThemeModeKey(stateKey, legacyKey, legacyKeys)) {
        return themeModeEnvelope(APP_PERSISTENCE_LEGACY_VERSION);
      }
      return wrapLegacyValue(legacyValue);
    },
    setItem(storageKey, value) {
      storage.setItem(storageKey, value);
    },
    removeItem(storageKey) {
      storage.removeItem(storageKey);
      const legacyKey = legacyKeyForStorageKey(storageKey, prefix, legacyKeys);
      if (legacyKey !== undefined) storage.removeItem(legacyKey);
    },
  };
}

/** AsyncStorage equivalent of `createLegacyCompatibleSyncStorage`. */
export function createLegacyCompatibleAsyncStorage(
  storage: AsyncStorageLike,
  options: LegacyPersistenceOptions = {},
): AsyncStorageLike {
  const { prefix, legacyKeys } = resolveLegacyOptions(options);

  return {
    async getItem(storageKey) {
      const canonical = await storage.getItem(storageKey);
      if (canonical !== null) return canonical;

      const stateKey = decodeStateKey(storageKey, prefix);
      const legacyKey =
        stateKey === undefined ? undefined : legacyKeys[stateKey];
      if (legacyKey === undefined) return null;

      const legacyValue = await storage.getItem(legacyKey);
      if (legacyValue === null) return null;
      if (isLegacyThemeModeKey(stateKey, legacyKey, legacyKeys)) {
        return themeModeEnvelope(APP_PERSISTENCE_LEGACY_VERSION);
      }
      return wrapLegacyValue(legacyValue);
    },
    setItem(storageKey, value) {
      return storage.setItem(storageKey, value);
    },
    async removeItem(storageKey) {
      await storage.removeItem(storageKey);
      const legacyKey = legacyKeyForStorageKey(storageKey, prefix, legacyKeys);
      if (legacyKey !== undefined) await storage.removeItem(legacyKey);
    },
  };
}

/** Pure migration for the v1 envelope produced by the read-through importer. */
export function migrateAppPersistence(
  _key: string,
  data: unknown,
  fromVersion: number,
): PersistData {
  if (fromVersion !== APP_PERSISTENCE_LEGACY_VERSION) {
    throw new Error(`Unsupported persistence version: ${fromVersion}`);
  }
  return data as PersistData;
}
