import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createUkladTestHarness } from "@ukladjs/core/testing";
import { appIds, type NavigationRoute } from "@ebtest/shared/uklad";
import { createWebApp, type WebApp } from "../src/bootstrap";
import { routeFromUrl } from "../src/navigation";
import { appHref, appPaths } from "../src/routes";

const questions = [
  ...Array.from({ length: 30 }, (_, index) => ({
    question: `Question ${index + 1}`,
    category: index % 2 ? "Recht" : "Politik",
    correct: 0,
    answers: ["Correct", "Incorrect"],
  })),
  ...Array.from({ length: 10 }, (_, index) => ({
    question: `Berlin ${index + 1}`,
    category: "Berlin",
    correct: 0,
    answers: ["Correct", "Incorrect"],
  })),
];
const apps: WebApp[] = [];

beforeEach(() => {
  window.history.replaceState(null, "", "/app/");
  vi.stubGlobal("scrollTo", vi.fn());
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({ ok: true, json: async () => questions }),
  );
});
afterEach(async () => {
  for (const app of apps.splice(0)) await app.dispose();
  localStorage.clear();
  window.history.replaceState(null, "", "/");
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

async function boot(href: string) {
  window.history.replaceState(null, "", href);
  const app = createWebApp();
  apps.push(app);
  const harness = createUkladTestHarness(app.runtime);
  await app.hydration;
  await vi.waitFor(async () => {
    await harness.flush();
    expect(harness.getState().questionsLoaded).toBe(true);
  });
  return { app, harness };
}

async function traverse(direction: "back" | "forward") {
  const popped = new Promise<void>((resolve) =>
    window.addEventListener("popstate", () => resolve(), { once: true }),
  );
  window.history[direction]();
  await popped;
}

describe("browser destinations", () => {
  it.each(Object.keys(appPaths) as NavigationRoute["screen"][])(
    "round-trips the %s screen",
    (screen) => {
      const route = { screen, language: "uk" as const };
      expect(
        routeFromUrl(new URL(appHref(route), "https://www.ebtest.org")),
      ).toEqual(route);
    },
  );

  it("validates URL parameters and normalizes directory URLs", () => {
    expect(
      routeFromUrl(
        new URL(
          "https://www.ebtest.org/app/practice?lang=toString&question=-2&category=Recht",
        ),
      ),
    ).toEqual({ screen: "practice", category: "Recht" });
    expect(
      routeFromUrl(
        new URL(
          "https://www.ebtest.org/app/learn/index.html?lang=ar&question=42",
        ),
      ),
    ).toEqual({ screen: "learn", language: "ar", question: 42 });
    expect(
      routeFromUrl(new URL("https://www.ebtest.org/app/unknown/?question=1")),
    ).toEqual({ screen: "home" });
  });

  it("opens the requested topic and question after restoring saved preferences", async () => {
    localStorage.setItem(
      "ebtest/preferencesSelectedLanguage",
      JSON.stringify({ v: 2, data: "de" }),
    );
    localStorage.setItem(
      "ebtest/practiceUserAnswers",
      JSON.stringify({ v: 2, data: { 1: 0 } }),
    );
    const { harness } = await boot(
      "/app/practice/?category=Recht&question=4&lang=uk",
    );
    expect(harness.getState()).toMatchObject({
      navigationActiveScreen: "questions",
      navigationSelectedCategory: "Recht",
      navigationCurrentQuestionIndex: 1,
      preferencesSelectedLanguage: "uk",
      practiceUserAnswers: { 1: 0 },
    });
    expect(
      harness.getSubscriptionValue([
        appIds.subscriptions.navigationCurrentQuestion,
      ])?.globalIndex,
    ).toBe(4);
  });

  it("waits for questions, keeps the requested URL through failure, and applies it on retry", async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error("offline"));
    window.history.replaceState(null, "", "/app/learn/?question=4&lang=ru");
    const app = createWebApp();
    apps.push(app);
    const harness = createUkladTestHarness(app.runtime);
    await app.hydration;
    await vi.waitFor(async () => {
      await harness.flush();
      expect(harness.getState().questionsError).toBe("offline");
    });
    expect(window.location.pathname).toBe("/app/learn/");
    expect(window.location.search).toContain("question=4");
    app.runtime.dispatch([appIds.events.questionsFetchRequested]);
    await vi.waitFor(async () => {
      await harness.flush();
      expect(harness.getState().navigationIsLearnMode).toBe(true);
    });
    expect(harness.getState().uiShowAnswers).toBe(true);
    expect(harness.getState().practiceLearnGlobalIndex).toBe(4);
  });

  it("supports browser Back/Forward without adding entries or reverting answers", async () => {
    const { app, harness } = await boot("/app/");
    app.runtime.dispatch([appIds.events.navigationPracticeResumed]);
    await harness.flush();
    app.runtime.dispatch([appIds.events.navigationNext]);
    app.runtime.dispatch([appIds.events.practiceQuestionAnswered, 2, 0]);
    await harness.flush();
    const practiceUrl = window.location.href;
    const historyLength = window.history.length;
    app.runtime.dispatch([appIds.events.navigationSettingsOpened]);
    await harness.flush();
    expect(window.history.length).toBe(historyLength + 1);
    await traverse("back");
    await harness.flush();
    expect(window.location.href).toBe(practiceUrl);
    expect(harness.getState().navigationActiveScreen).toBe("questions");
    expect(harness.getState().navigationCurrentQuestionIndex).toBe(1);
    expect(harness.getState().practiceUserAnswers[2]).toBe(0);
    await traverse("forward");
    await harness.flush();
    expect(harness.getState().navigationActiveScreen).toBe("settings");
    expect(window.history.length).toBe(historyLength + 1);
  });

  it("replaces question steps and duplicate destinations instead of filling history", async () => {
    const { app, harness } = await boot("/app/practice/");
    const length = window.history.length;
    app.runtime.dispatch([appIds.events.navigationNext]);
    app.runtime.dispatch([appIds.events.navigationNext]);
    await harness.flush();
    expect(new URLSearchParams(window.location.search).get("question")).toBe(
      "3",
    );
    app.runtime.dispatch([appIds.events.navigationPracticeResumed]);
    await harness.flush();
    expect(window.history.length).toBe(length);
  });

  it("opens a regional question without changing the selected federal state", async () => {
    const { harness } = await boot("/app/practice/?question=35");
    expect(harness.getState().navigationSelectedCategory).toBe("Berlin");
    expect(harness.getState().preferencesSelectedLand).toBeNull();
    expect(
      harness.getSubscriptionValue([
        appIds.subscriptions.navigationCurrentQuestion,
      ])?.globalIndex,
    ).toBe(35);
  });

  it("opens setup on a direct exam link and dismisses it to Home", async () => {
    const { app, harness } = await boot("/app/exam/");
    expect(harness.getState()).toMatchObject({
      navigationActiveScreen: "home",
      navigationExamSetupVisible: true,
      testSessionStatus: "idle",
      testSessionQuestions: [],
      testSessionEndsAt: null,
    });
    app.runtime.dispatch([appIds.events.navigationExamClosed]);
    await harness.flush();
    expect(window.location.pathname).toBe("/app/");
    expect(harness.getState().navigationExamSetupVisible).toBe(false);
  });

  it("discards an unfinished exam on Back and opens fresh setup on Forward", async () => {
    const { app, harness } = await boot("/app/practice/?lang=en&question=4");
    const practiceUrl = window.location.href;
    app.runtime.dispatch([appIds.events.practiceQuestionAnswered, 4, 0]);
    app.runtime.dispatch([
      appIds.events.navigationRouteOpened,
      { screen: "exam" },
      false,
    ]);
    app.runtime.dispatch([appIds.events.preferencesLandSelected, "Berlin"]);
    app.runtime.dispatch([appIds.events.testSessionStarted]);
    await harness.flush();
    const {
      testSessionQuestions: [first],
      testSessionEndsAt,
    } = harness.getState();
    app.runtime.dispatch([
      appIds.events.testSessionAnswerSelected,
      first.globalIndex,
      1,
    ]);
    app.runtime.dispatch([appIds.events.navigationNext]);
    await harness.flush();
    expect(window.location.pathname).toBe("/app/exam/");
    expect(harness.getState().testSessionAnswers[first.globalIndex]).toBe(1);
    await traverse("back");
    await harness.flush();
    app.runtime.dispatch([
      appIds.events.testSessionFinished,
      "time-expired",
      testSessionEndsAt!,
    ]);
    await harness.flush();
    expect(window.location.href).toBe(practiceUrl);
    expect(harness.getState()).toMatchObject({
      navigationCurrentQuestionIndex: 3,
      navigationExamSetupVisible: false,
      testSessionStatus: "idle",
      testSessionEndsAt: null,
      testSessionQuestions: [],
      testSessionAnswers: {},
      practiceUserAnswers: { 4: 0 },
      practiceMistakes: {},
    });
    await traverse("forward");
    await harness.flush();
    expect(harness.getState().navigationExamSetupVisible).toBe(true);
    expect(harness.getState().testSessionStatus).toBe("idle");
    expect(window.location.pathname).toBe("/app/exam/");
  });

  it("keeps the result, review and retake in one exam history entry", async () => {
    const { app, harness } = await boot("/app/exam/?lang=en#main-content");
    const url = window.location.href;
    const length = window.history.length;
    app.runtime.dispatch([appIds.events.preferencesLandSelected, "Berlin"]);
    app.runtime.dispatch([appIds.events.testSessionStarted]);
    await harness.flush();
    const [first] = harness.getState().testSessionQuestions;
    app.runtime.dispatch([
      appIds.events.testSessionAnswerSelected,
      first.globalIndex,
      1,
    ]);
    app.runtime.dispatch([appIds.events.testSessionFinished, "finished"]);
    await harness.flush();
    expect(harness.getState().testSessionStatus).toBe("completed");
    expect(window.location.href).toBe(url);
    app.runtime.dispatch([appIds.events.testSessionReviewOpened, "incorrect"]);
    app.runtime.dispatch([
      appIds.events.testSessionReviewFilterSelected,
      "unanswered",
    ]);
    app.runtime.dispatch([appIds.events.testSessionReviewStepped, 1]);
    await harness.flush();
    expect(harness.getState().testSessionReviewVisible).toBe(true);
    expect(harness.getState().testSessionReviewFilter).toBe("unanswered");
    expect(window.location.href).toBe(url);
    app.runtime.dispatch([appIds.events.testSessionReviewClosed]);
    app.runtime.dispatch([appIds.events.testSessionStarted]);
    await harness.flush();
    expect(harness.getState()).toMatchObject({
      testSessionStatus: "in-progress",
      testSessionReviewVisible: false,
      testSessionAnswers: {},
      practiceMistakes: { [first.globalIndex]: [1] },
    });
    expect(window.location.href).toBe(url);
    expect(window.history.length).toBe(length);
  });

  it("discards the exam when the browser caches the document on departure", async () => {
    const { app, harness } = await boot("/app/exam/");
    app.runtime.dispatch([appIds.events.preferencesLandSelected, "Berlin"]);
    app.runtime.dispatch([appIds.events.testSessionStarted]);
    await harness.flush();
    window.dispatchEvent(
      new PageTransitionEvent("pagehide", { persisted: true }),
    );
    await harness.flush();
    expect(harness.getState()).toMatchObject({
      navigationExamSetupVisible: true,
      testSessionStatus: "idle",
      testSessionEndsAt: null,
    });
  });

  it("falls back from invalid filters and preserves referral parameters", async () => {
    const { harness } = await boot(
      "/app/practice/?category=missing&question=99999&lang=invalid&utm_source=catalogue",
    );
    expect(harness.getState().navigationSelectedCategory).toBeNull();
    expect(harness.getState().navigationCurrentQuestionIndex).toBe(0);
    expect(new URLSearchParams(window.location.search).get("utm_source")).toBe(
      "catalogue",
    );
    expect(window.location.search).not.toContain("missing");
    expect(window.location.search).not.toContain("99999");
  });

  it("removes the browser listener on disposal", async () => {
    const added = vi.spyOn(window, "addEventListener");
    const removed = vi.spyOn(window, "removeEventListener");
    const { app } = await boot("/app/");
    const listener = added.mock.calls.find(
      ([name]) => name === "popstate",
    )?.[1];
    expect(listener).toBeDefined();
    await app.dispose();
    apps.splice(apps.indexOf(app), 1);
    expect(removed).toHaveBeenCalledWith("popstate", listener);
  });

  it("keeps the current question URL in sync when review lists shrink", async () => {
    const { app, harness } = await boot("/app/");
    app.runtime.dispatch([appIds.events.practiceFavoriteToggled, 1]);
    app.runtime.dispatch([appIds.events.practiceFavoriteToggled, 2]);
    app.runtime.dispatch([
      appIds.events.navigationCategorySelected,
      "favorites",
    ]);
    await harness.flush();
    expect(new URLSearchParams(window.location.search).get("question")).toBe(
      "1",
    );
    app.runtime.dispatch([appIds.events.practiceFavoriteToggled, 1]);
    await harness.flush();
    expect(new URLSearchParams(window.location.search).get("question")).toBe(
      "2",
    );
    app.runtime.dispatch([appIds.events.practiceFavoriteToggled, 2]);
    await harness.flush();
    expect(window.location.search).not.toContain("question");
    expect(window.location.pathname).toBe("/app/favorites/");
    app.runtime.dispatch([appIds.events.practiceQuestionAnswered, 3, 1]);
    app.runtime.dispatch([appIds.events.navigationCategorySelected, "wrong"]);
    await harness.flush();
    expect(new URLSearchParams(window.location.search).get("question")).toBe(
      "3",
    );
    app.runtime.dispatch([appIds.events.practiceMistakeRemoved, 3]);
    await harness.flush();
    expect(window.location.pathname).toBe("/app/mistakes/");
    expect(window.location.search).not.toContain("question");
  });

  it("leaves skip-to-content history and scroll behavior intact", async () => {
    const { harness } = await boot("/app/practice/?question=4");
    vi.mocked(window.scrollTo).mockClear();
    window.history.pushState(null, "", `${window.location.href}#main-content`);
    window.dispatchEvent(new PopStateEvent("popstate"));
    await harness.flush();
    expect(window.location.hash).toBe("#main-content");
    expect(window.scrollTo).not.toHaveBeenCalled();
    expect(harness.getState().navigationCurrentQuestionIndex).toBe(3);
  });
});
