import { stateKeys } from "../../app/uklad/catalog.js";
import type {
  AppLanguage,
  FederalLand,
  Theme,
} from "../../app/uklad/contracts.js";

export function createPreferencesState(initialLanguage: AppLanguage = "en") {
  return {
    [stateKeys.preferencesSelectedLanguage]: initialLanguage,
    [stateKeys.preferencesSelectedLand]: null as FederalLand | null,
    [stateKeys.preferencesTheme]: "light" as Theme,
    [stateKeys.preferencesUseSystemTheme]: true,
  } as const;
}
