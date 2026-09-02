import type { AppModule } from "../../app/uklad/register.js";
import { appIds, stateKeys } from "../../app/uklad/catalog.js";
import type {
  CategorySelection,
  FederalLand,
  Favorites,
  Question,
  UserAnswers,
} from "../../app/uklad/contracts.js";
import { generateTest } from "../test-session/generate.js";
import { selectPracticeQuestions } from "../practice/selection.js";

interface NavigationDraftState {
  [stateKeys.questionsItems]: Question[];
  [stateKeys.navigationSelectedCategory]: CategorySelection;
  [stateKeys.practiceFavorites]: Favorites;
  [stateKeys.practiceUserAnswers]: UserAnswers;
  [stateKeys.testSessionQuestions]: Question[];
  [stateKeys.practiceGlobalIndex]: number | null;
  [stateKeys.navigationCurrentQuestionIndex]: number;
  [stateKeys.preferencesSelectedLand]: FederalLand | null;
}

function selectedQuestions(draftState: NavigationDraftState): Question[] {
  return selectPracticeQuestions({
    questionsItems: draftState[stateKeys.questionsItems],
    navigationSelectedCategory:
      draftState[stateKeys.navigationSelectedCategory],
    practiceFavorites: draftState[stateKeys.practiceFavorites],
    practiceUserAnswers: draftState[stateKeys.practiceUserAnswers],
    testSessionQuestions: draftState[stateKeys.testSessionQuestions],
    preferencesSelectedLand: draftState[stateKeys.preferencesSelectedLand],
  });
}

function syncPracticeGlobalIndex(
  draftState: NavigationDraftState,
  questionIndex: number,
): void {
  if (draftState[stateKeys.navigationSelectedCategory] !== null) return;

  const question = selectedQuestions(draftState)[questionIndex];
  if (question !== undefined) {
    draftState[stateKeys.practiceGlobalIndex] = question.globalIndex;
  }
}

function resumePracticePosition(draftState: NavigationDraftState): void {
  draftState[stateKeys.navigationSelectedCategory] = null;

  const questions = selectedQuestions(draftState);
  if (questions.length === 0) {
    draftState[stateKeys.navigationCurrentQuestionIndex] = 0;
    return;
  }

  const savedGlobalIndex = draftState[stateKeys.practiceGlobalIndex];
  if (savedGlobalIndex !== null && savedGlobalIndex !== undefined) {
    const savedIndex = questions.findIndex(
      (question) => question.globalIndex === savedGlobalIndex,
    );
    if (savedIndex >= 0) {
      draftState[stateKeys.navigationCurrentQuestionIndex] = savedIndex;
      return;
    }
  }

  // If the cursor is missing or belongs to a previously selected Land, restart
  // the personalized practice flow at item 1.
  draftState[stateKeys.navigationCurrentQuestionIndex] = 0;
  syncPracticeGlobalIndex(draftState, 0);
}

export const registerNavigationEvents: AppModule = (registrar) => {
  registrar.regEvent(
    appIds.events.navigationCategorySelected,
    ({ draftState, coeffects: { random } }, category) => {
      draftState[stateKeys.navigationSelectedCategory] = category;
      if (category === "test") generateTest(draftState, 30, random);

      draftState[stateKeys.navigationCurrentQuestionIndex] = 0;
      if (category === null) syncPracticeGlobalIndex(draftState, 0);
      draftState[stateKeys.navigationQuestionPickerVisible] = false;
      draftState[stateKeys.navigationActiveScreen] = "questions";
      return [[appIds.effects.uiScrollToTop, { behavior: "auto" }]];
    },
    { coeffects: { random: appIds.coeffects.systemRandom } },
  );

  registrar.regEvent(appIds.events.navigationHomeOpened, ({ draftState }) => {
    draftState[stateKeys.navigationActiveScreen] = "home";
    draftState[stateKeys.navigationQuestionPickerVisible] = false;
  });

  registrar.regEvent(
    appIds.events.navigationSettingsOpened,
    ({ draftState }) => {
      draftState[stateKeys.navigationActiveScreen] = "settings";
      draftState[stateKeys.navigationQuestionPickerVisible] = false;
    },
  );

  registrar.regEvent(
    appIds.events.navigationPracticeResumed,
    ({ draftState }) => {
      resumePracticePosition(draftState);
      draftState[stateKeys.navigationActiveScreen] = "questions";
      draftState[stateKeys.navigationQuestionPickerVisible] = false;
    },
  );

  registrar.regEvent(
    appIds.events.navigationQuestionSelected,
    ({ draftState }, questionIndex) => {
      const questions = selectedQuestions(draftState);
      const safeIndex = Math.max(
        0,
        Math.min(questionIndex, Math.max(questions.length - 1, 0)),
      );
      draftState[stateKeys.navigationCurrentQuestionIndex] = safeIndex;
      syncPracticeGlobalIndex(draftState, safeIndex);
      draftState[stateKeys.navigationQuestionPickerVisible] = false;
    },
  );

  registrar.regEvent(appIds.events.navigationNext, ({ draftState }) => {
    const currentIndex =
      draftState[stateKeys.navigationCurrentQuestionIndex] || 0;
    const maxIndex = Math.max(selectedQuestions(draftState).length - 1, 0);
    const nextIndex = Math.min(currentIndex + 1, maxIndex);
    draftState[stateKeys.navigationCurrentQuestionIndex] = nextIndex;
    syncPracticeGlobalIndex(draftState, nextIndex);
  });

  registrar.regEvent(appIds.events.navigationPrevious, ({ draftState }) => {
    const currentIndex =
      draftState[stateKeys.navigationCurrentQuestionIndex] || 0;
    draftState[stateKeys.navigationCurrentQuestionIndex] = Math.max(
      currentIndex - 1,
      0,
    );
    syncPracticeGlobalIndex(
      draftState,
      draftState[stateKeys.navigationCurrentQuestionIndex],
    );
  });

  registrar.regEvent(
    appIds.events.navigationQuestionPickerShown,
    ({ draftState }, show) => {
      draftState[stateKeys.navigationQuestionPickerVisible] = show;
    },
  );
};
