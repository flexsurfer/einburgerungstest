import type { AppModule } from "../../app/uklad/register.js";
import { appIds, stateKeys } from "../../app/uklad/catalog.js";
import { migrateLegacyPracticeMistakes } from "./migration.js";

export const registerPracticeEvents: AppModule = (registrar) => {
  registrar.regEvent(
    appIds.events.practiceLegacyMistakesMigrated,
    ({ draftState }) => {
      migrateLegacyPracticeMistakes(draftState);
    },
  );

  registrar.regEvent(
    appIds.events.practiceQuestionAnswered,
    ({ draftState }, questionIndex, answerIndex) => {
      if (draftState[stateKeys.navigationSelectedCategory] === "test") {
        draftState[stateKeys.testSessionAnswers][questionIndex] = answerIndex;
        return;
      }

      draftState[stateKeys.practiceUserAnswers][questionIndex] = answerIndex;

      const question = draftState[stateKeys.questionsItems].find(
        (item) => item.globalIndex === questionIndex,
      );
      if (question !== undefined && answerIndex !== question.correct) {
        const attempts = draftState[stateKeys.practiceMistakes][questionIndex];
        if (attempts === undefined) {
          draftState[stateKeys.practiceMistakes][questionIndex] = [answerIndex];
        } else {
          attempts.push(answerIndex);
        }
      }
    },
  );

  registrar.regEvent(
    appIds.events.practiceMistakeRemoved,
    ({ draftState }, questionIndex) => {
      // Keep the latest answer/progress independent. The empty history is a
      // durable tombstone so the startup migration does not add it back.
      draftState[stateKeys.practiceMistakes][questionIndex] = [];

      if (draftState[stateKeys.navigationSelectedCategory] === "wrong") {
        draftState[stateKeys.navigationCurrentQuestionIndex] = Math.max(
          0,
          draftState[stateKeys.navigationCurrentQuestionIndex] - 1,
        );
      }
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
    draftState[stateKeys.practiceMistakes] = {};
  });

  registrar.regEvent(appIds.events.practiceClearAnswersRequested, () => {
    return [[appIds.effects.uiConfirmClear]];
  });

  registrar.regEvent(
    appIds.events.practiceQuestionAnswerCleared,
    ({ draftState }, questionIndex) => {
      if (draftState[stateKeys.navigationSelectedCategory] === "test") {
        delete draftState[stateKeys.testSessionAnswers][questionIndex];
        return;
      }

      delete draftState[stateKeys.practiceUserAnswers][questionIndex];
    },
  );
};
