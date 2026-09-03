import { stateKeys } from "../../app/uklad/catalog.js";
import type {
  Favorites,
  PracticeMistakes,
  UserAnswers,
} from "../../app/uklad/contracts.js";

export function createPracticeState() {
  return {
    [stateKeys.practiceUserAnswers]: {} as UserAnswers,
    [stateKeys.practiceMistakes]: {} as PracticeMistakes,
    [stateKeys.practiceFavorites]: [] as Favorites,
    [stateKeys.practiceGlobalIndex]: null as number | null,
    [stateKeys.practiceLearnGlobalIndex]: null as number | null,
  } as const;
}
