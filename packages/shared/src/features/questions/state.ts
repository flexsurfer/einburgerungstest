import { stateKeys } from "../../app/uklad/catalog.js";
import type {
  AppError,
  CategoryGroup,
  Question,
  QuestionInput,
} from "../../app/uklad/contracts.js";

const federalStates: ReadonlySet<string> = new Set([
  "Baden-Württemberg",
  "Bayern",
  "Berlin",
  "Brandenburg",
  "Bremen",
  "Hamburg",
  "Hessen",
  "Mecklenburg-Vorpommern",
  "Niedersachsen",
  "Nordrhein-Westfalen",
  "Rheinland-Pfalz",
  "Saarland",
  "Sachsen",
  "Sachsen-Anhalt",
  "Schleswig-Holstein",
  "Thüringen",
]);

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

function prepareQuestions(data: readonly QuestionInput[]): Question[] {
  return data.map((question, index) => ({
    ...question,
    answers: [...question.answers],
    ...(question.img === undefined ? {} : { img: { ...question.img } }),
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
