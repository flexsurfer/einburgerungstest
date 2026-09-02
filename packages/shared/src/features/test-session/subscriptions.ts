import type { AppModule } from "../../app/uklad/register.js";
import { appIds, stateKeys } from "../../app/uklad/catalog.js";
import { EINBUERGERUNGSTEST_RULES } from "./rules.js";

export const registerTestSessionSubscriptions: AppModule = (registrar) => {
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
