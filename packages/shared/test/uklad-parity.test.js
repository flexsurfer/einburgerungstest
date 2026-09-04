import { afterEach, describe, expect, it } from "vitest";
import { createUkladTestHarness } from "@ukladjs/core/testing";
import {
  appIds,
  createAppRuntime,
  registerAppModules,
  registerSharedModules,
  stateKeys,
} from "../src/app/uklad/index.ts";

const runtimes = [];

afterEach(() => {
  while (runtimes.length > 0) runtimes.pop().dispose();
});

const questions = [
  {
    question: "Who elects the Bundestag?",
    category: "Politik",
    correct: 0,
    answers: ["The people", "The courts"],
  },
  {
    question: "When was the Basic Law adopted?",
    category: "Geschichte",
    correct: 1,
    answers: ["1919", "1949"],
  },
  {
    question: "Which state is a Bundesland?",
    category: "Bayern",
    correct: 0,
    answers: ["Bayern", "Elsass"],
  },
];

function createFixture() {
  const runtime = createAppRuntime({
    runtimeId: `parity-${runtimes.length + 1}`,
  });
  runtimes.push(runtime);
  registerSharedModules(runtime);

  const effects = [];
  registerAppModules(runtime, [
    (registrar) => {
      for (const effectId of Object.values(appIds.effects)) {
        registrar.regEffect(effectId, (payload) => {
          effects.push([effectId, payload]);
        });
      }
    },
  ]);

  return { effects, harness: createUkladTestHarness(runtime) };
}

function loadQuestions(harness) {
  harness.dispatchSync([appIds.events.questionsFetchSucceeded, questions]);
}

describe("Uklad pure event/subscription parity", () => {
  it("preserves UI and preference transitions and their host intents", () => {
    const { effects, harness } = createFixture();

    harness.dispatchSync([appIds.events.uiShowAnswersToggled]);
    expect(harness.getState()[stateKeys.uiShowAnswers]).toBe(true);

    harness.dispatchSync([appIds.events.uiScrollToTop]);
    expect(effects.at(-1)).toEqual([
      appIds.effects.uiScrollToTop,
      { behavior: "auto" },
    ]);
    harness.dispatchSync([appIds.events.uiScrollToTop, "smooth"]);
    expect(effects.at(-1)).toEqual([
      appIds.effects.uiScrollToTop,
      { behavior: "smooth" },
    ]);
    harness.dispatchSync([appIds.events.uiBodyOverflowSet, "hidden"]);
    expect(effects.at(-1)).toEqual([
      appIds.effects.uiSetBodyOverflow,
      { value: "hidden" },
    ]);

    harness.dispatchSync([appIds.events.vocabularyToggled]);
    expect(harness.getState()[stateKeys.vocabularyVisible]).toBe(true);
    expect(harness.getState()[stateKeys.vocabularyRendered]).toBe(true);
    expect(effects.at(-1)).toEqual([
      appIds.effects.uiSetBodyOverflow,
      { value: "hidden" },
    ]);
    harness.dispatchSync([appIds.events.vocabularyToggled]);
    expect(harness.getState()[stateKeys.vocabularyVisible]).toBe(false);
    expect(harness.getState()[stateKeys.vocabularyRendered]).toBe(true);
    harness.dispatchSync([appIds.events.vocabularyUnmounted]);
    expect(harness.getState()[stateKeys.vocabularyRendered]).toBe(false);
    expect(effects.at(-1)).toEqual([
      appIds.effects.uiSetBodyOverflow,
      { value: "auto" },
    ]);

    harness.dispatchSync([appIds.events.preferencesLanguageSelected, "de"]);
    expect(harness.getState()[stateKeys.preferencesSelectedLanguage]).toBe(
      "de",
    );
    harness.dispatchSync([appIds.events.preferencesThemeToggled]);
    expect(harness.getState()[stateKeys.preferencesTheme]).toBe("dark");
    expect(harness.getState()[stateKeys.preferencesUseSystemTheme]).toBe(false);
    expect(effects.at(-1)).toEqual([
      appIds.effects.uiSetBodyTheme,
      { theme: "dark" },
    ]);

    // Manual theme mode ignores subsequent system notifications.
    harness.dispatchSync([
      appIds.events.preferencesSystemThemeChanged,
      "light",
    ]);
    expect(harness.getState()[stateKeys.preferencesTheme]).toBe("dark");

    // A fresh runtime still follows the system while that mode is enabled.
    const second = createFixture();
    second.harness.dispatchSync([
      appIds.events.preferencesSystemThemeChanged,
      null,
    ]);
    expect(second.harness.getState()[stateKeys.preferencesTheme]).toBe("light");
    expect(second.effects.at(-1)).toEqual([
      appIds.effects.uiSetBodyTheme,
      { theme: "light" },
    ]);
  });

  it("preserves question and vocabulary result state and category grouping", () => {
    const { effects, harness } = createFixture();

    harness.dispatchSync([appIds.events.questionsFetchRequested]);
    expect(harness.getState()[stateKeys.questionsLoading]).toBe(true);
    expect(harness.getState()[stateKeys.questionsError]).toBe(null);
    expect(effects.at(-1)).toEqual([
      appIds.effects.dataFetch,
      { dataType: "questions" },
    ]);

    loadQuestions(harness);
    expect(harness.getState()[stateKeys.questionsLoading]).toBe(false);
    expect(harness.getState()[stateKeys.questionsLoaded]).toBe(true);
    expect(harness.getState()[stateKeys.questionsError]).toBe(null);
    expect(harness.getState()[stateKeys.questionsItems]).toEqual(
      questions.map((question, index) => ({
        ...question,
        globalIndex: index + 1,
      })),
    );
    expect(harness.getState()[stateKeys.questionsCategories]).toEqual([
      {
        title: "Themes",
        items: [
          ["Geschichte", 1],
          ["Politik", 1],
        ],
      },
      { title: "Bundesländer", items: [["Bayern", 1]] },
    ]);

    harness.dispatchSync([appIds.events.questionsFetchFailed, "Network error"]);
    expect(harness.getState()[stateKeys.questionsLoading]).toBe(false);
    expect(harness.getState()[stateKeys.questionsError]).toBe("Network error");

    harness.dispatchSync([appIds.events.vocabularyFetchRequested]);
    expect(harness.getState()[stateKeys.vocabularyLoading]).toBe(true);
    expect(harness.getState()[stateKeys.vocabularyError]).toBe(null);
    expect(effects.at(-1)).toEqual([
      appIds.effects.dataFetch,
      { dataType: "vocabulary" },
    ]);
    const vocabulary = { terms: ["der Staat", "die Wahl"] };
    harness.dispatchSync([appIds.events.vocabularyFetchSucceeded, vocabulary]);
    expect(harness.getState()[stateKeys.vocabularyLoading]).toBe(false);
    expect(harness.getState()[stateKeys.vocabularyError]).toBe(null);
    expect(harness.getState()[stateKeys.vocabularyData]).toBe(vocabulary);
    harness.dispatchSync([
      appIds.events.vocabularyFetchFailed,
      "Vocabulary error",
    ]);
    expect(harness.getState()[stateKeys.vocabularyError]).toBe(
      "Vocabulary error",
    );
  });

  it("preserves answer, favorite, clear, and navigation event behavior", () => {
    const { effects, harness } = createFixture();
    loadQuestions(harness);

    harness.dispatchSync([appIds.events.navigationQuestionSelected, 2]);
    harness.dispatchSync([appIds.events.navigationQuestionPickerShown, true]);
    harness.dispatchSync([appIds.events.navigationCategorySelected, "Politik"]);
    expect(harness.getState()[stateKeys.navigationSelectedCategory]).toBe(
      "Politik",
    );
    expect(harness.getState()[stateKeys.navigationCurrentQuestionIndex]).toBe(
      0,
    );
    expect(harness.getState()[stateKeys.navigationQuestionPickerVisible]).toBe(
      false,
    );
    expect(effects.at(-1)).toEqual([
      appIds.effects.uiScrollToTop,
      { behavior: "auto" },
    ]);

    harness.dispatchSync([appIds.events.practiceQuestionAnswered, 1, 1]);
    expect(harness.getState()[stateKeys.practiceUserAnswers]).toEqual({
      1: 1,
    });
    expect(
      harness.getSubscriptionValue([
        appIds.subscriptions.practiceUserAnswerByQuestionIndex,
        1,
      ]),
    ).toBe(1);

    harness.dispatchSync([appIds.events.practiceFavoriteToggled, 1]);
    expect(harness.getState()[stateKeys.practiceFavorites]).toEqual([1]);
    harness.dispatchSync([
      appIds.events.navigationCategorySelected,
      "favorites",
    ]);
    harness.dispatchSync([appIds.events.navigationQuestionSelected, 1]);
    harness.dispatchSync([appIds.events.practiceFavoriteToggled, 1]);
    expect(harness.getState()[stateKeys.practiceFavorites]).toEqual([]);
    expect(harness.getState()[stateKeys.navigationCurrentQuestionIndex]).toBe(
      0,
    );

    harness.dispatchSync([appIds.events.navigationCategorySelected, "wrong"]);
    harness.dispatchSync([appIds.events.navigationQuestionSelected, 1]);
    harness.dispatchSync([appIds.events.practiceMistakeRemoved, 1]);
    expect(harness.getState()[stateKeys.practiceUserAnswers]).toEqual({ 1: 1 });
    expect(harness.getState()[stateKeys.practiceMistakes]).toEqual({ 1: [] });
    expect(harness.getState()[stateKeys.navigationCurrentQuestionIndex]).toBe(
      0,
    );

    harness.dispatchSync([appIds.events.practiceQuestionAnswered, 2, 0]);
    harness.dispatchSync([appIds.events.practiceAnswersCleared]);
    expect(harness.getState()[stateKeys.practiceUserAnswers]).toEqual({});
    harness.dispatchSync([appIds.events.practiceClearAnswersRequested]);
    expect(effects.at(-1)).toEqual([
      appIds.effects.uiConfirmClear,
      { language: "en" },
    ]);

    harness.dispatchSync([appIds.events.navigationCategorySelected, null]);
    harness.dispatchSync([appIds.events.navigationQuestionSelected, 0]);
    harness.dispatchSync([appIds.events.navigationNext]);
    expect(harness.getState()[stateKeys.navigationCurrentQuestionIndex]).toBe(
      1,
    );
    harness.dispatchSync([appIds.events.navigationPrevious]);
    expect(harness.getState()[stateKeys.navigationCurrentQuestionIndex]).toBe(
      0,
    );
    harness.dispatchSync([appIds.events.navigationPrevious]);
    expect(harness.getState()[stateKeys.navigationCurrentQuestionIndex]).toBe(
      0,
    );
    harness.dispatchSync([appIds.events.navigationQuestionPickerShown, true]);
    expect(harness.getState()[stateKeys.navigationQuestionPickerVisible]).toBe(
      true,
    );
  });

  it("preserves all derived filtering, statistics, and picker values", () => {
    const { harness } = createFixture();
    loadQuestions(harness);

    expect(
      harness.getSubscriptionValue([
        appIds.subscriptions.practiceFilteredQuestions,
      ]),
    ).toHaveLength(2);
    expect(
      harness.getSubscriptionValue([
        appIds.subscriptions.navigationSelectedCategoryCount,
      ]),
    ).toBe(0);
    expect(
      harness.getSubscriptionValue([
        appIds.subscriptions.practiceFilteredQuestionsCount,
      ]),
    ).toBe(2);

    harness.dispatchSync([appIds.events.practiceQuestionAnswered, 1, 0]);
    harness.dispatchSync([appIds.events.practiceQuestionAnswered, 2, 0]);
    harness.dispatchSync([appIds.events.practiceFavoriteToggled, 1]);

    expect(
      harness.getSubscriptionValue([
        appIds.subscriptions.practiceFavoriteCount,
      ]),
    ).toBe(1);
    expect(
      harness.getSubscriptionValue([appIds.subscriptions.practiceWrongCount]),
    ).toBe(1);
    expect(
      harness.getSubscriptionValue([
        appIds.subscriptions.practiceIsFavoriteByGlobalIndex,
        1,
      ]),
    ).toBe(true);
    expect(
      harness.getSubscriptionValue([appIds.subscriptions.practiceStatistics]),
    ).toEqual({
      correct: 1,
      incorrect: 1,
      totalAnswered: 2,
      totalVisible: 2,
      accuracy: "50.0",
      passed: false,
    });

    harness.dispatchSync([
      appIds.events.navigationCategorySelected,
      "favorites",
    ]);
    expect(
      harness.getSubscriptionValue([
        appIds.subscriptions.practiceFilteredQuestions,
      ]),
    ).toEqual([{ ...questions[0], globalIndex: 1 }]);
    harness.dispatchSync([appIds.events.navigationCategorySelected, "wrong"]);
    expect(
      harness.getSubscriptionValue([
        appIds.subscriptions.practiceFilteredQuestions,
      ]),
    ).toEqual([{ ...questions[1], globalIndex: 2 }]);
    harness.dispatchSync([appIds.events.navigationCategorySelected, "Politik"]);
    expect(
      harness.getSubscriptionValue([
        appIds.subscriptions.navigationSelectedCategoryCount,
      ]),
    ).toBe(1);
    expect(
      harness.getSubscriptionValue([
        appIds.subscriptions.practiceFilteredQuestions,
      ]),
    ).toEqual([{ ...questions[0], globalIndex: 1 }]);
    expect(
      harness.getSubscriptionValue([appIds.subscriptions.navigationIsTestMode]),
    ).toBe(false);

    const pickerItems = harness.getSubscriptionValue([
      appIds.subscriptions.navigationQuestionPickerItems,
    ]);
    expect(pickerItems).toEqual([
      {
        key: 1,
        className: "question-picker-item selected correct",
        ariaLabel: "Question 1 (correct)",
        number: 1,
        isAnswered: true,
        indicatorClass: "answer-indicator correct",
        filteredIndex: 0,
        isSelected: true,
        isCorrect: true,
      },
    ]);

    harness.dispatchSync([appIds.events.navigationQuestionSelected, 99]);
    expect(
      harness.getSubscriptionValue([
        appIds.subscriptions.navigationCurrentQuestion,
      ]),
    ).toEqual({ ...questions[0], globalIndex: 1 });
  });

  it("keeps test-session answers separate and derives test-mode values", () => {
    const { harness } = createFixture();
    loadQuestions(harness);

    harness.dispatchSync([appIds.events.practiceQuestionAnswered, 1, 1]);
    harness.dispatchSync([appIds.events.navigationCategorySelected, "test"]);
    expect(
      harness.getSubscriptionValue([appIds.subscriptions.navigationIsTestMode]),
    ).toBe(true);
    expect(
      harness.getState()[stateKeys.testSessionQuestions].length,
    ).toBeGreaterThan(0);
    expect(harness.getState()[stateKeys.practiceUserAnswers]).toEqual({
      1: 1,
    });

    harness.dispatchSync([appIds.events.practiceQuestionAnswered, 1, 0]);
    expect(harness.getState()[stateKeys.testSessionAnswers]).toEqual({
      1: 0,
    });
    expect(
      harness.getSubscriptionValue([
        appIds.subscriptions.practiceUserAnswerByQuestionIndex,
        1,
      ]),
    ).toBe(0);
    expect(
      harness.getSubscriptionValue([appIds.subscriptions.practiceStatistics]),
    ).toMatchObject({ totalAnswered: 1, correct: 1, incorrect: 0 });

    harness.dispatchSync([appIds.events.practiceQuestionAnswerCleared, 1]);
    expect(harness.getState()[stateKeys.testSessionAnswers]).toEqual({});
    expect(harness.getState()[stateKeys.practiceUserAnswers]).toEqual({
      1: 1,
    });
  });
});
