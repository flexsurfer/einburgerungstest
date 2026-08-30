import { stateKeys } from "../../app/uklad/catalog.js";
import type { Theme } from "../../app/uklad/contracts.js";

export function createPreferencesState() {
  return {
    [stateKeys.preferencesSelectedLanguage]: "en",
    [stateKeys.preferencesTheme]: "light" as Theme,
    [stateKeys.preferencesUseSystemTheme]: true,
  } as const;
}
