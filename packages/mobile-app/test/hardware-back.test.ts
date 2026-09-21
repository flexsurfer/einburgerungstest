import { afterEach, describe, expect, it, vi } from "vitest";
import { BackHandler, Platform } from "react-native";
import { createUkladTestHarness } from "@ukladjs/core/testing";
import {
  appIds,
  createAppRuntime,
  registerSharedModules,
  type AppRuntime,
} from "@ebtest/shared/uklad";
import { watchMobileBack } from "../src/hardware-back";
import { mobileQuestionsData, registerMobilePlatform } from "../src/platform";

const runtimes: AppRuntime[] = [];

afterEach(() => {
  while (runtimes.length) runtimes.pop()?.dispose();
  vi.restoreAllMocks();
});

type AppEvent = Parameters<AppRuntime["dispatch"]>[0];
const screens: Array<[string, AppEvent[]]> = [
  ["settings", [[appIds.events.navigationSettingsOpened]]],
  ["practice", [[appIds.events.navigationCategorySelected, null]]],
  ["learning", [[appIds.events.navigationLearnOpened]]],
  ["category", [[appIds.events.navigationCategorySelected, "Politik"]]],
  ["favorites", [[appIds.events.navigationCategorySelected, "favorites"]]],
  ["mistakes", [[appIds.events.navigationCategorySelected, "wrong"]]],
  ["exam", [[appIds.events.testSessionStarted]]],
  [
    "exam results",
    [
      [appIds.events.testSessionStarted],
      [appIds.events.testSessionFinished, "finished"],
    ],
  ],
];

describe("Android hardware Back", () => {
  it.each(screens)(
    "returns from %s to Home and consumes Back",
    async (_, events) => {
      const runtime = createAppRuntime({
        initialQuestions: mobileQuestionsData,
      });
      runtimes.push(runtime);
      registerSharedModules(runtime);
      registerMobilePlatform(runtime, { applySystemBarTheme: vi.fn() });
      const harness = createUkladTestHarness(runtime);
      runtime.dispatch([appIds.events.preferencesLandSelected, "Bayern"]);
      runtime.dispatch([appIds.events.navigationCategorySelected, null]);
      runtime.dispatch([appIds.events.navigationQuestionSelected, 12]);
      runtime.dispatch([appIds.events.practiceQuestionAnswered, 13, 0]);
      for (const event of events) runtime.dispatch(event);
      await harness.flush();

      const before = harness.getState();
      expect(before.navigationActiveScreen).not.toBe("home");
      const addListener = vi.spyOn(BackHandler, "addEventListener");
      const remove = vi.fn();
      addListener.mockReturnValue({ remove });
      const stop = watchMobileBack(runtime, true);
      expect(addListener.mock.calls[0][0]).toBe("hardwareBackPress");

      expect(
        addListener.mock.calls[0][1]({
          type: "hardwareBackPress",
          timeStamp: 0,
        }),
      ).toBe(true);
      await harness.flush();

      const after = harness.getState();
      expect(after.navigationActiveScreen).toBe("home");
      expect(after.navigationIsLearnMode).toBe(false);
      expect(after.uiShowAnswers).toBe(false);
      expect(after.navigationQuestionPickerVisible).toBe(false);
      expect(after.practiceGlobalIndex).toBe(before.practiceGlobalIndex);
      expect(after.practiceUserAnswers).toEqual(before.practiceUserAnswers);
      expect(after.testSessionAnswers).toEqual(before.testSessionAnswers);
      if (before.testSessionStatus === "in-progress") {
        expect(after.testSessionStatus).toBe("idle");
        expect(after.testSessionEndsAt).toBeNull();
      } else {
        expect(after.testSessionStatus).toBe(before.testSessionStatus);
      }

      stop?.();
      expect(remove).toHaveBeenCalledOnce();
    },
  );

  it("leaves Android's default Back behavior when navigation is unavailable", () => {
    const addListener = vi.spyOn(BackHandler, "addEventListener");
    const dispatch = vi.fn();
    expect(watchMobileBack({ dispatch }, false)).toBeUndefined();
    expect(addListener).not.toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalled();
  });

  it("does not register Android Back handling on iOS", () => {
    vi.spyOn(Platform, "OS", "get").mockReturnValue("ios");
    const addListener = vi.spyOn(BackHandler, "addEventListener");
    expect(watchMobileBack({ dispatch: vi.fn() }, true)).toBeUndefined();
    expect(addListener).not.toHaveBeenCalled();
  });
});
