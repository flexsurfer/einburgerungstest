import type {
  CategorySelection,
  Question,
  UserAnswers,
} from "../../app/uklad/contracts.js";
import { isPracticeQuestion } from "../questions/state.js";

/** The state slice needed to select the current question collection. */
export interface PracticeSelectionState {
  readonly questionsItems: readonly Question[];
  navigationSelectedCategory: CategorySelection;
  readonly practiceFavorites: readonly number[];
  readonly practiceUserAnswers: Readonly<UserAnswers>;
  readonly testSessionQuestions: readonly Question[];
}

/**
 * Select questions for the existing navigation categories.
 *
 * The unscoped practice pool deliberately contains only the 300 general
 * questions. Explicit Länder categories remain available for the current
 * catalogue browser until Learn gets its own navigation surface.
 */
export function selectPracticeQuestions(
  state: PracticeSelectionState,
  selectedCategory: CategorySelection = state.navigationSelectedCategory,
): Question[] {
  const practiceQuestions = state.questionsItems;

  if (selectedCategory === "test") return [...state.testSessionQuestions];

  if (selectedCategory === "favorites") {
    return practiceQuestions.filter((question) =>
      state.practiceFavorites.includes(question.globalIndex),
    );
  }

  if (selectedCategory === "wrong") {
    return practiceQuestions.filter((question) => {
      const answer = state.practiceUserAnswers[question.globalIndex];
      return answer !== undefined && answer !== question.correct;
    });
  }

  if (selectedCategory === null) return practiceQuestions.filter(isPracticeQuestion);

  // Preserve direct category browsing, including Länder, while the app is
  // still using one question screen for both the catalogue and practice.
  return state.questionsItems.filter(
    (question) => question.category === selectedCategory,
  );
}
