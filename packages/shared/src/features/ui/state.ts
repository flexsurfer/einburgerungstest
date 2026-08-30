import { stateKeys } from "../../app/uklad/catalog.js";

export function createUiState() {
  return {
    [stateKeys.uiShowAnswers]: false,
  } as const;
}
