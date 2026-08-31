import type { AppModule } from "../../app/uklad/register.js";
import { appIds, stateKeys } from "../../app/uklad/catalog.js";

export const registerPreferencesSubscriptions: AppModule = (registrar) => {
  registrar.regRootSub(
    appIds.subscriptions.preferencesSelectedLanguage,
    stateKeys.preferencesSelectedLanguage,
  );
  registrar.regRootSub(
    appIds.subscriptions.preferencesTheme,
    stateKeys.preferencesTheme,
  );
  registrar.regRootSub(
    appIds.subscriptions.preferencesUseSystemTheme,
    stateKeys.preferencesUseSystemTheme,
  );

  registrar.regSub(
    appIds.subscriptions.preferencesThemeSelection,
    () => [
      [appIds.subscriptions.preferencesTheme],
      [appIds.subscriptions.preferencesUseSystemTheme],
    ],
    ([theme, followsSystem]) => (followsSystem ? "system" : theme),
  );
};
