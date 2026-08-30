import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  attachAsyncAppPersistence,
  type AppRuntime,
  type AppPersistenceAttachOptions,
} from "@ebtest/shared/uklad";

export type MobilePersistenceOptions = Omit<
  AppPersistenceAttachOptions,
  "target"
>;

/**
 * Attach persistence to a bare React Native or Expo runtime using the
 * existing default AsyncStorage singleton and namespace.
 */
export function attachMobilePersistence(
  runtime: AppRuntime,
  options: MobilePersistenceOptions = {},
) {
  return attachAsyncAppPersistence(runtime, AsyncStorage, {
    ...options,
    target: "native",
  });
}
