import { afterEach, describe, expect, it, vi } from "vitest";
import { createUkladTestHarness } from "@ukladjs/core/testing";
import { Alert, AppState, Appearance } from "react-native";
import {
  appIds,
  createAppRuntime,
  registerSharedModules,
  stateKeys,
} from "@ebtest/shared/uklad";
import {
  registerMobilePlatform,
  watchMobileSystemTheme,
  type MobilePlatform,
} from "../src/platform";
import { bootstrapMobileApp, createMobileAppRuntime } from "../src/bootstrap";
import { examSecondsRemaining, formatExamTime } from "../src/exam-time";

vi.mock("@react-native-async-storage/async-storage", () => ({
  default: {
    getItem: vi.fn(async () => null),
    setItem: vi.fn(async () => undefined),
    removeItem: vi.fn(async () => undefined),
  },
}));

const runtimes: Array<ReturnType<typeof createAppRuntime>> = [];
const apps: Array<ReturnType<typeof bootstrapMobileApp>> = [];
type TestAppStateStatus = "active" | "inactive" | "background";

function emitAppStateChange(state: TestAppStateStatus): void {
  (
    AppState as unknown as {
      emitChange(nextState: TestAppStateStatus): void;
    }
  ).emitChange(state);
}

afterEach(async () => {
  while (apps.length > 0) await apps.pop()?.dispose();
  while (runtimes.length > 0) runtimes.pop()?.dispose();
  vi.restoreAllMocks();
});

function createRuntime(
  platform: MobilePlatform = { applySystemBarTheme: vi.fn() },
  withBundledQuestions = false,
) {
  const runtime = withBundledQuestions
    ? createMobileAppRuntime({
        runtimeId: `mobile-platform-${runtimes.length + 1}`,
      })
    : createAppRuntime({
        runtimeId: `mobile-platform-${runtimes.length + 1}`,
      });
  runtimes.push(runtime);
  registerSharedModules(runtime);
  registerMobilePlatform(runtime, platform);
  return { runtime, harness: createUkladTestHarness(runtime), platform };
}

describe("Uklad mobile platform", () => {
  it("loads bundled questions through the shared request lifecycle", async () => {
    const { harness } = createRuntime();

    harness.dispatchSync([appIds.events.questionsFetchRequested]);
    await harness.flush();

    expect(harness.getState()[stateKeys.questionsLoading]).toBe(false);
    expect(harness.getState()[stateKeys.questionsLoaded]).toBe(true);
    expect(harness.getState()[stateKeys.questionsItems].length).toBeGreaterThan(
      0,
    );

    harness.dispatchSync([appIds.events.vocabularyFetchRequested]);
    await harness.flush();
    expect(harness.getState()[stateKeys.vocabularyData]).not.toBeNull();
  });

  it("uses 300 general questions for practice and resumes by global index", () => {
    const { harness } = createRuntime(undefined, true);

    const practiceQuestions = harness.getSubscriptionValue([
      appIds.subscriptions.practiceFilteredQuestions,
    ]);
    expect(practiceQuestions).toHaveLength(300);
    expect(practiceQuestions[0].globalIndex).toBe(1);
    expect(practiceQuestions[practiceQuestions.length - 1]?.globalIndex).toBe(
      300,
    );
    expect(
      harness
        .getState()
        [stateKeys.questionsItems].filter(
          (question) => question.globalIndex > 300,
        ),
    ).toHaveLength(160);

    harness.dispatchSync([appIds.events.navigationCategorySelected, null]);
    harness.dispatchSync([appIds.events.navigationQuestionSelected, 123]);
    expect(harness.getState()[stateKeys.practiceGlobalIndex]).toBe(124);

    harness.dispatchSync([appIds.events.navigationCategorySelected, "Politik"]);
    expect(harness.getState()[stateKeys.navigationCurrentQuestionIndex]).toBe(
      0,
    );
    harness.dispatchSync([appIds.events.navigationNext]);
    expect(harness.getState()[stateKeys.navigationCurrentQuestionIndex]).toBe(
      1,
    );
    expect(harness.getState()[stateKeys.practiceGlobalIndex]).toBe(124);
    harness.dispatchSync([appIds.events.navigationCategorySelected, "Politik"]);
    expect(harness.getState()[stateKeys.navigationCurrentQuestionIndex]).toBe(
      0,
    );

    harness.dispatchSync([appIds.events.navigationHomeOpened]);
    harness.dispatchSync([appIds.events.navigationPracticeResumed]);
    expect(harness.getState()[stateKeys.navigationSelectedCategory]).toBe(null);
    expect(harness.getState()[stateKeys.navigationCurrentQuestionIndex]).toBe(
      123,
    );
    expect(
      harness.getSubscriptionValue([
        appIds.subscriptions.navigationCurrentQuestion,
      ]).globalIndex,
    ).toBe(124);
  });

  it("resumes Learn independently from the saved Practice position", () => {
    const { harness } = createRuntime(undefined, true);

    harness.dispatchSync([appIds.events.navigationCategorySelected, null]);
    harness.dispatchSync([appIds.events.navigationQuestionSelected, 123]);
    harness.dispatchSync([appIds.events.preferencesLandSelected, "Bayern"]);
    harness.dispatchSync([appIds.events.navigationLearnOpened]);

    expect(harness.getState()[stateKeys.navigationActiveScreen]).toBe(
      "questions",
    );
    expect(harness.getState()[stateKeys.navigationSelectedCategory]).toBeNull();
    expect(harness.getState()[stateKeys.navigationCurrentQuestionIndex]).toBe(
      0,
    );
    expect(harness.getState()[stateKeys.uiShowAnswers]).toBe(true);
    expect(harness.getState()[stateKeys.navigationIsLearnMode]).toBe(true);
    expect(harness.getState()[stateKeys.practiceGlobalIndex]).toBe(124);
    expect(harness.getState()[stateKeys.practiceLearnGlobalIndex]).toBe(1);
    expect(
      harness.getSubscriptionValue([
        appIds.subscriptions.practiceFilteredQuestionsCount,
      ]),
    ).toBe(310);

    harness.dispatchSync([appIds.events.navigationQuestionSelected, 208]);
    expect(harness.getState()[stateKeys.practiceLearnGlobalIndex]).toBe(209);
    expect(harness.getState()[stateKeys.practiceGlobalIndex]).toBe(124);

    harness.dispatchSync([appIds.events.navigationHomeOpened]);
    expect(harness.getState()[stateKeys.uiShowAnswers]).toBe(false);
    expect(harness.getState()[stateKeys.navigationIsLearnMode]).toBe(false);

    harness.dispatchSync([appIds.events.navigationLearnOpened]);
    expect(harness.getState()[stateKeys.navigationCurrentQuestionIndex]).toBe(
      208,
    );
    expect(
      harness.getSubscriptionValue([
        appIds.subscriptions.navigationCurrentQuestion,
      ]).globalIndex,
    ).toBe(209);
    expect(harness.getState()[stateKeys.practiceGlobalIndex]).toBe(124);
  });

  it("adds the selected Land to Practice and appends three Land questions to mock exams", () => {
    const { harness } = createRuntime(undefined, true);

    expect(
      harness.getSubscriptionValue([
        appIds.subscriptions.preferencesSelectedLand,
      ]),
    ).toBeNull();

    harness.dispatchSync([appIds.events.preferencesLandSelected, "Bayern"]);

    const practiceQuestions = harness.getSubscriptionValue([
      appIds.subscriptions.practiceFilteredQuestions,
    ]);
    expect(practiceQuestions).toHaveLength(310);
    expect(
      practiceQuestions
        .slice(0, 300)
        .every((question) => question.globalIndex <= 300),
    ).toBe(true);
    expect(
      practiceQuestions
        .slice(300)
        .every((question) => question.category === "Bayern"),
    ).toBe(true);
    expect(
      harness.getSubscriptionValue([appIds.subscriptions.practiceOverview])
        .totalQuestions,
    ).toBe(310);

    harness.dispatchSync([appIds.events.navigationCategorySelected, "test"]);
    const examQuestions = harness.getState()[stateKeys.testSessionQuestions];

    expect(examQuestions).toHaveLength(33);
    expect(
      examQuestions
        .slice(0, 30)
        .every((question) => question.globalIndex <= 300),
    ).toBe(true);
    expect(
      examQuestions
        .slice(30)
        .every((question) => question.category === "Bayern"),
    ).toBe(true);
    expect(
      new Set(examQuestions.map((question) => question.globalIndex)).size,
    ).toBe(33);
  });

  it("runs the official 60-minute mobile exam lifecycle and evaluates 17 correct answers as passed", () => {
    vi.spyOn(Date, "now").mockReturnValue(1_000_000);
    const { harness } = createRuntime(undefined, true);

    harness.dispatchSync([appIds.events.preferencesLandSelected, "Bayern"]);
    harness.dispatchSync([appIds.events.testSessionStarted]);

    const state = harness.getState();
    const examQuestions = state[stateKeys.testSessionQuestions];
    expect(examQuestions).toHaveLength(33);
    expect(state[stateKeys.testSessionStatus]).toBe("in-progress");
    expect(state[stateKeys.testSessionEndsAt]).toBe(1_000_000 + 60 * 60_000);
    expect(state[stateKeys.navigationSelectedCategory]).toBe("test");

    const firstQuestion = examQuestions[0];
    const firstWrongAnswer = (firstQuestion.correct + 1) % 4;
    harness.dispatchSync([
      appIds.events.testSessionAnswerSelected,
      firstQuestion.globalIndex,
      firstWrongAnswer,
    ]);
    harness.dispatchSync([
      appIds.events.testSessionAnswerSelected,
      firstQuestion.globalIndex,
      firstQuestion.correct,
    ]);
    expect(
      harness.getState()[stateKeys.testSessionAnswers][
        firstQuestion.globalIndex
      ],
    ).toBe(firstQuestion.correct);

    for (const question of examQuestions.slice(1, 16)) {
      harness.dispatchSync([
        appIds.events.testSessionAnswerSelected,
        question.globalIndex,
        question.correct,
      ]);
    }

    expect(
      harness.getSubscriptionValue([appIds.subscriptions.testSessionResult])
        .passed,
    ).toBe(false);

    harness.dispatchSync([
      appIds.events.testSessionAnswerSelected,
      examQuestions[16].globalIndex,
      examQuestions[16].correct,
    ]);

    expect(
      harness.getSubscriptionValue([appIds.subscriptions.testSessionResult]),
    ).toEqual({
      correct: 17,
      incorrect: 0,
      unanswered: 16,
      answered: 17,
      total: 33,
      requiredCorrect: 17,
      passed: true,
    });

    harness.dispatchSync([appIds.events.testSessionFinished, "time-expired"]);
    expect(harness.getState()[stateKeys.testSessionStatus]).toBe("completed");
    expect(harness.getState()[stateKeys.testSessionFinishReason]).toBe(
      "time-expired",
    );

    harness.dispatchSync([appIds.events.testSessionStarted]);
    harness.dispatchSync([appIds.events.testSessionFinished, "finished"]);
    expect(harness.getState()[stateKeys.testSessionStatus]).toBe("completed");
    expect(harness.getState()[stateKeys.testSessionFinishReason]).toBe(
      "finished",
    );
  });

  it("formats the exam countdown without going below zero", () => {
    expect(examSecondsRemaining(61_001, 1_000)).toBe(61);
    expect(examSecondsRemaining(999, 1_000)).toBe(0);
    expect(formatExamTime(3_600)).toBe("60:00");
    expect(formatExamTime(61)).toBe("01:01");
    expect(formatExamTime(-1)).toBe("00:00");
  });

  it("applies the persisted/system theme through the host platform", () => {
    const applySystemBarTheme = vi.fn();
    const { harness } = createRuntime({ applySystemBarTheme });
    vi.spyOn(Appearance, "getColorScheme").mockReturnValue("dark");

    harness.dispatchSync([appIds.events.appInitialize]);

    expect(harness.getState()[stateKeys.preferencesTheme]).toBe("dark");
    expect(applySystemBarTheme).toHaveBeenCalledWith("dark");
  });

  it("opens settings and applies system, light, and dark theme choices", () => {
    vi.spyOn(Appearance, "getColorScheme").mockReturnValue("dark");
    const applySystemBarTheme = vi.fn();
    const { harness } = createRuntime({ applySystemBarTheme });

    expect(
      harness.getSubscriptionValue([
        appIds.subscriptions.preferencesThemeSelection,
      ]),
    ).toBe("system");

    harness.dispatchSync([appIds.events.navigationSettingsOpened]);
    expect(harness.getState()[stateKeys.navigationActiveScreen]).toBe(
      "settings",
    );

    harness.dispatchSync([appIds.events.preferencesThemeSelected, "light"]);
    expect(harness.getState()[stateKeys.preferencesTheme]).toBe("light");
    expect(harness.getState()[stateKeys.preferencesUseSystemTheme]).toBe(false);
    expect(
      harness.getSubscriptionValue([
        appIds.subscriptions.preferencesThemeSelection,
      ]),
    ).toBe("light");
    expect(applySystemBarTheme).toHaveBeenLastCalledWith("light");

    harness.dispatchSync([appIds.events.preferencesThemeSelected, "dark"]);
    expect(harness.getState()[stateKeys.preferencesTheme]).toBe("dark");
    expect(harness.getState()[stateKeys.preferencesUseSystemTheme]).toBe(false);
    expect(applySystemBarTheme).toHaveBeenLastCalledWith("dark");

    harness.dispatchSync([appIds.events.preferencesThemeSelected, "system"]);
    expect(harness.getState()[stateKeys.preferencesTheme]).toBe("dark");
    expect(harness.getState()[stateKeys.preferencesUseSystemTheme]).toBe(true);
    expect(
      harness.getSubscriptionValue([
        appIds.subscriptions.preferencesThemeSelection,
      ]),
    ).toBe("system");
    expect(applySystemBarTheme).toHaveBeenLastCalledWith("dark");

    harness.dispatchSync([appIds.events.navigationHomeOpened]);
    expect(harness.getState()[stateKeys.navigationActiveScreen]).toBe("home");
  });

  it("forwards native system-theme changes only while system mode is enabled", async () => {
    const listeners: Array<
      (event: { colorScheme: "light" | "dark" | null }) => void
    > = [];
    vi.spyOn(Appearance, "addChangeListener").mockImplementation((listener) => {
      listeners.push(listener);
      return { remove: vi.fn() };
    });

    const { runtime, harness } = createRuntime();
    const stop = watchMobileSystemTheme(runtime);

    listeners[0]?.({ colorScheme: "dark" });
    await harness.flush();
    expect(harness.getState()[stateKeys.preferencesTheme]).toBe("dark");

    harness.dispatchSync([appIds.events.preferencesThemeToggled]);
    listeners[0]?.({ colorScheme: "light" });
    await harness.flush();
    expect(harness.getState()[stateKeys.preferencesTheme]).toBe("light");

    stop();
  });

  it("confirms before clearing answers through the native dialog", async () => {
    vi.spyOn(Alert, "alert").mockImplementation((_title, _message, buttons) => {
      buttons?.[1]?.onPress?.();
    });
    const { harness } = createRuntime();

    harness.dispatchSync([appIds.events.practiceQuestionAnswered, 1, 0]);
    harness.dispatchSync([appIds.events.practiceClearAnswersRequested]);
    await harness.flush();

    expect(harness.getState()[stateKeys.practiceUserAnswers]).toEqual({});
    expect(Alert.alert).toHaveBeenCalledWith(
      "Clear progress",
      "Are you sure you want to clear ALL your progress?",
      expect.any(Array),
    );
  });

  it("injects bundled questions before persistence hydration settles", async () => {
    let resolveHydration: (() => void) | undefined;
    const hydrationPromise = new Promise<void>((resolve) => {
      resolveHydration = resolve;
    });
    const persistence = {
      hydrate: vi.fn(),
      whenHydrated: vi.fn(() => hydrationPromise),
      purge: vi.fn(async () => undefined),
      flush: vi.fn(async () => undefined),
      dispose: vi.fn(async () => undefined),
    } as unknown as ReturnType<
      typeof import("../src/persistence").attachMobilePersistence
    >;
    const applySystemBarTheme = vi.fn();
    const runtime = createMobileAppRuntime({
      runtimeId: "mobile-bootstrap",
    });
    runtimes.push(runtime);

    const app = bootstrapMobileApp({
      runtime,
      platform: { applySystemBarTheme },
      persistence,
    });
    apps.push(app);
    const harness = createUkladTestHarness(runtime);

    expect(persistence.hydrate).toHaveBeenCalledTimes(1);
    expect(harness.getState()[stateKeys.questionsLoaded]).toBe(true);
    expect(harness.getState()[stateKeys.questionsItems].length).toBeGreaterThan(
      0,
    );
    expect(applySystemBarTheme).not.toHaveBeenCalled();
    emitAppStateChange("background");
    await Promise.resolve();
    expect(persistence.flush).not.toHaveBeenCalled();

    resolveHydration?.();
    await app.hydration;
    await harness.flush();

    expect(harness.getState()[stateKeys.questionsLoaded]).toBe(true);
    expect(applySystemBarTheme).toHaveBeenCalledWith("light");
  });

  it("does not purge stored data when hydration fails", async () => {
    const purge = vi.fn();
    const onHydrationError = vi.fn();
    const persistence = {
      hydrate: vi.fn(),
      whenHydrated: vi.fn(() =>
        Promise.reject(new Error("temporary read failure")),
      ),
      purge,
      flush: vi.fn(async () => undefined),
      dispose: vi.fn(async () => undefined),
    } as unknown as ReturnType<
      typeof import("../src/persistence").attachMobilePersistence
    >;
    const runtime = createMobileAppRuntime({
      runtimeId: "mobile-hydration-failure",
    });
    runtimes.push(runtime);
    const harness = createUkladTestHarness(runtime);

    const app = bootstrapMobileApp({
      runtime,
      platform: { applySystemBarTheme: vi.fn() },
      persistence,
      onHydrationError,
    });
    apps.push(app);

    await app.hydration;
    await harness.flush();

    expect(onHydrationError).toHaveBeenCalledOnce();
    expect(purge).not.toHaveBeenCalled();
    expect(harness.getState()[stateKeys.questionsLoading]).toBe(false);
    expect(harness.getState()[stateKeys.questionsLoaded]).toBe(true);
  });

  it("keeps boot actions blocked until a hydration retry succeeds", async () => {
    let hydrationAttempt = 0;
    const persistence = {
      hydrate: vi.fn(),
      whenHydrated: vi.fn(() => {
        hydrationAttempt += 1;
        return hydrationAttempt === 1
          ? Promise.reject(new Error("temporary read failure"))
          : Promise.resolve();
      }),
      purge: vi.fn(async () => undefined),
      flush: vi.fn(async () => undefined),
      dispose: vi.fn(async () => undefined),
    } as unknown as ReturnType<
      typeof import("../src/persistence").attachMobilePersistence
    >;
    const runtime = createMobileAppRuntime({
      runtimeId: "mobile-hydration-retry",
    });
    runtimes.push(runtime);
    const app = bootstrapMobileApp({
      runtime,
      platform: { applySystemBarTheme: vi.fn() },
      persistence,
    });
    apps.push(app);
    const harness = createUkladTestHarness(runtime);

    expect((await app.hydration).ok).toBe(false);
    await harness.flush();
    expect(harness.getState()[stateKeys.questionsLoading]).toBe(false);
    expect(harness.getState()[stateKeys.questionsLoaded]).toBe(true);

    expect((await app.retryHydration()).ok).toBe(true);
    await harness.flush();
    expect(harness.getState()[stateKeys.questionsLoading]).toBe(false);
    expect(harness.getState()[stateKeys.questionsLoaded]).toBe(true);
    expect(persistence.hydrate).toHaveBeenCalledTimes(2);
  });

  it("flushes queued persistence when the app enters a background state", async () => {
    const persistence = {
      hydrate: vi.fn(),
      whenHydrated: vi.fn(async () => undefined),
      purge: vi.fn(async () => undefined),
      flush: vi.fn(async () => undefined),
      dispose: vi.fn(async () => undefined),
    } as unknown as ReturnType<
      typeof import("../src/persistence").attachMobilePersistence
    >;
    const app = bootstrapMobileApp({
      platform: { applySystemBarTheme: vi.fn() },
      persistence,
    });
    apps.push(app);

    await app.hydration;
    emitAppStateChange("inactive");
    emitAppStateChange("background");
    await Promise.resolve();

    expect(persistence.flush).toHaveBeenCalledTimes(1);
  });

  it("reports background flush failures without an unhandled rejection", async () => {
    const onPersistenceFlushError = vi.fn();
    let flushAttempt = 0;
    const persistence = {
      hydrate: vi.fn(),
      whenHydrated: vi.fn(async () => undefined),
      purge: vi.fn(async () => undefined),
      flush: vi.fn(async () => {
        flushAttempt += 1;
        if (flushAttempt === 1) throw new Error("background flush failed");
      }),
      dispose: vi.fn(async () => undefined),
    } as unknown as ReturnType<
      typeof import("../src/persistence").attachMobilePersistence
    >;
    const app = bootstrapMobileApp({
      platform: { applySystemBarTheme: vi.fn() },
      persistence,
      onPersistenceFlushError,
    });
    apps.push(app);

    await app.hydration;
    emitAppStateChange("background");
    await vi.waitFor(() =>
      expect(onPersistenceFlushError).toHaveBeenCalledWith(
        expect.objectContaining({ message: "background flush failed" }),
      ),
    );
  });

  it("flushes before disposal and removes the AppState listener", async () => {
    const lifecycle: string[] = [];
    const persistence = {
      hydrate: vi.fn(),
      whenHydrated: vi.fn(async () => undefined),
      purge: vi.fn(async () => undefined),
      flush: vi.fn(async () => {
        lifecycle.push("flush");
      }),
      dispose: vi.fn(async () => {
        lifecycle.push("dispose");
      }),
    } as unknown as ReturnType<
      typeof import("../src/persistence").attachMobilePersistence
    >;
    const app = bootstrapMobileApp({
      platform: { applySystemBarTheme: vi.fn() },
      persistence,
    });
    apps.push(app);

    await app.hydration;
    await app.dispose();
    expect(persistence.flush).toHaveBeenCalledTimes(1);
    expect(lifecycle).toEqual(["flush", "dispose"]);

    emitAppStateChange("background");
    await Promise.resolve();
    expect(persistence.flush).toHaveBeenCalledTimes(1);
    expect(persistence.dispose).toHaveBeenCalledOnce();
  });
});
