import type { AppModule } from "../../app/uklad/register.js";
import { appIds, stateKeys } from "../../app/uklad/catalog.js";

export const registerVocabularyEvents: AppModule = (registrar) => {
  registrar.regEvent(appIds.events.vocabularyToggled, ({ draftState }) => {
    if (draftState[stateKeys.vocabularyVisible]) {
      draftState[stateKeys.vocabularyVisible] = false;
      return;
    }

    draftState[stateKeys.vocabularyVisible] = true;
    draftState[stateKeys.vocabularyRendered] = true;
    return [[appIds.effects.uiSetBodyOverflow, { value: "hidden" }]];
  });

  registrar.regEvent(appIds.events.vocabularyUnmounted, ({ draftState }) => {
    draftState[stateKeys.vocabularyRendered] = false;
    return [[appIds.effects.uiSetBodyOverflow, { value: "auto" }]];
  });

  registrar.regEvent(
    appIds.events.vocabularyFetchRequested,
    ({ draftState }) => {
      draftState[stateKeys.vocabularyLoading] = true;
      draftState[stateKeys.vocabularyError] = null;
      return [[appIds.effects.dataFetch, { dataType: "vocabulary" }]];
    },
  );

  registrar.regEvent(
    appIds.events.vocabularyFetchSucceeded,
    ({ draftState }, data) => {
      draftState[stateKeys.vocabularyLoading] = false;
      draftState[stateKeys.vocabularyError] = null;
      draftState[stateKeys.vocabularyData] = data;
    },
  );

  registrar.regEvent(
    appIds.events.vocabularyFetchFailed,
    ({ draftState }, error) => {
      draftState[stateKeys.vocabularyLoading] = false;
      draftState[stateKeys.vocabularyError] = error;
    },
  );
};
