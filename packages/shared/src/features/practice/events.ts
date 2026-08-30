import type { AppModule } from "../../app/uklad/register.js";
import { appIds, stateKeys } from "../../app/uklad/catalog.js";

export const registerPracticeEvents: AppModule = (registrar) => {
  registrar.regEvent(
    appIds.events.practiceQuestionAnswered,
    ({ draftState }, questionIndex, answerIndex) => {
      if (draftState[stateKeys.navigationSelectedCategory] === "test") {
        draftState[stateKeys.testSessionAnswers][questionIndex] = answerIndex;
        return;
      }

      draftState[stateKeys.practiceUserAnswers][questionIndex] = answerIndex;
    },
  );

  registrar.regEvent(
    appIds.events.practiceFavoriteToggled,
    ({ draftState }, questionIndex) => {
      const favorites = draftState[stateKeys.practiceFavorites];
      const favoriteIndex = favorites.indexOf(questionIndex);

      if (favoriteIndex === -1) {
        favorites.push(questionIndex);
        return;
      }

      if (draftState[stateKeys.navigationSelectedCategory] === "favorites") {
        draftState[stateKeys.navigationCurrentQuestionIndex] = Math.max(
          0,
          draftState[stateKeys.navigationCurrentQuestionIndex] - 1,
        );
      }
      favorites.splice(favoriteIndex, 1);
    },
  );

  registrar.regEvent(appIds.events.practiceAnswersCleared, ({ draftState }) => {
    draftState[stateKeys.practiceUserAnswers] = {};
  });

  registrar.regEvent(appIds.events.practiceClearAnswersRequested, () => {
    return [[appIds.effects.uiConfirmClear]];
  });

  registrar.regEvent(
    appIds.events.practiceQuestionAnswerCleared,
    ({ draftState }, questionIndex) => {
      if (draftState[stateKeys.navigationSelectedCategory] === "wrong") {
        draftState[stateKeys.navigationCurrentQuestionIndex] = Math.max(
          0,
          draftState[stateKeys.navigationCurrentQuestionIndex] - 1,
        );
      }

      if (draftState[stateKeys.navigationSelectedCategory] === "test") {
        delete draftState[stateKeys.testSessionAnswers][questionIndex];
        return;
      }

      delete draftState[stateKeys.practiceUserAnswers][questionIndex];
    },
  );
};
