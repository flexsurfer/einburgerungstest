import type { AppModule } from "../../app/uklad/register.js";
import { appIds, stateKeys } from "../../app/uklad/catalog.js";
import type {
  AppContracts,
  CategorySelection,
  FederalLand,
  Favorites,
  PracticeMistakes,
  Question,
} from "../../app/uklad/contracts.js";
import { generateTest } from "../test-session/generate.js";
import { selectPracticeQuestions } from "../practice/selection.js";
import { EINBUERGERUNGSTEST_RULES } from "../test-session/rules.js";
import { navigationEffect } from "./route.js";
import { createExamAttemptState } from "../test-session/state.js";

interface NavigationDraftState {
  [stateKeys.questionsItems]: Question[];
  [stateKeys.navigationSelectedCategory]: CategorySelection;
  [stateKeys.practiceFavorites]: Favorites;
  [stateKeys.practiceMistakes]: PracticeMistakes;
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
    practiceMistakes: draftState[stateKeys.practiceMistakes],
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

function selectQuestionIndex(state: AppContracts["state"], index: number) {
  state.navigationCurrentQuestionIndex = index;
  if (state.navigationSelectedCategory === "test") return;
  syncPracticeGlobalIndex(state, index, activePracticeCursorKey(state));
  return [navigationEffect(state, "replace")];
}

/** An attempt belongs to the open exam. Leaving discards it without grading. */
function leaveExam(
  state: AppContracts["state"],
): [] | [[typeof appIds.effects.testSessionSetDeadline, null]] {
  state.navigationExamSetupVisible = false;
  if (state.navigationSelectedCategory !== "test") return [];
  state.navigationSelectedCategory = null;
  state.navigationCurrentQuestionIndex = 0;
  state.navigationQuestionPickerVisible = false;
  if (state.navigationActiveScreen === "questions")
    state.navigationActiveScreen = "home";
  Object.assign(state, createExamAttemptState());
  return [[appIds.effects.testSessionSetDeadline, null]];
}

export const registerNavigationEvents: AppModule = (registrar) => {
  registrar.regEvent(
    appIds.events.navigationRouteOpened,
    ({ draftState }, route, replace = true) => {
      const effects = leaveExam(draftState);
      if (route.language)
        draftState.preferencesSelectedLanguage = route.language;
      draftState.navigationQuestionPickerVisible = false;
      const history = replace ? "restore" : "push";
      if (route.screen === "exam") {
        draftState.navigationExamSetupVisible = true;
        return [...effects, navigationEffect(draftState, history)];
      }
      draftState.navigationIsLearnMode = route.screen === "learn";
      draftState.uiShowAnswers = route.screen === "learn";

      if (route.screen === "home" || route.screen === "settings") {
        draftState.navigationActiveScreen = route.screen;
      } else {
        const category =
          route.screen === "favorites"
            ? "favorites"
            : route.screen === "mistakes"
              ? "wrong"
              : draftState.questionsItems.some(
                    (question) => question.category === route.category,
                  )
                ? route.category!
                : null;
        draftState.navigationSelectedCategory = category;
        draftState.navigationActiveScreen = "questions";
        const cursorKey = activePracticeCursorKey(draftState);
        if (category === null) resumePracticePosition(draftState, cursorKey);
        else draftState.navigationCurrentQuestionIndex = 0;
        let questions = selectedQuestions(draftState);
        // Regional question links also work without a previously selected Land.
        if (
          route.question &&
          category === null &&
          !questions.some((question) => question.globalIndex === route.question)
        ) {
          const question = draftState.questionsItems.find(
            (item) => item.globalIndex === route.question,
          );
          if (question) {
            draftState.navigationSelectedCategory = question.category;
            questions = selectedQuestions(draftState);
          }
        }
        const index = questions.findIndex(
          (question) => question.globalIndex === route.question,
        );
        if (index >= 0) draftState.navigationCurrentQuestionIndex = index;
        syncPracticeGlobalIndex(
          draftState,
          draftState.navigationCurrentQuestionIndex,
          cursorKey,
        );
      }
      return [
        ...effects,
        navigationEffect(draftState, history),
        [appIds.effects.uiScrollToTop, { behavior: "auto" }],
      ];
    },
  );

  registrar.regEvent(appIds.events.navigationExamClosed, ({ draftState }) => {
    if (
      !draftState.navigationExamSetupVisible &&
      draftState.navigationSelectedCategory !== "test"
    )
      return;
    const effects = leaveExam(draftState);
    return [...effects, navigationEffect(draftState, "dismiss")];
  });

  registrar.regEvent(
    appIds.events.navigationCategorySelected,
    ({ draftState, coeffects: { random } }, category) => {
      const effects = leaveExam(draftState);
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

      draftState.navigationCurrentQuestionIndex = 0;
      if (category === null)
        syncPracticeGlobalIndex(draftState, 0, stateKeys.practiceGlobalIndex);
      draftState[stateKeys.navigationQuestionPickerVisible] = false;
      draftState[stateKeys.navigationActiveScreen] = "questions";
      return [
        ...effects,
        navigationEffect(draftState),
        [appIds.effects.uiScrollToTop, { behavior: "auto" }],
      ];
    },
    { coeffects: { random: appIds.coeffects.systemRandom } },
  );

  registrar.regEvent(appIds.events.navigationLearnOpened, ({ draftState }) => {
    const effects = leaveExam(draftState);
    draftState[stateKeys.navigationIsLearnMode] = true;
    draftState[stateKeys.uiShowAnswers] = true;
    resumePracticePosition(draftState, stateKeys.practiceLearnGlobalIndex);
    draftState[stateKeys.navigationQuestionPickerVisible] = false;
    draftState[stateKeys.navigationActiveScreen] = "questions";
    return [
      ...effects,
      navigationEffect(draftState),
      [appIds.effects.uiScrollToTop, { behavior: "auto" }],
    ];
  });

  registrar.regEvent(appIds.events.navigationHomeOpened, ({ draftState }) => {
    if (draftState.testSessionStatus === "in-progress") {
      draftState.testSessionStatus = "idle";
      draftState.testSessionEndsAt = null;
      draftState.testSessionFinishReason = null;
    }
    draftState.navigationExamSetupVisible = false;
    draftState[stateKeys.navigationActiveScreen] = "home";
    draftState[stateKeys.navigationIsLearnMode] = false;
    draftState[stateKeys.uiShowAnswers] = false;
    draftState[stateKeys.navigationQuestionPickerVisible] = false;
    return [
      [appIds.effects.testSessionSetDeadline, null],
      navigationEffect(draftState),
    ];
  });

  registrar.regEvent(
    appIds.events.navigationSettingsOpened,
    ({ draftState }) => {
      const effects = leaveExam(draftState);
      draftState[stateKeys.navigationActiveScreen] = "settings";
      draftState[stateKeys.navigationQuestionPickerVisible] = false;
      return [...effects, navigationEffect(draftState)];
    },
  );

  registrar.regEvent(
    appIds.events.navigationPracticeResumed,
    ({ draftState }) => {
      const effects = leaveExam(draftState);
      draftState[stateKeys.navigationIsLearnMode] = false;
      draftState[stateKeys.uiShowAnswers] = false;
      resumePracticePosition(draftState, stateKeys.practiceGlobalIndex);
      draftState[stateKeys.navigationActiveScreen] = "questions";
      draftState[stateKeys.navigationQuestionPickerVisible] = false;
      return [...effects, navigationEffect(draftState)];
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
      draftState[stateKeys.navigationQuestionPickerVisible] = false;
      return selectQuestionIndex(draftState, safeIndex);
    },
  );

  registrar.regEvent(appIds.events.navigationNext, ({ draftState }) => {
    const currentIndex =
      draftState[stateKeys.navigationCurrentQuestionIndex] || 0;
    const maxIndex = Math.max(selectedQuestions(draftState).length - 1, 0);
    const nextIndex = Math.min(currentIndex + 1, maxIndex);
    return selectQuestionIndex(draftState, nextIndex);
  });

  registrar.regEvent(appIds.events.navigationPrevious, ({ draftState }) => {
    const currentIndex =
      draftState[stateKeys.navigationCurrentQuestionIndex] || 0;
    return selectQuestionIndex(draftState, Math.max(currentIndex - 1, 0));
  });

  registrar.regEvent(
    appIds.events.navigationQuestionPickerShown,
    ({ draftState }, show) => {
      draftState[stateKeys.navigationQuestionPickerVisible] = show;
    },
  );
};
