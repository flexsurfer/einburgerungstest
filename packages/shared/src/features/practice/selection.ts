import type {
  CategorySelection,
  FederalLand,
  PracticeMistakes,
  Question,
} from "../../app/uklad/contracts.js";
import { isPracticeQuestion } from "../questions/state.js";

/** The state slice needed to select the current question collection. */
export interface PracticeSelectionState {
  readonly questionsItems: readonly Question[];
  navigationSelectedCategory: CategorySelection;
  readonly practiceFavorites: readonly number[];
  readonly practiceMistakes: Readonly<PracticeMistakes>;
  readonly testSessionQuestions: readonly Question[];
  readonly preferencesSelectedLand: FederalLand | null;
}

/**
 * Return durable mistake attempts, excluding an answer that may have become
 * correct after a question-data update.
 */
export function selectWrongAnswerAttempts(
  question: Question,
  mistakes: Readonly<PracticeMistakes>,
): number[] {
  return (mistakes[question.globalIndex] ?? []).filter(
    (answerIndex) => answerIndex !== question.correct,
  );
}

/** Return whether a question belongs to the personalized practice pool. */
export function isSelectedPracticeQuestion(
  question: Question,
  selectedLand: FederalLand | null,
): boolean {
  return isPracticeQuestion(question) || question.category === selectedLand;
}

/**
 * Select questions for the existing navigation categories.
 *
 * The unscoped practice pool contains the 300 general questions plus all ten
 * questions for the user's selected Land.
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
    return practiceQuestions.filter(
      (question) =>
        selectWrongAnswerAttempts(question, state.practiceMistakes).length > 0,
    );
  }

  if (selectedCategory === null) {
    return practiceQuestions.filter((question) =>
      isSelectedPracticeQuestion(question, state.preferencesSelectedLand),
    );
  }

  // Preserve direct category browsing, including Länder, while the app is
  // still using one question screen for both the catalogue and practice.
  return state.questionsItems.filter(
    (question) => question.category === selectedCategory,
  );
}
