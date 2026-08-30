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
    expect(first.runtimeId).toBe("foundation-first");
    expect(second.runtimeId).toBe("foundation-second");
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
