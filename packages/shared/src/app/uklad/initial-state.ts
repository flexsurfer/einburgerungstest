import type { AppContracts } from "./contracts.js";
import { createNavigationState } from "../../features/navigation/state.js";
import { createPreferencesState } from "../../features/preferences/state.js";
import { createPracticeState } from "../../features/practice/state.js";
import { createQuestionsState } from "../../features/questions/state.js";
import { createTestSessionState } from "../../features/test-session/state.js";
import { createUiState } from "../../features/ui/state.js";
import { createVocabularyState } from "../../features/vocabulary/state.js";

/** Create fresh roots for one application/runtime owner. */
export function createAppState(): AppContracts["state"] {
  return {
    ...createUiState(),
    ...createPreferencesState(),
    ...createVocabularyState(),
    ...createQuestionsState(),
    ...createPracticeState(),
    ...createTestSessionState(),
    ...createNavigationState(),
  } as AppContracts["state"];
}
