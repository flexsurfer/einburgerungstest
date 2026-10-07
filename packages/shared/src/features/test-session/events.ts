import type { AppModule } from "../../app/uklad/register.js";
import { appIds, stateKeys } from "../../app/uklad/catalog.js";
import { generateTest } from "./generate.js";
import {
  isReviewFilter,
  selectReviewFilter,
  selectReviewItems,
} from "./review.js";
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
      draftState.testSessionReviewVisible = false;
      draftState.testSessionReviewFilter = "all";
      draftState.testSessionReviewQuestionIndex = 0;
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

      // Record only the submitted choice. The completion guard ensures that
      // repeated Finish/timeout events cannot count the same exam twice.
      for (const question of draftState.testSessionQuestions) {
        const answerIndex = draftState.testSessionAnswers[question.globalIndex];
        if (answerIndex !== undefined && answerIndex !== question.correct) {
          const attempts = (draftState.practiceMistakes[
            question.globalIndex
          ] ??= []);
          attempts.push(answerIndex);
        }
      }

      draftState[stateKeys.testSessionStatus] = "completed";
      draftState[stateKeys.testSessionFinishReason] = reason;
      draftState[stateKeys.navigationQuestionPickerVisible] = false;
      draftState.testSessionReviewVisible = false;
      return [[appIds.effects.uiScrollToTop, { behavior: "auto" }]];
    },
  );

  registrar.regEvent(
    appIds.events.testSessionReviewOpened,
    ({ draftState }, filter) => {
      if (draftState.testSessionStatus !== "completed") return;
      const nextFilter = filter ?? draftState.testSessionReviewFilter;
      if (!isReviewFilter(nextFilter)) return;
      selectReviewFilter(draftState, nextFilter);
      draftState.testSessionReviewVisible = true;
      return [[appIds.effects.uiScrollToTop, { behavior: "auto" }]];
    },
  );

  registrar.regEvent(
    appIds.events.testSessionReviewClosed,
    ({ draftState }) => {
      draftState.testSessionReviewVisible = false;
      return [[appIds.effects.uiScrollToTop, { behavior: "auto" }]];
    },
  );

  registrar.regEvent(
    appIds.events.testSessionReviewFilterSelected,
    ({ draftState }, filter) => {
      if (
        draftState.testSessionStatus !== "completed" ||
        !isReviewFilter(filter)
      )
        return;
      selectReviewFilter(draftState, filter);
    },
  );

  registrar.regEvent(
    appIds.events.testSessionReviewQuestionSelected,
    ({ draftState }, questionIndex) => {
      if (
        draftState.testSessionStatus !== "completed" ||
        !Number.isInteger(questionIndex)
      )
        return;
      const items = selectReviewItems(
        draftState.testSessionQuestions,
        draftState.testSessionAnswers,
        draftState.testSessionReviewFilter,
      );
      if (items.some((item) => item.questionIndex === questionIndex)) {
        draftState.testSessionReviewQuestionIndex = questionIndex;
      }
    },
  );

  registrar.regEvent(
    appIds.events.testSessionReviewStepped,
    ({ draftState }, direction) => {
      if (
        draftState.testSessionStatus !== "completed" ||
        (direction !== -1 && direction !== 1)
      )
        return;
      const items = selectReviewItems(
        draftState.testSessionQuestions,
        draftState.testSessionAnswers,
        draftState.testSessionReviewFilter,
      );
      const position = items.findIndex(
        (item) =>
          item.questionIndex === draftState.testSessionReviewQuestionIndex,
      );
      const next = items[position + direction];
      if (position >= 0 && next)
        draftState.testSessionReviewQuestionIndex = next.questionIndex;
    },
  );
};
