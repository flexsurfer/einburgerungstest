import { stateKeys } from "../../app/uklad/catalog.js";
import type {
  Question,
  TestUsedQuestions,
  TestSessionReviewFilter,
  UserAnswers,
} from "../../app/uklad/contracts.js";

export function createTestSessionState() {
  return {
    [stateKeys.testSessionQuestions]: [] as Question[],
    [stateKeys.testSessionAnswers]: {} as UserAnswers,
    [stateKeys.testSessionUsedQuestions]: {} as TestUsedQuestions,
    [stateKeys.testSessionStatus]: "idle" as const,
    [stateKeys.testSessionEndsAt]: null as number | null,
    [stateKeys.testSessionFinishReason]: null,
    [stateKeys.testSessionReviewVisible]: false,
    [stateKeys.testSessionReviewFilter]: "all" as TestSessionReviewFilter,
    [stateKeys.testSessionReviewQuestionIndex]: 0,
  } as const;
}
