import { stateKeys } from "../../app/uklad/catalog.js";
import type {
  Question,
  TestUsedQuestions,
  UserAnswers,
} from "../../app/uklad/contracts.js";

export function createTestSessionState() {
  return {
    [stateKeys.testSessionQuestions]: [] as Question[],
    [stateKeys.testSessionAnswers]: {} as UserAnswers,
    [stateKeys.testSessionUsedQuestions]: {} as TestUsedQuestions,
  } as const;
}
