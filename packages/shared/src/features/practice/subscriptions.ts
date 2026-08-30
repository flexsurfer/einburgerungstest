import type { AppModule } from "../../app/uklad/register.js";
import { appIds, stateKeys } from "../../app/uklad/catalog.js";

export const registerPracticeSubscriptions: AppModule = (registrar) => {
  registrar.regRootSub(
    appIds.subscriptions.practiceUserAnswers,
    stateKeys.practiceUserAnswers,
  );
  registrar.regRootSub(
    appIds.subscriptions.practiceFavorites,
    stateKeys.practiceFavorites,
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
    ],
    ([questions, selectedCategory, favorites, userAnswers, testQuestions]) => {
      if (selectedCategory === "favorites") {
        return questions.filter((question) =>
          favorites.includes(question.globalIndex),
        );
      }
      if (selectedCategory === "wrong") {
        return questions.filter((question) => {
          const answer = userAnswers[question.globalIndex];
          return answer !== undefined && answer !== question.correct;
        });
      }
      if (selectedCategory === "test") return testQuestions;
      return selectedCategory
        ? questions.filter((question) => question.category === selectedCategory)
        : questions;
    },
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
};
