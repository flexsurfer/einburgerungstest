import type { AppModule } from "../../app/uklad/register.js";
import { appIds, stateKeys } from "../../app/uklad/catalog.js";
import {
  isSelectedPracticeQuestion,
  selectPracticeQuestions,
} from "./selection.js";

export const registerPracticeSubscriptions: AppModule = (registrar) => {
  registrar.regRootSub(
    appIds.subscriptions.practiceUserAnswers,
    stateKeys.practiceUserAnswers,
  );
  registrar.regRootSub(
    appIds.subscriptions.practiceFavorites,
    stateKeys.practiceFavorites,
  );
  registrar.regRootSub(
    appIds.subscriptions.practiceGlobalIndex,
    stateKeys.practiceGlobalIndex,
  );

  registrar.regSub(
    appIds.subscriptions.practiceFavoriteCount,
    () => [[appIds.subscriptions.practiceFavorites]],
    ([favorites]) => favorites.length,
  );

  registrar.regSub(
    appIds.subscriptions.practiceWrongCount,
    () => [
      [appIds.subscriptions.practiceUserAnswers],
      [appIds.subscriptions.questionsItems],
    ],
    ([userAnswers, questions]) =>
      questions.filter((question) => {
        const answer = userAnswers[question.globalIndex];
        return answer !== undefined && answer !== question.correct;
      }).length,
  );

  registrar.regSub(
    appIds.subscriptions.practiceFilteredQuestions,
    () => [
      [appIds.subscriptions.questionsItems],
      [appIds.subscriptions.navigationSelectedCategory],
      [appIds.subscriptions.practiceFavorites],
      [appIds.subscriptions.practiceUserAnswers],
      [appIds.subscriptions.testSessionQuestions],
      [appIds.subscriptions.preferencesSelectedLand],
    ],
    ([
      questions,
      selectedCategory,
      favorites,
      userAnswers,
      testQuestions,
      selectedLand,
    ]) =>
      selectPracticeQuestions({
        questionsItems: questions,
        navigationSelectedCategory: selectedCategory,
        practiceFavorites: favorites,
        practiceUserAnswers: userAnswers,
        testSessionQuestions: testQuestions,
        preferencesSelectedLand: selectedLand,
      }),
  );

  registrar.regSub(
    appIds.subscriptions.practiceFilteredQuestionsCount,
    () => [[appIds.subscriptions.practiceFilteredQuestions]],
    ([questions]) => questions.length,
  );

  registrar.regSub(
    appIds.subscriptions.practiceUserAnswerByQuestionIndex,
    () => [
      [appIds.subscriptions.practiceUserAnswers],
      [appIds.subscriptions.testSessionAnswers],
      [appIds.subscriptions.navigationSelectedCategory],
    ],
    ([userAnswers, testAnswers, selectedCategory], questionIndex) =>
      selectedCategory === "test"
        ? testAnswers[questionIndex]
        : userAnswers[questionIndex],
  );

  registrar.regSub(
    appIds.subscriptions.practiceIsFavoriteByGlobalIndex,
    () => [[appIds.subscriptions.practiceFavorites]],
    ([favorites], globalIndex) => favorites.includes(globalIndex),
  );

  registrar.regSub(
    appIds.subscriptions.practiceStatistics,
    () => [
      [appIds.subscriptions.practiceFilteredQuestions],
      [appIds.subscriptions.practiceUserAnswers],
      [appIds.subscriptions.testSessionAnswers],
      [appIds.subscriptions.navigationSelectedCategory],
    ],
    ([filteredQuestions, userAnswers, testAnswers, selectedCategory]) => {
      const answers = selectedCategory === "test" ? testAnswers : userAnswers;
      const correct = filteredQuestions.filter(
        (question) => answers[question.globalIndex] === question.correct,
      ).length;
      const totalAnswered = filteredQuestions.filter(
        (question) => answers[question.globalIndex] !== undefined,
      ).length;
      const incorrect = totalAnswered - correct;
      const totalVisible = filteredQuestions.length;
      const accuracy =
        totalAnswered > 0 ? ((correct / totalAnswered) * 100).toFixed(1) : 0;

      return {
        correct,
        incorrect,
        totalAnswered,
        totalVisible,
        accuracy,
        passed: Number(accuracy) > 51.5,
      };
    },
  );

  registrar.regSub(
    appIds.subscriptions.practiceOverview,
    () => [
      [appIds.subscriptions.questionsItems],
      [appIds.subscriptions.practiceUserAnswers],
      [appIds.subscriptions.preferencesSelectedLand],
    ],
    ([questions, userAnswers, selectedLand]) => {
      const practiceQuestions = questions.filter((question) =>
        isSelectedPracticeQuestion(question, selectedLand),
      );
      const answeredQuestions = practiceQuestions.filter(
        (question) => userAnswers[question.globalIndex] !== undefined,
      );
      const correct = answeredQuestions.filter(
        (question) => userAnswers[question.globalIndex] === question.correct,
      ).length;
      const totalAnswered = answeredQuestions.length;
      const totalQuestions = practiceQuestions.length;
      const accuracy =
        totalAnswered === 0 ? 0 : Math.round((correct / totalAnswered) * 100);
      const progress =
        totalQuestions === 0
          ? 0
          : Math.round((totalAnswered / totalQuestions) * 100);

      return {
        correct,
        incorrect: totalAnswered - correct,
        totalAnswered,
        totalQuestions,
        remaining: Math.max(totalQuestions - totalAnswered, 0),
        accuracy,
        progress,
      };
    },
  );
};
