import type { AppModule } from "../../app/uklad/register.js";
import { appIds, stateKeys } from "../../app/uklad/catalog.js";

export const registerPreferencesEvents: AppModule = (registrar) => {
  registrar.regEvent(
    appIds.events.preferencesLanguageSelected,
    ({ draftState }, language) => {
      draftState[stateKeys.preferencesSelectedLanguage] = language;
    },
  );

  registrar.regEvent(
    appIds.events.preferencesLandSelected,
    ({ draftState }, land) => {
      draftState[stateKeys.preferencesSelectedLand] = land;
    },
  );

  registrar.regEvent(
    appIds.events.preferencesThemeSelected,
    ({ draftState, coeffects: { system } }, selection) => {
      const followsSystem = selection === "system";
      const theme = followsSystem ? (system ?? "light") : selection;

      draftState[stateKeys.preferencesUseSystemTheme] = followsSystem;
      draftState[stateKeys.preferencesTheme] = theme;

      return [[appIds.effects.uiSetBodyTheme, { theme }]];
    },
    { coeffects: { system: appIds.coeffects.systemColorScheme } },
  );

  registrar.regEvent(
    appIds.events.preferencesThemeToggled,
    ({ draftState }) => {
      const theme = draftState[stateKeys.preferencesTheme];
      const nextTheme = theme === "light" ? "dark" : "light";
      draftState[stateKeys.preferencesTheme] = nextTheme;
      draftState[stateKeys.preferencesUseSystemTheme] = false;

      return [[appIds.effects.uiSetBodyTheme, { theme: nextTheme }]];
    },
  );

  registrar.regEvent(
    appIds.events.preferencesSystemThemeChanged,
    ({ draftState }, scheme) => {
      if (draftState[stateKeys.preferencesUseSystemTheme]) {
        const theme = scheme ?? "light";
        draftState[stateKeys.preferencesTheme] = theme;
        return [[appIds.effects.uiSetBodyTheme, { theme }]];
      }
    },
  );
};
