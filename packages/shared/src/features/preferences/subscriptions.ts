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
};
