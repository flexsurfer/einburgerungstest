import { afterEach, describe, expect, it } from "vitest";
import { createUkladTestHarness } from "@ukladjs/core/testing";
import {
  appIds,
  createAppRuntime,
  createAppState,
  registerAppModules,
  stateKeys,
} from "../src/app/uklad/index.ts";

const runtimes = [];

afterEach(() => {
  while (runtimes.length > 0) {
    runtimes.pop().dispose();
  }
});

describe("Uklad application foundation", () => {
  it("creates fresh state roots for each runtime owner", () => {
    const first = createAppRuntime({ runtimeId: "foundation-first" });
    const second = createAppRuntime({ runtimeId: "foundation-second" });
    runtimes.push(first, second);

    const firstState = createAppState();
    const secondState = createAppState();

    expect(firstState[stateKeys.practiceUserAnswers]).not.toBe(
      secondState[stateKeys.practiceUserAnswers],
    );
    expect(firstState[stateKeys.practiceFavorites]).not.toBe(
      secondState[stateKeys.practiceFavorites],
    );
    expect(firstState[stateKeys.questionsItems]).toEqual([]);
    expect(firstState[stateKeys.navigationCurrentQuestionIndex]).toBe(0);
    expect(firstState[stateKeys.navigationActiveScreen]).toBe("home");
    expect(firstState[stateKeys.preferencesSelectedLand]).toBeNull();
    expect(first.runtimeId).toBe("foundation-first");
    expect(second.runtimeId).toBe("foundation-second");
  });

  it("injects detached questions into the first runtime snapshot", () => {
    const initialQuestions = [
      {
        question: "Who elects the Bundestag?",
        category: "Politik",
        correct: 0,
        answers: ["The people", "The courts"],
      },
      {
        question: "Which state is a Bundesland?",
        category: "Bayern",
        correct: 0,
        answers: ["Bayern", "Elsass"],
      },
    ];
    const runtime = createAppRuntime({
      runtimeId: "foundation-initial-questions",
      initialQuestions,
    });
    runtimes.push(runtime);
    const state = createUkladTestHarness(runtime).getState();

    expect(state[stateKeys.questionsLoaded]).toBe(true);
    expect(state[stateKeys.questionsLoading]).toBe(false);
    expect(
      state[stateKeys.questionsItems].map(({ globalIndex }) => globalIndex),
    ).toEqual([1, 2]);
    expect(state[stateKeys.questionsCategories]).toEqual([
      { title: "Themes", items: [["Politik", 1]] },
      { title: "Bundesländer", items: [["Bayern", 1]] },
    ]);
    expect(state[stateKeys.questionsItems]).not.toBe(initialQuestions);
    expect(state[stateKeys.questionsItems][0].answers).not.toBe(
      initialQuestions[0].answers,
    );
  });

  it("registers modules against one runtime and exposes typed root subscriptions", () => {
    const runtime = createAppRuntime({ runtimeId: "foundation-module" });
    runtimes.push(runtime);

    registerAppModules(runtime, [
      (registrar) => {
        registrar.regRootSub(
          appIds.subscriptions.uiShowAnswers,
          stateKeys.uiShowAnswers,
        );
        registrar.regEvent(
          appIds.events.uiShowAnswersToggled,
          ({ draftState }) => {
            draftState[stateKeys.uiShowAnswers] = true;
          },
        );
      },
    ]);

    const harness = createUkladTestHarness(runtime);
    harness.dispatchSync([appIds.events.uiShowAnswersToggled]);

    expect(harness.getState()[stateKeys.uiShowAnswers]).toBe(true);
    expect(
      harness.getSubscriptionValue([appIds.subscriptions.uiShowAnswers]),
    ).toBe(true);
  });
});
