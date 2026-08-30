import { stateKeys } from "../../app/uklad/catalog.js";
import type { Favorites, UserAnswers } from "../../app/uklad/contracts.js";

export function createPracticeState() {
  return {
    [stateKeys.practiceUserAnswers]: {} as UserAnswers,
    [stateKeys.practiceFavorites]: [] as Favorites,
  } as const;
}
