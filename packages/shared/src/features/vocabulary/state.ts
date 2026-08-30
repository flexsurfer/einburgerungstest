import { stateKeys } from "../../app/uklad/catalog.js";
import type { VocabularyData } from "../../app/uklad/contracts.js";

export function createVocabularyState() {
  return {
    [stateKeys.vocabularyData]: null as VocabularyData | null,
    [stateKeys.vocabularyLoading]: false,
    [stateKeys.vocabularyError]: null,
    [stateKeys.vocabularyVisible]: false,
    [stateKeys.vocabularyRendered]: false,
  } as const;
}
