import type {
  AppContracts,
  Question,
  TestSessionReviewFilter,
  TestSessionReviewItem,
  UserAnswers,
} from "../../app/uklad/contracts.js";

export function selectReviewItems(
  questions: Question[],
  answers: UserAnswers,
  filter: TestSessionReviewFilter,
): TestSessionReviewItem[] {
  return questions
    .map((question, questionIndex): TestSessionReviewItem => {
      const answerIndex = answers[question.globalIndex] ?? null;
      return {
        question,
        questionIndex,
        answerIndex,
        status:
          answerIndex === null
            ? "unanswered"
            : answerIndex === question.correct
              ? "correct"
              : "incorrect",
      };
    })
    .filter((item) => filter === "all" || item.status === filter);
}

export function isReviewFilter(
  value: string,
): value is TestSessionReviewFilter {
  return ["all", "correct", "incorrect", "unanswered"].includes(value);
}

/** Keep the current question when possible, otherwise use the first match. */
export function selectReviewFilter(
  draftState: AppContracts["state"],
  filter: TestSessionReviewFilter,
): void {
  const items = selectReviewItems(
    draftState.testSessionQuestions,
    draftState.testSessionAnswers,
    filter,
  );
  draftState.testSessionReviewFilter = filter;
  if (
    !items.some(
      (item) =>
        item.questionIndex === draftState.testSessionReviewQuestionIndex,
    )
  ) {
    draftState.testSessionReviewQuestionIndex = items[0]?.questionIndex ?? 0;
  }
}
