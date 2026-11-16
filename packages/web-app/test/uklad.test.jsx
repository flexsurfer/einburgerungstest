import { afterEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { createUkladTestHarness } from "@ukladjs/core/testing";
import {
  appIds,
  createAppRuntime,
  registerSharedModules,
  stateKeys,
} from "@ebtest/shared/uklad";
import { createWebApp } from "../src/bootstrap.js";
import { registerWebPlatform, watchWebSystemTheme } from "../src/platform.js";
import { AnswerButton } from "../src/components/AnswerButton.jsx";

const runtimes = [];
const apps = [];

afterEach(async () => {
  while (apps.length > 0) {
    await apps.pop().dispose();
  }
  while (runtimes.length > 0) {
    runtimes.pop().dispose();
  }
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  localStorage.clear();
  document.body.className = "";
  document.body.style.overflow = "";
  document.documentElement.style.colorScheme = "";
});

function createFixture() {
  const runtime = createAppRuntime({
    runtimeId: `web-platform-${runtimes.length + 1}`,
  });
  runtimes.push(runtime);
  registerSharedModules(runtime);
  registerWebPlatform(runtime);

  return {
    harness: createUkladTestHarness(runtime),
    runtime,
  };
}

describe("Uklad web platform", () => {
  it("reveals the correct option in mistake review without a current answer", () => {
    const markup = renderToStaticMarkup(
      <AnswerButton
        answer="Correct answer"
        index={0}
        isCorrect
        isSelected={false}
        showAnswers={false}
        revealCorrectAnswer
        disabled
        isExamMode={false}
        onClick={() => {}}
        userAnswer={undefined}
      />,
    );

    expect(markup).toContain('class="answer-button review-mode correct"');
    expect(markup).toContain("disabled");
  });

  it("provides the browser clock for the official timed exam session", async () => {
    vi.spyOn(Date, "now").mockReturnValue(2_000_000);
    vi.stubGlobal("scrollTo", vi.fn());
    const { harness, runtime } = createFixture();
    const generalQuestions = Array.from({ length: 30 }, (_, index) => ({
      question: `General question ${index + 1}`,
      category: "Politik",
      correct: 0,
      answers: ["A", "B", "C", "D"],
    }));
    const landQuestions = Array.from({ length: 10 }, (_, index) => ({
      question: `Bayern question ${index + 1}`,
      category: "Bayern",
      correct: 0,
      answers: ["A", "B", "C", "D"],
    }));

    harness.dispatchSync([
      appIds.events.questionsFetchSucceeded,
      [...generalQuestions, ...landQuestions],
    ]);
    runtime.dispatch([appIds.events.preferencesLandSelected, "Bayern"]);
    runtime.dispatch([appIds.events.testSessionStarted]);
    await harness.flush();

    expect(harness.getState()[stateKeys.testSessionQuestions]).toHaveLength(33);
    expect(harness.getState()[stateKeys.testSessionStatus]).toBe("in-progress");
    expect(harness.getState()[stateKeys.testSessionEndsAt]).toBe(
      2_000_000 + 60 * 60_000,
    );
  });

  it("applies the restored manual theme during app initialization", () => {
    const { harness } = createFixture();
    harness.dispatchSync([appIds.events.preferencesThemeToggled]);
    vi.stubGlobal("matchMedia", () => ({ matches: false }));

    harness.dispatchSync([appIds.events.appInitialize]);

    expect(harness.getState()[stateKeys.preferencesTheme]).toBe("dark");
    expect(document.body.classList.contains("dark")).toBe(true);
    expect(document.documentElement.style.colorScheme).toBe("dark");
  });

  it("uses the browser color scheme while system-theme mode is enabled", () => {
    const { harness } = createFixture();
    vi.stubGlobal("matchMedia", () => ({ matches: true }));

    harness.dispatchSync([appIds.events.appInitialize]);

    expect(harness.getState()[stateKeys.preferencesUseSystemTheme]).toBe(true);
    expect(harness.getState()[stateKeys.preferencesTheme]).toBe("dark");
    expect(document.body.classList.contains("dark")).toBe(true);
  });

  it("updates the DOM when the system color scheme changes", async () => {
    const { harness, runtime } = createFixture();
    let onChange;
    const mediaQuery = {
      matches: false,
      addEventListener: (_event, listener) => {
        onChange = listener;
      },
      removeEventListener: vi.fn(),
    };
    vi.stubGlobal("matchMedia", () => mediaQuery);

    const stopWatching = watchWebSystemTheme(runtime);
    onChange({ matches: true });
    await harness.flush();
    stopWatching();

    expect(document.body.classList.contains("dark")).toBe(true);
    expect(mediaQuery.removeEventListener).toHaveBeenCalledWith(
      "change",
      onChange,
    );
  });

  it("uses the legacy browser color-scheme listener signature", async () => {
    const { harness, runtime } = createFixture();
    let onChange;
    const mediaQuery = {
      matches: false,
      addListener: vi.fn((listener) => {
        onChange = listener;
      }),
      removeListener: vi.fn(),
    };
    vi.stubGlobal("matchMedia", () => mediaQuery);

    const stopWatching = watchWebSystemTheme(runtime);
    onChange({ matches: true });
    await harness.flush();
    stopWatching();

    expect(document.body.classList.contains("dark")).toBe(true);
    expect(mediaQuery.addListener).toHaveBeenCalledWith(onChange);
    expect(mediaQuery.removeListener).toHaveBeenCalledWith(onChange);
  });

  it("fetches questions through the platform effect and dispatches the result event", async () => {
    const { harness } = createFixture();
    const questions = [
      {
        question: "Who elects the Bundestag?",
        category: "Politik",
        correct: 0,
        answers: ["The people", "The courts"],
      },
    ];
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(questions),
      }),
    );

    harness.dispatchSync([appIds.events.questionsFetchRequested]);
    await vi.waitFor(async () => {
      await harness.flush();
      expect(
        harness.getSubscriptionValue([appIds.subscriptions.questionsLoaded]),
      ).toBe(true);
    });

    expect(fetch).toHaveBeenCalledWith("/assets/data.json", { method: "GET" });
    expect(
      harness.getSubscriptionValue([appIds.subscriptions.questionsItems]),
    ).toEqual([{ ...questions[0], globalIndex: 1 }]);
  });

  it("dispatches a sanitized error when a data request fails", async () => {
    const { harness } = createFixture();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
        statusText: "Unavailable",
      }),
    );

    harness.dispatchSync([appIds.events.questionsFetchRequested]);
    await vi.waitFor(async () => {
      await harness.flush();
      expect(
        harness.getSubscriptionValue([appIds.subscriptions.questionsError]),
      ).toBe("HTTP 503: Unavailable");
    });
  });

  it("confirms before clearing answers through the Uklad effect boundary", async () => {
    const { harness } = createFixture();
    harness.dispatchSync([
      appIds.events.questionsFetchSucceeded,
      [
        {
          question: "Question",
          category: "Politik",
          correct: 0,
          answers: ["A", "B"],
        },
      ],
    ]);
    harness.dispatchSync([appIds.events.practiceQuestionAnswered, 1, 1]);
    vi.stubGlobal(
      "confirm",
      vi.fn(() => true),
    );

    harness.dispatchSync([appIds.events.practiceClearAnswersRequested]);
    await harness.flush();

    expect(confirm).toHaveBeenCalledWith(
      "Are you sure you want to clear ALL your progress?",
    );
    expect(harness.getState()[stateKeys.practiceUserAnswers]).toEqual({});
    expect(harness.getState()[stateKeys.practiceMistakes]).toEqual({});
  });

  it("does not dispatch boot actions until persistence hydration resolves", async () => {
    let resolveHydration;
    const ready = new Promise((resolve) => {
      resolveHydration = resolve;
    });
    const persistence = {
      hydrate: vi.fn(),
      whenHydrated: () => ready,
      purge: vi.fn(),
      dispose: vi.fn().mockResolvedValue(undefined),
    };
    const runtime = createAppRuntime({
      runtimeId: "web-bootstrap",
    });
    const app = createWebApp({ runtime, persistence });
    apps.push(app);
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    });
    vi.stubGlobal("fetch", fetchMock);

    await Promise.resolve();
    expect(persistence.hydrate).toHaveBeenCalledOnce();
    expect(fetchMock).not.toHaveBeenCalled();

    resolveHydration();
    await app.hydration;
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    expect(fetchMock).toHaveBeenCalledWith("/assets/data.json", {
      method: "GET",
    });
  });

  it("does not purge stored data when hydration fails", async () => {
    const purge = vi.fn();
    const onHydrationError = vi.fn();
    const persistence = {
      hydrate: vi.fn(),
      whenHydrated: () => Promise.reject(new Error("temporary read failure")),
      purge,
      dispose: vi.fn().mockResolvedValue(undefined),
    };
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    });
    vi.stubGlobal("fetch", fetchMock);

    const runtime = createAppRuntime({
      runtimeId: "web-hydration-failure",
    });
    const app = createWebApp({ runtime, persistence, onHydrationError });
    apps.push(app);

    await app.hydration;

    expect(onHydrationError).toHaveBeenCalledOnce();
    expect(purge).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
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
      purge: vi.fn(),
      dispose: vi.fn().mockResolvedValue(undefined),
    };
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    });
    vi.stubGlobal("fetch", fetchMock);

    const runtime = createAppRuntime({
      runtimeId: "web-hydration-retry",
    });
    const app = createWebApp({ runtime, persistence });
    apps.push(app);

    expect((await app.hydration).ok).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();

    expect((await app.retryHydration()).ok).toBe(true);
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    expect(persistence.hydrate).toHaveBeenCalledTimes(2);
  });

  it("hydrates the legacy browser key before the first questions request", async () => {
    localStorage.setItem("userAnswers", JSON.stringify({ 1: 1 }));
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    });
    vi.stubGlobal("fetch", fetchMock);

    const app = createWebApp({ runtimeId: "web-legacy-hydration" });
    apps.push(app);
    const harness = createUkladTestHarness(app.runtime);

    await app.hydration;
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());

    expect(harness.getState()[stateKeys.practiceUserAnswers]).toEqual({
      1: 1,
    });
    expect(
      JSON.parse(localStorage.getItem("ebtest/practiceUserAnswers")),
    ).toEqual({
      v: 2,
      data: { 1: 1 },
    });
  });
});
