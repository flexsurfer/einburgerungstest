import type { AppModule } from "../../app/uklad/register.js";
import { appIds, stateKeys } from "../../app/uklad/catalog.js";
import type { CategoryGroup, Question } from "../../app/uklad/contracts.js";

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

function createCategoryGroups(questions: Question[]): CategoryGroup[] {
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

export const registerQuestionsEvents: AppModule = (registrar) => {
  registrar.regEvent(
    appIds.events.questionsFetchRequested,
    ({ draftState }) => {
      draftState[stateKeys.questionsLoading] = true;
      draftState[stateKeys.questionsError] = null;
      return [[appIds.effects.dataFetch, { dataType: "questions" }]];
    },
  );

  registrar.regEvent(
    appIds.events.questionsFetchSucceeded,
    ({ draftState }, data) => {
      const questions = data.map((question, index) => ({
        ...question,
        globalIndex: index + 1,
      }));

      draftState[stateKeys.questionsLoading] = false;
      draftState[stateKeys.questionsLoaded] = true;
      draftState[stateKeys.questionsError] = null;
      draftState[stateKeys.questionsItems] = questions;
      draftState[stateKeys.questionsCategories] =
        createCategoryGroups(questions);
    },
  );

  registrar.regEvent(
    appIds.events.questionsFetchFailed,
    ({ draftState }, error) => {
      draftState[stateKeys.questionsLoading] = false;
      draftState[stateKeys.questionsError] = error;
    },
  );
};
