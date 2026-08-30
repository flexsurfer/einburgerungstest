import { stateKeys } from "../../app/uklad/catalog.js";
import type {
  AppError,
  CategoryGroup,
  Question,
} from "../../app/uklad/contracts.js";

export function createQuestionsState() {
  return {
    [stateKeys.questionsItems]: [] as Question[],
    [stateKeys.questionsCategories]: [] as CategoryGroup[],
    [stateKeys.questionsLoading]: false,
    [stateKeys.questionsLoaded]: false,
    [stateKeys.questionsError]: null as AppError,
  } as const;
}
