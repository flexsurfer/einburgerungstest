import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createUkladTestHarness } from "@ukladjs/core/testing";
import {
  appIds,
  createAppRuntime,
  registerSharedModules,
  UkladProvider,
} from "@ebtest/shared/uklad";
import { registerWebPlatform } from "../src/platform";
import App from "../src/App";

let runtime, harness, root, container;
const general = Array.from({ length: 30 }, (_, i) => ({
  question: `Allgemeine Frage ${i + 1}`,
  category: "Recht",
  correct: 1,
  answers: ["Falsch", "Richtig", "Auch falsch", "Noch falsch"],
  explanation: "Deutsche Erklärung",
  en: {
    question: `Translated question ${i + 1}`,
    answers: ["Wrong", "Right", "Also wrong", "Wrong again"],
    explanation: "English explanation",
  },
}));
const regional = Array.from({ length: 10 }, (_, i) => ({
  question: `Berlin Frage ${i + 1}`,
  category: "Berlin",
  correct: 1,
  answers: ["Falsch", "Richtig", "Auch falsch", "Noch falsch"],
  img: { url: "berlin_1", text: "Abbildung zur Landesfrage" },
  explanation: "Regionale Erklärung",
}));

beforeEach(async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("scrollTo", vi.fn());
  HTMLDialogElement.prototype.showModal = function () {
    this.open = true;
  };
  HTMLDialogElement.prototype.close = function () {
    this.open = false;
  };
  runtime = createAppRuntime();
  registerSharedModules(runtime);
  registerWebPlatform(runtime);
  harness = createUkladTestHarness(runtime);
  harness.dispatchSync([
    appIds.events.questionsFetchSucceeded,
    [...general, ...regional],
  ]);
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  await act(async () => {
    root.render(
      <UkladProvider runtime={runtime}>
        <App />
      </UkladProvider>,
    );
  });
});
afterEach(async () => {
  await act(async () => root?.unmount());
  runtime?.dispose();
  container?.remove();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  document.body.className = "";
  document.documentElement.dir = "ltr";
});
const button = (text) =>
  [...container.querySelectorAll("button")].find(
    (el) => el.textContent.trim() === text && !el.closest("dialog:not([open])"),
  );
const navigationButton = (text) =>
  [...container.querySelectorAll(".main-nav .side-link")].find(
    (el) => el.querySelector("span:not(.nav-count)")?.textContent.trim() === text,
  );
async function click(element) {
  expect(element).toBeTruthy();
  await act(async () => {
    element.click();
    await harness.flush();
  });
}
async function select(element, value) {
  await act(async () => {
    element.value = value;
    element.dispatchEvent(new Event("change", { bubbles: true }));
    await harness.flush();
  });
}

describe("web learning flows", () => {
  it("uses the shared study, practice, bookmark, mistake and resume state", async () => {
    expect(container.textContent).toContain("A little closer, every day.");
    await click(button("Study"));
    expect(container.textContent).toContain("Translated question 1");
    expect(container.textContent).toContain("English explanation");
    expect(container.querySelectorAll(".answer-button:disabled")).toHaveLength(
      4,
    );
    await click(button("PRACTICE"));
    expect(container.textContent).not.toContain("English explanation");
    await click(container.querySelector(".answer-button"));
    expect(container.querySelector(".answer-button.incorrect")).not.toBeNull();
    await click(container.querySelector('[aria-label="Bookmark question"]'));
    await click(button("Next"));
    expect(container.textContent).toContain("Allgemeine Frage 2");
    await click(button("Home"));
    expect(container.querySelector(".progress-ring").textContent).toContain(
      "1 / 30",
    );
    await click(button("Continue Practice"));
    expect(container.textContent).toContain("Allgemeine Frage 2");
    await click(navigationButton("Saved Questions"));
    expect(container.textContent).toContain("Allgemeine Frage 1");
    await click(navigationButton("Mistakes"));
    expect(container.textContent).toContain("Wrong attempts: 1");
    expect(container.querySelector(".answer-button.correct")).not.toBeNull();
  });

  it("selects a Land, runs a neutral timed exam and returns to the dashboard", async () => {
    await click(button("Start Exam"));
    const dialog = container.querySelector("dialog[open]");
    expect(dialog).not.toBeNull();
    expect(dialog.querySelector(".primary-button").disabled).toBe(true);
    await select(dialog.querySelector("select"), "Berlin");
    await click(dialog.querySelector(".primary-button"));
    const questions = harness.getSubscriptionValue([
      appIds.subscriptions.testSessionQuestions,
    ]);
    expect(questions).toHaveLength(33);
    expect(questions.filter((q) => q.category === "Berlin")).toHaveLength(3);
    expect(container.querySelector('[role="timer"]')).not.toBeNull();
    await click(container.querySelector(".answer-button"));
    expect(container.querySelector(".answer-button.selected")).not.toBeNull();
    expect(
      container.querySelector(
        ".answer-button.correct, .answer-button.incorrect",
      ),
    ).toBeNull();
    await click(container.querySelector(".finish-exam-button"));
    expect(container.textContent).toContain("Not passed yet");
    expect(container.querySelector('[role="timer"]')).toBeNull();
    await click(button("Back to home"));
    expect(container.textContent).toContain("A little closer, every day.");
    expect(container.querySelector(".progress-ring").textContent).toContain(
      "0 / 40",
    );
  });

  it("applies shared language and appearance preferences to the new screens", async () => {
    await click(button("Settings"));
    await click(button("Dark"));
    expect(document.body.classList.contains("dark")).toBe(true);
    await select(container.querySelector("#app-language"), "ar");
    expect(document.documentElement.dir).toBe("rtl");
    expect(container.querySelector("h1").textContent).toBe("الإعدادات");
  });

  it("reviews submitted choices, filters, explanations and bookmarks without changing the score", async () => {
    await click(button("Start Exam"));
    const dialog = container.querySelector("dialog[open]");
    await select(dialog.querySelector("select"), "Berlin");
    await click(dialog.querySelector(".primary-button"));
    await click(container.querySelectorAll(".answer-button")[0]);
    await click(button("Next"));
    await click(container.querySelectorAll(".answer-button")[1]);
    await click(container.querySelector(".finish-exam-button"));
    const submitted = harness.getSubscriptionValue([appIds.subscriptions.testSessionAnswers]);
    await click(button("Review answers"));
    expect(container.querySelector("h1").textContent).toBe("Answer review");
    expect(container.querySelector(".exam-review-question-meta").textContent).toContain("Question 1 of 33");
    expect(container.querySelector(".exam-review-answer.incorrect").textContent).toContain("Your answer");
    expect(container.querySelector(".exam-review-answer.correct").textContent).toContain("Correct answer");
    expect(container.querySelector(".exam-review-explanation").textContent).toContain("English explanation");
    expect(container.querySelectorAll(".exam-review-answer button")).toHaveLength(0);
    await click(container.querySelector('.exam-review-filters button:nth-child(2)'));
    expect(container.querySelectorAll(".exam-review-number")).toHaveLength(1);
    await click(container.querySelector('.exam-review-filters button:nth-child(1)'));
    await click(container.querySelector('[aria-label="Next question"]'));
    expect(container.querySelector(".exam-review-question-meta").textContent).toContain("Question 2 of 33");
    expect(container.querySelector(".exam-review-answer.correct").textContent).toContain("Your answer · Correct");
    expect(document.activeElement).toBe(container.querySelector(".exam-review-card h2"));
    await click(container.querySelector('[aria-label="Next question"]'));
    expect(container.textContent).toContain("You didn’t answer this question.");
    expect(container.querySelectorAll(".exam-review-answer.correct")).toHaveLength(1);
    expect(container.querySelectorAll(".exam-review-answer.incorrect")).toHaveLength(0);
    await click(container.querySelector('[aria-label="Bookmark question"]'));
    expect(harness.getSubscriptionValue([appIds.subscriptions.practiceFavoriteCount])).toBe(1);
    await click(container.querySelector('.exam-review-filters button:nth-child(3)'));
    expect(container.querySelectorAll(".exam-review-number")).toHaveLength(31);
    await click(container.querySelector('.exam-review-number:last-child'));
    expect(container.querySelector(".exam-review-question-meta").textContent).toContain("Question 33 of 33");
    expect(container.querySelector(".exam-review-image img").getAttribute("src")).toBe("/assets/img/berlin_1.png");
    expect(container.querySelector(".exam-review-explanation p").textContent).toBe("Regionale Erklärung");
    expect(container.querySelector(".exam-review-explanation p").lang).toBe("de");
    expect(container.querySelector(".exam-review-card").textContent).not.toContain("undefined");
    await click(container.querySelector(".exam-review-back"));
    expect(container.querySelector("h1").textContent).toBe("Not passed yet");
    expect(harness.getSubscriptionValue([appIds.subscriptions.testSessionAnswers])).toEqual(submitted);
    expect(harness.getSubscriptionValue([appIds.subscriptions.practiceUserAnswers])).toEqual({});
    expect(harness.getSubscriptionValue([appIds.subscriptions.practiceMistakes])).toEqual({ 1: [0] });
    await click(button("Review answers"));
    expect(container.querySelector(".exam-review-question-meta").textContent).toContain("Question 33 of 33");
    await click(container.querySelector(".exam-review-back"));
    expect(container.textContent).toContain("Incorrect answers have been added to Mistakes.");
    await click(button("Back to home"));
    await click(navigationButton("Mistakes"));
    expect(container.textContent).toContain("Allgemeine Frage 1");
    expect(container.textContent).toContain("Wrong attempts: 1");
    expect(container.querySelector(".answer-button.mistake").textContent).toContain("Falsch");
  });

  it("opens result filters directly and recovers from an empty review on a narrow screen", async () => {
    await act(async () => {
      window.innerWidth = 390;
      window.dispatchEvent(new Event("resize"));
      runtime.dispatch([appIds.events.preferencesLandSelected, "Berlin"]);
      runtime.dispatch([appIds.events.testSessionStarted]);
      runtime.dispatch([appIds.events.testSessionFinished, "time-expired"]);
      await harness.flush();
    });
    expect(container.textContent).toContain("Time is up.");
    await click(container.querySelector('.exam-result-stat.incorrect'));
    expect(container.textContent).toContain("No incorrect answers");
    expect(container.querySelector(".exam-review-navigation")).toBeNull();
    await click(button("All questions"));
    expect(container.querySelector(".exam-review-overview").open).toBe(false);
    await click(container.querySelector(".exam-review-overview summary"));
    expect(container.querySelector(".exam-review-overview").open).toBe(true);
    await click(container.querySelectorAll(".exam-review-number")[4]);
    expect(container.querySelector(".exam-review-overview").open).toBe(false);
    expect(container.querySelector(".exam-review-question-meta").textContent).toContain("Question 5 of 33");
    await click(container.querySelector(".exam-review-back"));
    await click(button("Take another exam"));
    expect(container.querySelector('[role="timer"]')).not.toBeNull();
    expect(container.querySelector(".exam-review-card")).toBeNull();
    expect(harness.getSubscriptionValue([appIds.subscriptions.testSessionAnswers])).toEqual({});
    window.innerWidth = 1024;
  });

  it("localizes the review while keeping German exam content left-to-right", async () => {
    await act(async () => {
      runtime.dispatch([appIds.events.preferencesLandSelected, "Berlin"]);
      runtime.dispatch([appIds.events.testSessionStarted]);
      runtime.dispatch([appIds.events.testSessionFinished, "finished"]);
      runtime.dispatch([appIds.events.testSessionReviewOpened]);
      runtime.dispatch([appIds.events.preferencesLanguageSelected, "ar"]);
      await harness.flush();
    });
    expect(document.documentElement.dir).toBe("rtl");
    expect(container.querySelector("h1").textContent).toBe("مراجعة الإجابات");
    expect(container.querySelector(".exam-review-card h2").dir).toBe("ltr");
    expect(container.querySelector(".exam-review-answer p").lang).toBe("de");
    expect(container.querySelector(".exam-review-explanation p").dir).toBe("ltr");
    expect(container.querySelector(".exam-review-explanation p").textContent).toBe("Deutsche Erklärung");
  });
});
