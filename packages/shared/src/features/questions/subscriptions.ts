import type { AppModule } from "../../app/uklad/register.js";
import { appIds, stateKeys } from "../../app/uklad/catalog.js";

export const registerQuestionsSubscriptions: AppModule = (registrar) => {
  registrar.regRootSub(
    appIds.subscriptions.questionsItems,
    stateKeys.questionsItems,
  );
  registrar.regRootSub(
    appIds.subscriptions.questionsCategories,
    stateKeys.questionsCategories,
  );
  registrar.regRootSub(
    appIds.subscriptions.questionsLoading,
    stateKeys.questionsLoading,
  );
  registrar.regRootSub(
    appIds.subscriptions.questionsLoaded,
    stateKeys.questionsLoaded,
  );
  registrar.regRootSub(
    appIds.subscriptions.questionsError,
    stateKeys.questionsError,
  );
};
