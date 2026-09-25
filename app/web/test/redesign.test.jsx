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
    await click(container.querySelectorAll(".main-nav .side-link")[3]);
    expect(container.textContent).toContain("Allgemeine Frage 1");
    await click(container.querySelectorAll(".main-nav .side-link")[4]);
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
});
