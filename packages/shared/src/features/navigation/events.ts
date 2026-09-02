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
import { EINBUERGERUNGSTEST_RULES } from "../test-session/rules.js";

interface NavigationDraftState {
  [stateKeys.questionsItems]: Question[];
  [stateKeys.navigationSelectedCategory]: CategorySelection;
  [stateKeys.practiceFavorites]: Favorites;
  [stateKeys.practiceUserAnswers]: UserAnswers;
  [stateKeys.testSessionQuestions]: Question[];
  [stateKeys.practiceGlobalIndex]: number | null;
  [stateKeys.practiceLearnGlobalIndex]: number | null;
  [stateKeys.navigationCurrentQuestionIndex]: number;
  [stateKeys.navigationIsLearnMode]: boolean;
  [stateKeys.preferencesSelectedLand]: FederalLand | null;
}

type PracticeCursorKey =
  | typeof stateKeys.practiceGlobalIndex
  | typeof stateKeys.practiceLearnGlobalIndex;

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
  cursorKey: PracticeCursorKey,
): void {
  if (draftState[stateKeys.navigationSelectedCategory] !== null) return;

  const question = selectedQuestions(draftState)[questionIndex];
  if (question !== undefined) {
    draftState[cursorKey] = question.globalIndex;
  }
}

function resumePracticePosition(
  draftState: NavigationDraftState,
  cursorKey: PracticeCursorKey,
): void {
  draftState[stateKeys.navigationSelectedCategory] = null;

  const questions = selectedQuestions(draftState);
  if (questions.length === 0) {
    draftState[stateKeys.navigationCurrentQuestionIndex] = 0;
    return;
  }

  const savedGlobalIndex = draftState[cursorKey];
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
  syncPracticeGlobalIndex(draftState, 0, cursorKey);
}

function activePracticeCursorKey(
  draftState: NavigationDraftState,
): PracticeCursorKey {
  return draftState[stateKeys.navigationIsLearnMode]
    ? stateKeys.practiceLearnGlobalIndex
    : stateKeys.practiceGlobalIndex;
}

export const registerNavigationEvents: AppModule = (registrar) => {
  registrar.regEvent(
    appIds.events.navigationCategorySelected,
    ({ draftState, coeffects: { random } }, category) => {
      if (draftState[stateKeys.navigationIsLearnMode]) {
        draftState[stateKeys.uiShowAnswers] = false;
      }
      draftState[stateKeys.navigationIsLearnMode] = false;
      draftState[stateKeys.navigationSelectedCategory] = category;
      if (category === "test") {
        generateTest(
          draftState,
          EINBUERGERUNGSTEST_RULES.generalQuestionCount,
          random,
        );
      }

      draftState[stateKeys.navigationCurrentQuestionIndex] = 0;
      if (category === null) {
        syncPracticeGlobalIndex(draftState, 0, stateKeys.practiceGlobalIndex);
      }
      draftState[stateKeys.navigationQuestionPickerVisible] = false;
      draftState[stateKeys.navigationActiveScreen] = "questions";
      return [[appIds.effects.uiScrollToTop, { behavior: "auto" }]];
    },
    { coeffects: { random: appIds.coeffects.systemRandom } },
  );

  registrar.regEvent(appIds.events.navigationLearnOpened, ({ draftState }) => {
    draftState[stateKeys.navigationIsLearnMode] = true;
    draftState[stateKeys.uiShowAnswers] = true;
    resumePracticePosition(draftState, stateKeys.practiceLearnGlobalIndex);
    draftState[stateKeys.navigationQuestionPickerVisible] = false;
    draftState[stateKeys.navigationActiveScreen] = "questions";
    return [[appIds.effects.uiScrollToTop, { behavior: "auto" }]];
  });

  registrar.regEvent(appIds.events.navigationHomeOpened, ({ draftState }) => {
    if (
      draftState[stateKeys.navigationSelectedCategory] === "test" &&
      draftState[stateKeys.testSessionStatus] === "in-progress"
    ) {
      draftState[stateKeys.testSessionStatus] = "idle";
      draftState[stateKeys.testSessionEndsAt] = null;
      draftState[stateKeys.testSessionFinishReason] = null;
    }
    draftState[stateKeys.navigationActiveScreen] = "home";
    draftState[stateKeys.navigationIsLearnMode] = false;
    draftState[stateKeys.uiShowAnswers] = false;
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
      draftState[stateKeys.navigationIsLearnMode] = false;
      draftState[stateKeys.uiShowAnswers] = false;
      resumePracticePosition(draftState, stateKeys.practiceGlobalIndex);
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
      syncPracticeGlobalIndex(
        draftState,
        safeIndex,
        activePracticeCursorKey(draftState),
      );
      draftState[stateKeys.navigationQuestionPickerVisible] = false;
    },
  );

  registrar.regEvent(appIds.events.navigationNext, ({ draftState }) => {
    const currentIndex =
      draftState[stateKeys.navigationCurrentQuestionIndex] || 0;
    const maxIndex = Math.max(selectedQuestions(draftState).length - 1, 0);
    const nextIndex = Math.min(currentIndex + 1, maxIndex);
    draftState[stateKeys.navigationCurrentQuestionIndex] = nextIndex;
    syncPracticeGlobalIndex(
      draftState,
      nextIndex,
      activePracticeCursorKey(draftState),
    );
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
      activePracticeCursorKey(draftState),
    );
  });

  registrar.regEvent(
    appIds.events.navigationQuestionPickerShown,
    ({ draftState }, show) => {
      draftState[stateKeys.navigationQuestionPickerVisible] = show;
    },
  );
};
