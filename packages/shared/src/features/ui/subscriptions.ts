import type { AppModule } from "../../app/uklad/register.js";
import { appIds, stateKeys } from "../../app/uklad/catalog.js";

export const registerUiSubscriptions: AppModule = (registrar) => {
  registrar.regRootSub(
    appIds.subscriptions.uiShowAnswers,
    stateKeys.uiShowAnswers,
  );
};
