import type { AppModule } from "../../app/uklad/register.js";
import { appIds, stateKeys } from "../../app/uklad/catalog.js";

export const registerNavigationSubscriptions: AppModule = (registrar) => {
  registrar.regRootSub(
    appIds.subscriptions.navigationSelectedCategory,
    stateKeys.navigationSelectedCategory,
  );
  registrar.regRootSub(
    appIds.subscriptions.navigationCurrentQuestionIndex,
    stateKeys.navigationCurrentQuestionIndex,
  );
  registrar.regRootSub(
    appIds.subscriptions.navigationQuestionPickerVisible,
    stateKeys.navigationQuestionPickerVisible,
  );
  registrar.regRootSub(
    appIds.subscriptions.navigationActiveScreen,
    stateKeys.navigationActiveScreen,
  );

  registrar.regSub(
    appIds.subscriptions.navigationSelectedCategoryCount,
    () => [
      [appIds.subscriptions.navigationSelectedCategory],
      [appIds.subscriptions.questionsCategories],
    ],
    ([selectedCategory, categories]) => {
      if (
        selectedCategory &&
        selectedCategory !== "favorites" &&
        selectedCategory !== "wrong"
      ) {
        for (const group of categories) {
          const found = group.items.find(
            ([category]) => category === selectedCategory,
          );
          if (found) return found[1];
        }
      }
      return 0;
    },
  );

  registrar.regSub(
    appIds.subscriptions.navigationCurrentQuestion,
    () => [
      [appIds.subscriptions.practiceFilteredQuestions],
      [appIds.subscriptions.navigationCurrentQuestionIndex],
      [appIds.subscriptions.practiceGlobalIndex],
      [appIds.subscriptions.navigationSelectedCategory],
    ],
    ([
      filteredQuestions,
      currentQuestionIndex,
      practiceGlobalIndex,
      selectedCategory,
    ]) => {
      if (filteredQuestions.length === 0) return null;
      if (selectedCategory === null && practiceGlobalIndex !== null) {
        const savedQuestion = filteredQuestions.find(
          (question) => question.globalIndex === practiceGlobalIndex,
        );
        if (savedQuestion) return savedQuestion;
      }
      const index = Math.max(
        0,
        Math.min(currentQuestionIndex || 0, filteredQuestions.length - 1),
      );
      return filteredQuestions[index];
    },
  );

  registrar.regSub(
    appIds.subscriptions.navigationQuestionPickerItems,
    () => [
      [appIds.subscriptions.practiceFilteredQuestions],
      [appIds.subscriptions.practiceUserAnswers],
      [appIds.subscriptions.testSessionAnswers],
      [appIds.subscriptions.navigationCurrentQuestionIndex],
      [appIds.subscriptions.navigationSelectedCategory],
    ],
    ([
      filteredQuestions,
      userAnswers,
      testAnswers,
      currentQuestionIndex,
      selectedCategory,
    ]) =>
      filteredQuestions.map((question, index) => {
        const answer =
          selectedCategory === "test"
            ? testAnswers[question.globalIndex]
            : userAnswers[question.globalIndex];
        const isAnswered = answer !== undefined;
        const isCorrect = isAnswered && answer === question.correct;
        const isSelected = index === (currentQuestionIndex || 0);
        let className = "question-picker-item";
        if (isSelected) className += " selected";
        if (isAnswered) className += isCorrect ? " correct" : " incorrect";

        return {
          key: question.globalIndex,
          className,
          ariaLabel: `Question ${index + 1}${
            isAnswered ? (isCorrect ? " (correct)" : " (incorrect)") : ""
          }`,
          number: question.globalIndex,
          isAnswered,
          indicatorClass: `answer-indicator ${
            isCorrect ? "correct" : "incorrect"
          }`,
          filteredIndex: index,
          isSelected,
          isCorrect,
        };
      }),
  );

  registrar.regSub(
    appIds.subscriptions.navigationIsTestMode,
    () => [[appIds.subscriptions.navigationSelectedCategory]],
    ([selectedCategory]) => selectedCategory === "test",
  );
};
