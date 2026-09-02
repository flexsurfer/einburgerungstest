import { stateKeys } from "../../app/uklad/catalog.js";
import type { FederalLand, Theme } from "../../app/uklad/contracts.js";

export function createPreferencesState() {
  return {
    [stateKeys.preferencesSelectedLanguage]: "en",
    [stateKeys.preferencesSelectedLand]: null as FederalLand | null,
    [stateKeys.preferencesTheme]: "light" as Theme,
    [stateKeys.preferencesUseSystemTheme]: true,
  } as const;
}
