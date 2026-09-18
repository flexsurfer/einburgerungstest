import { stateKeys } from "../../app/uklad/catalog.js";
import {
  FEDERAL_LANDS,
  type AppError,
  type CategoryGroup,
  type Question,
  type QuestionInput,
  type QuestionTranslation,
} from "../../app/uklad/contracts.js";

const federalStates: ReadonlySet<string> = new Set(FEDERAL_LANDS);

/** Return whether a question belongs to a German federal state. */
export function isFederalState(category: string): boolean {
  return federalStates.has(category);
}

/** Return whether a question belongs to the 300-question practice pool. */
export function isPracticeQuestion(
  question: Pick<QuestionInput, "category">,
): boolean {
  return !isFederalState(question.category);
}

function createCategoryGroups(questions: readonly Question[]): CategoryGroup[] {
  const categoryCount = questions.reduce<Record<string, number>>(
    (counts, question) => {
      counts[question.category] = (counts[question.category] ?? 0) + 1;
      return counts;
    },
    {},
  );

  const themeItems = Object.entries(categoryCount)
    .filter(([category]) => !federalStates.has(category))
    .sort(([left], [right]) => left.localeCompare(right));
  const landItems = Object.entries(categoryCount)
    .filter(([category]) => federalStates.has(category))
    .sort(([left], [right]) => left.localeCompare(right));

  return [
    { title: "Themes", items: themeItems },
    { title: "Bundesländer", items: landItems },
  ];
}

function copyTranslation(
  translation: QuestionTranslation,
): QuestionTranslation {
  return {
    ...translation,
    ...(translation.answers === undefined
      ? {}
      : { answers: [...translation.answers] }),
  };
}

function prepareQuestions(data: readonly QuestionInput[]): Question[] {
  return data.map((question, index) => ({
    ...question,
    answers: [...question.answers],
    ...(question.img === undefined ? {} : { img: { ...question.img } }),
    ...(question.ru === undefined ? {} : { ru: copyTranslation(question.ru) }),
    ...(question.en === undefined ? {} : { en: copyTranslation(question.en) }),
    ...(question.ar === undefined ? {} : { ar: copyTranslation(question.ar) }),
    ...(question.tr === undefined ? {} : { tr: copyTranslation(question.tr) }),
    globalIndex: index + 1,
  }));
}

export function createQuestionsState(
  initialQuestions?: readonly QuestionInput[],
) {
  const questions =
    initialQuestions === undefined ? [] : prepareQuestions(initialQuestions);

  return {
    [stateKeys.questionsItems]: questions,
    [stateKeys.questionsCategories]:
      initialQuestions === undefined ? [] : createCategoryGroups(questions),
    [stateKeys.questionsLoading]: false,
    [stateKeys.questionsLoaded]: initialQuestions !== undefined,
    [stateKeys.questionsError]: null as AppError,
  } as const;
}
