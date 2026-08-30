import type { AppModule } from "../../app/uklad/register.js";
import { appIds, stateKeys } from "../../app/uklad/catalog.js";

export const registerVocabularySubscriptions: AppModule = (registrar) => {
  registrar.regRootSub(
    appIds.subscriptions.vocabularyData,
    stateKeys.vocabularyData,
  );
  registrar.regRootSub(
    appIds.subscriptions.vocabularyLoading,
    stateKeys.vocabularyLoading,
  );
  registrar.regRootSub(
    appIds.subscriptions.vocabularyError,
    stateKeys.vocabularyError,
  );
  registrar.regRootSub(
    appIds.subscriptions.vocabularyVisible,
    stateKeys.vocabularyVisible,
  );
  registrar.regRootSub(
    appIds.subscriptions.vocabularyRendered,
    stateKeys.vocabularyRendered,
  );
};
