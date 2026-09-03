import type { AppModule } from "../../app/uklad/register.js";
import { appIds, stateKeys } from "../../app/uklad/catalog.js";
import { migrateLegacyPracticeMistakes } from "../practice/migration.js";
import { createQuestionsState } from "./state.js";

export const registerQuestionsEvents: AppModule = (registrar) => {
  registrar.regEvent(
    appIds.events.questionsFetchRequested,
    ({ draftState }) => {
      draftState[stateKeys.questionsLoading] = true;
      draftState[stateKeys.questionsError] = null;
      return [[appIds.effects.dataFetch, { dataType: "questions" }]];
    },
  );

  registrar.regEvent(
    appIds.events.questionsFetchSucceeded,
    ({ draftState }, data) => {
      const loadedState = createQuestionsState(data);

      draftState[stateKeys.questionsLoading] =
        loadedState[stateKeys.questionsLoading];
      draftState[stateKeys.questionsLoaded] =
        loadedState[stateKeys.questionsLoaded];
      draftState[stateKeys.questionsError] =
        loadedState[stateKeys.questionsError];
      draftState[stateKeys.questionsItems] =
        loadedState[stateKeys.questionsItems];
      draftState[stateKeys.questionsCategories] =
        loadedState[stateKeys.questionsCategories];
      migrateLegacyPracticeMistakes(draftState);
    },
  );

  registrar.regEvent(
    appIds.events.questionsFetchFailed,
    ({ draftState }, error) => {
      draftState[stateKeys.questionsLoading] = false;
      draftState[stateKeys.questionsError] = error;
    },
  );
};
