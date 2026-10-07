import { afterEach, describe, expect, it } from "vitest";
import { createUkladTestHarness } from "@ukladjs/core/testing";
import {
  appIds,
  createAppRuntime,
  registerAppModules,
  registerSharedModules,
} from "../src/app/uklad/index.ts";

const runtimes = [];
afterEach(() => {
  while (runtimes.length) runtimes.pop().dispose();
});

function fixture() {
  const runtime = createAppRuntime({
    initialQuestions: Array.from({ length: 40 }, (_, index) => ({
      question: `Question ${index + 1}`,
      category: index < 30 ? "Politik" : "Berlin",
      answers: ["A", "B", "C", "D"],
      correct: 0,
    })),
  });
  runtimes.push(runtime);
  registerSharedModules(runtime);
  registerAppModules(runtime, [
    (registrar) => {
      registrar.regCoeffect(appIds.coeffects.systemNow, () => 1000);
      registrar.regEffect(appIds.effects.uiScrollToTop, () => {});
    },
  ]);
  const harness = createUkladTestHarness(runtime);
  const dispatch = (...event) => harness.dispatchSync(event);
  const review = () =>
    harness.getSubscriptionValue([appIds.subscriptions.testSessionReview]);
  dispatch(appIds.events.preferencesLandSelected, "Berlin");
  const start = () => dispatch(appIds.events.testSessionStarted);
  const answer = (index, value) =>
    dispatch(
      appIds.events.testSessionAnswerSelected,
      harness.getState().testSessionQuestions[index].globalIndex,
      value,
    );
  const finish = (reason = "finished") =>
    dispatch(appIds.events.testSessionFinished, reason);
  return { harness, dispatch, review, start, answer, finish };
}

describe("completed exam review", () => {
  it.each(["finished", "time-expired"])(
    "adds final incorrect answers to mistake history when the exam is %s",
    (reason) => {
      const { harness, dispatch, start, answer, finish } = fixture();
      dispatch(appIds.events.practiceQuestionAnswered, 1, 2);
      dispatch(appIds.events.practiceQuestionAnswered, 3, 2);
      dispatch(appIds.events.practiceMistakeRemoved, 3);
      dispatch(appIds.events.practiceQuestionAnswered, 4, 3);
      const previousAnswers = harness.getState().practiceUserAnswers;
      start();
      const regionalIndex =
        harness.getState().testSessionQuestions[32].globalIndex;
      answer(0, 1);
      answer(0, 3);
      answer(1, 2);
      answer(1, 0); // Correcting an answer before submission is not a mistake.
      answer(2, 1); // A new failed attempt can re-add a previously removed question.
      answer(3, 0); // Correct answers preserve older mistake history.
      answer(32, 1);
      expect(harness.getState().practiceMistakes).toEqual({
        1: [2],
        3: [],
        4: [3],
      });

      finish(reason);

      expect(harness.getState().practiceMistakes).toEqual({
        1: [2, 3],
        3: [1],
        4: [3],
        [regionalIndex]: [1],
      });
      expect(harness.getState().practiceUserAnswers).toEqual(previousAnswers);
      expect(
        harness.getSubscriptionValue([appIds.subscriptions.practiceWrongCount]),
      ).toBe(4);
      dispatch(appIds.events.navigationCategorySelected, "wrong");
      expect(
        harness
          .getSubscriptionValue([
            appIds.subscriptions.practiceFilteredQuestions,
          ])
          .map((q) => q.globalIndex),
      ).toEqual([1, 3, 4, regionalIndex]);
    },
  );

  it("counts each submitted exam once while accumulating later failed attempts", () => {
    const { harness, dispatch, start, answer, finish } = fixture();
    start();
    answer(0, 1);
    finish();
    finish("time-expired");
    dispatch(appIds.events.testSessionReviewOpened);
    dispatch(appIds.events.testSessionReviewClosed);
    finish();
    expect(harness.getState().practiceMistakes).toEqual({ 1: [1] });
    start();
    answer(0, 2);
    finish();
    expect(harness.getState().practiceMistakes).toEqual({ 1: [1, 2] });
    expect(
      harness.getSubscriptionValue([appIds.subscriptions.practiceWrongCount]),
    ).toBe(1);
  });

  it("does not record answers from an abandoned exam", () => {
    const { harness, dispatch, start, answer, finish } = fixture();
    start();
    answer(0, 1);
    dispatch(appIds.events.navigationHomeOpened);
    finish("time-expired");
    expect(harness.getState().testSessionStatus).toBe("idle");
    expect(harness.getState().practiceMistakes).toEqual({});
  });

  it("only exposes review after submission, including when time expires", () => {
    const { harness, dispatch, start, answer, finish, review } = fixture();
    dispatch(appIds.events.testSessionReviewOpened);
    expect(harness.getState().testSessionReviewVisible).toBe(false);
    start();
    answer(0, 0);
    answer(1, 2);
    dispatch(appIds.events.testSessionReviewOpened, "incorrect");
    dispatch(appIds.events.testSessionReviewFilterSelected, "unanswered");
    expect(review().items).toEqual([]);
    expect(harness.getState().testSessionReviewVisible).toBe(false);
    finish("time-expired");
    dispatch(appIds.events.testSessionReviewOpened);
    expect(review().items).toHaveLength(33);
    expect(
      review()
        .items.slice(0, 3)
        .map(({ answerIndex, status }) => [answerIndex, status]),
    ).toEqual([
      [0, "correct"],
      [2, "incorrect"],
      [null, "unanswered"],
    ]);
    expect(review().items[32].questionIndex).toBe(32);
    expect(review().items[32].question.category).toBe("Berlin");
  });

  it("navigates matching questions in exam order and keeps the original question numbers", () => {
    const { harness, dispatch, start, answer, finish, review } = fixture();
    start();
    for (const index of [1, 5, 12]) answer(index, 1);
    answer(7, 0);
    finish();
    dispatch(appIds.events.testSessionReviewOpened, "incorrect");
    expect(review().items.map((item) => item.questionIndex)).toEqual([
      1, 5, 12,
    ]);
    expect(review().current.questionIndex).toBe(1);
    dispatch(appIds.events.testSessionReviewStepped, -1);
    expect(review().position).toBe(0);
    dispatch(appIds.events.testSessionReviewStepped, 1);
    expect(review().current.questionIndex).toBe(5);
    expect(review().position).toBe(1);
    dispatch(appIds.events.testSessionReviewQuestionSelected, 12);
    dispatch(appIds.events.testSessionReviewStepped, 1);
    expect(review().current.questionIndex).toBe(12);
    dispatch(appIds.events.testSessionReviewFilterSelected, "all");
    expect(review().current.questionIndex).toBe(12);
    dispatch(appIds.events.testSessionReviewFilterSelected, "correct");
    expect(review().current.questionIndex).toBe(7);
    for (const invalid of [-1, 1.5, NaN, Infinity, 99, 5])
      dispatch(appIds.events.testSessionReviewQuestionSelected, invalid);
    dispatch(appIds.events.testSessionReviewStepped, 5);
    dispatch(appIds.events.testSessionReviewFilterSelected, "invalid");
    expect(harness.getState().testSessionReviewFilter).toBe("correct");
    expect(review().current.questionIndex).toBe(7);
  });

  it("keeps the submission and practice progress unchanged while reviewing", () => {
    const { harness, dispatch, start, answer, finish } = fixture();
    dispatch(appIds.events.practiceQuestionAnswered, 1, 1);
    start();
    answer(0, 1);
    finish();
    const before = harness.getState();
    const result = harness.getSubscriptionValue([
      appIds.subscriptions.testSessionResult,
    ]);
    dispatch(appIds.events.testSessionReviewOpened);
    dispatch(appIds.events.testSessionReviewFilterSelected, "unanswered");
    dispatch(appIds.events.testSessionReviewStepped, 1);
    answer(0, 0);
    answer(1, 0);
    dispatch(appIds.events.testSessionFinished, "time-expired");
    dispatch(appIds.events.testSessionReviewClosed);
    expect(harness.getState().testSessionAnswers).toEqual(
      before.testSessionAnswers,
    );
    expect(harness.getState().testSessionFinishReason).toBe("finished");
    expect(harness.getState().practiceUserAnswers).toEqual(
      before.practiceUserAnswers,
    );
    expect(harness.getState().practiceMistakes).toEqual(
      before.practiceMistakes,
    );
    expect(harness.getState().navigationCurrentQuestionIndex).toBe(
      before.navigationCurrentQuestionIndex,
    );
    expect(
      harness.getSubscriptionValue([appIds.subscriptions.testSessionResult]),
    ).toEqual(result);
  });

  it("handles empty filters, preserves review position on return, and resets for a new exam", () => {
    const { harness, dispatch, start, finish, review } = fixture();
    start();
    finish();
    dispatch(appIds.events.testSessionReviewOpened, "incorrect");
    expect(review()).toEqual({ items: [], current: null, position: -1 });
    dispatch(appIds.events.testSessionReviewStepped, 1);
    dispatch(appIds.events.testSessionReviewFilterSelected, "unanswered");
    dispatch(appIds.events.testSessionReviewQuestionSelected, 9);
    dispatch(appIds.events.testSessionReviewClosed);
    expect(harness.getState().testSessionReviewVisible).toBe(false);
    dispatch(appIds.events.testSessionReviewOpened);
    expect(review().current.questionIndex).toBe(9);
    expect(harness.getState().testSessionReviewFilter).toBe("unanswered");
    start();
    expect(harness.getState().testSessionReviewVisible).toBe(false);
    expect(harness.getState().testSessionReviewFilter).toBe("all");
    expect(harness.getState().testSessionReviewQuestionIndex).toBe(0);
    expect(review().items).toEqual([]);
  });
});
