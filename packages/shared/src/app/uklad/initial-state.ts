import type { AppContracts, AppLanguage, QuestionInput } from "./contracts.js";
import { createNavigationState } from "../../features/navigation/state.js";
import { createPreferencesState } from "../../features/preferences/state.js";
import { createPracticeState } from "../../features/practice/state.js";
import { createQuestionsState } from "../../features/questions/state.js";
import { createTestSessionState } from "../../features/test-session/state.js";
import { createUiState } from "../../features/ui/state.js";
import { createVocabularyState } from "../../features/vocabulary/state.js";

export interface CreateAppStateOptions {
  readonly initialQuestions?: readonly QuestionInput[];
  readonly initialLanguage?: AppLanguage;
}

/** Create fresh roots for one application/runtime owner. */
export function createAppState(
  options: CreateAppStateOptions = {},
): AppContracts["state"] {
  return {
    ...createUiState(),
    ...createPreferencesState(options.initialLanguage),
    ...createVocabularyState(),
    ...createQuestionsState(options.initialQuestions),
    ...createPracticeState(),
    ...createTestSessionState(),
    ...createNavigationState(),
  } as AppContracts["state"];
}
