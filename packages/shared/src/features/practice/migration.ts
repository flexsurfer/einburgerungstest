import { stateKeys } from "../../app/uklad/catalog.js";
import type {
  PracticeMistakes,
  Question,
  UserAnswers,
} from "../../app/uklad/contracts.js";

interface LegacyMistakeMigrationState {
  [stateKeys.questionsItems]: Question[];
  [stateKeys.practiceUserAnswers]: UserAnswers;
  [stateKeys.practiceMistakes]: PracticeMistakes;
}

/** Normalize latest answers saved before separate mistake history existed. */
export function migrateLegacyPracticeMistakes(
  state: LegacyMistakeMigrationState,
): void {
  const mistakes = state[stateKeys.practiceMistakes];
  const correctAnswers = new Map(
    state[stateKeys.questionsItems].map((question) => [
      question.globalIndex,
      question.correct,
    ]),
  );

  for (const [questionIndexValue, answerIndex] of Object.entries(
    state[stateKeys.practiceUserAnswers],
  )) {
    const questionIndex = Number(questionIndexValue);
    // Existing histories and empty removal tombstones always win.
    if (Object.prototype.hasOwnProperty.call(mistakes, questionIndex)) {
      continue;
    }

    const correctAnswer = correctAnswers.get(questionIndex);
    if (correctAnswer !== undefined && answerIndex !== correctAnswer) {
      mistakes[questionIndex] = [answerIndex];
    }
  }
}
