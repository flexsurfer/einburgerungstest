import { stateKeys } from "../../app/uklad/catalog.js";
import type { CategorySelection } from "../../app/uklad/contracts.js";

export function createNavigationState() {
  return {
    [stateKeys.navigationSelectedCategory]: null as CategorySelection,
    [stateKeys.navigationCurrentQuestionIndex]: 0,
    [stateKeys.navigationQuestionPickerVisible]: false,
  } as const;
}
