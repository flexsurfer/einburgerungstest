import type { AppModule } from "../../app/uklad/register.js";
import { appIds, stateKeys } from "../../app/uklad/catalog.js";
import { EINBUERGERUNGSTEST_RULES } from "./rules.js";
import { selectReviewItems } from "./review.js";

export const registerTestSessionSubscriptions: AppModule = (registrar) => {
  registrar.regRootSub(
    appIds.subscriptions.testSessionReviewVisible,
    stateKeys.testSessionReviewVisible,
  );
  registrar.regRootSub(
    appIds.subscriptions.testSessionReviewFilter,
    stateKeys.testSessionReviewFilter,
  );
  registrar.regRootSub(
    appIds.subscriptions.testSessionReviewQuestionIndex,
    stateKeys.testSessionReviewQuestionIndex,
  );

  registrar.regSub(
    appIds.subscriptions.testSessionReviewItems,
    () => [
      [appIds.subscriptions.testSessionQuestions],
      [appIds.subscriptions.testSessionAnswers],
      [appIds.subscriptions.testSessionStatus],
      [appIds.subscriptions.testSessionReviewFilter],
    ],
    ([questions, answers, status, filter]) =>
      status === "completed"
        ? selectReviewItems(questions, answers, filter)
        : [],
  );
  registrar.regSub(
    appIds.subscriptions.testSessionReview,
    () => [
      [appIds.subscriptions.testSessionReviewItems],
      [appIds.subscriptions.testSessionReviewQuestionIndex],
    ],
    ([items, questionIndex]) => {
      const position = items.findIndex(
        (item) => item.questionIndex === questionIndex,
      );
      return { items, current: items[position] ?? null, position };
    },
  );
  registrar.regRootSub(
    appIds.subscriptions.testSessionQuestions,
    stateKeys.testSessionQuestions,
  );
  registrar.regRootSub(
    appIds.subscriptions.testSessionAnswers,
    stateKeys.testSessionAnswers,
  );
  registrar.regRootSub(
    appIds.subscriptions.testSessionStatus,
    stateKeys.testSessionStatus,
  );
  registrar.regRootSub(
    appIds.subscriptions.testSessionEndsAt,
    stateKeys.testSessionEndsAt,
  );
  registrar.regRootSub(
    appIds.subscriptions.testSessionFinishReason,
    stateKeys.testSessionFinishReason,
  );

  registrar.regSub(
    appIds.subscriptions.testSessionResult,
    () => [
      [appIds.subscriptions.testSessionQuestions],
      [appIds.subscriptions.testSessionAnswers],
    ],
    ([questions, answers]) => {
      const correct = questions.filter(
        (question) => answers[question.globalIndex] === question.correct,
      ).length;
      const answered = questions.filter(
        (question) => answers[question.globalIndex] !== undefined,
      ).length;

      return {
        correct,
        incorrect: answered - correct,
        unanswered: Math.max(questions.length - answered, 0),
        answered,
        total: questions.length,
        requiredCorrect: EINBUERGERUNGSTEST_RULES.passingCorrectAnswerCount,
        passed: correct >= EINBUERGERUNGSTEST_RULES.passingCorrectAnswerCount,
      };
    },
  );
};
