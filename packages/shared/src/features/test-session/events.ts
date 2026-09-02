import type { AppModule } from "../../app/uklad/register.js";
import { appIds, stateKeys } from "../../app/uklad/catalog.js";
import { generateTest } from "./generate.js";
import {
  EINBUERGERUNGSTEST_DURATION_MS,
  EINBUERGERUNGSTEST_RULES,
} from "./rules.js";

export const registerTestSessionEvents: AppModule = (registrar) => {
  registrar.regEvent(
    appIds.events.testSessionStarted,
    ({ draftState, coeffects: { random, now } }) => {
      generateTest(
        draftState,
        EINBUERGERUNGSTEST_RULES.generalQuestionCount,
        random,
      );

      draftState[stateKeys.testSessionStatus] = "in-progress";
      draftState[stateKeys.testSessionEndsAt] =
        now + EINBUERGERUNGSTEST_DURATION_MS;
      draftState[stateKeys.testSessionFinishReason] = null;
      draftState[stateKeys.uiShowAnswers] = false;
      draftState[stateKeys.navigationIsLearnMode] = false;
      draftState[stateKeys.navigationSelectedCategory] = "test";
      draftState[stateKeys.navigationCurrentQuestionIndex] = 0;
      draftState[stateKeys.navigationQuestionPickerVisible] = false;
      draftState[stateKeys.navigationActiveScreen] = "questions";

      return [[appIds.effects.uiScrollToTop, { behavior: "auto" }]];
    },
    {
      coeffects: {
        random: appIds.coeffects.systemRandom,
        now: appIds.coeffects.systemNow,
      },
    },
  );

  registrar.regEvent(
    appIds.events.testSessionAnswerSelected,
    ({ draftState }, questionIndex, answerIndex) => {
      if (draftState[stateKeys.testSessionStatus] !== "in-progress") return;

      const question = draftState[stateKeys.testSessionQuestions].find(
        (item) => item.globalIndex === questionIndex,
      );
      if (
        !question ||
        !Number.isInteger(answerIndex) ||
        answerIndex < 0 ||
        answerIndex >= question.answers.length
      ) {
        return;
      }

      // A later selection replaces the earlier one, matching BAMF's official
      // correction instructions for the paper exam.
      draftState[stateKeys.testSessionAnswers][questionIndex] = answerIndex;
    },
  );

  registrar.regEvent(
    appIds.events.testSessionFinished,
    ({ draftState }, reason) => {
      if (draftState[stateKeys.testSessionStatus] !== "in-progress") return;

      draftState[stateKeys.testSessionStatus] = "completed";
      draftState[stateKeys.testSessionFinishReason] = reason;
      draftState[stateKeys.navigationQuestionPickerVisible] = false;
    },
  );
};
