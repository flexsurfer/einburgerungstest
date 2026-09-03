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

function createDomainHarness() {
  const runtime = createAppRuntime({
    runtimeId: `domain-${runtimes.length + 1}`,
  });
  runtimes.push(runtime);
  registerSharedModules(runtime);

  const effects = [];
  registerAppModules(runtime, [
    (registrar) => {
      for (const effectId of [
        appIds.effects.dataFetch,
        appIds.effects.dataLoadLocal,
        appIds.effects.uiConfirmClear,
        appIds.effects.uiScrollToTop,
        appIds.effects.uiSetBodyOverflow,
        appIds.effects.uiSetBodyTheme,
      ]) {
        registrar.regEffect(effectId, (payload) => {
          effects.push([effectId, payload]);
        });
      }
    },
  ]);

  return {
    effects,
    harness: createUkladTestHarness(runtime),
  };
}

function loadQuestions(harness) {
  harness.dispatchSync([appIds.events.questionsFetchSucceeded, questions]);
}

describe("Uklad shared domain graph", () => {
  it("registers feature roots and translates UI/preferences intent into state and effects", () => {
    const { effects, harness } = createDomainHarness();

    harness.dispatchSync([appIds.events.uiShowAnswersToggled]);
    expect(
      harness.getSubscriptionValue([appIds.subscriptions.uiShowAnswers]),
    ).toBe(true);

    harness.dispatchSync([appIds.events.vocabularyToggled]);
    expect(
      harness.getSubscriptionValue([appIds.subscriptions.vocabularyVisible]),
    ).toBe(true);
    expect(
      harness.getSubscriptionValue([appIds.subscriptions.vocabularyRendered]),
    ).toBe(true);
    expect(effects.at(-1)).toEqual([
      appIds.effects.uiSetBodyOverflow,
      { value: "hidden" },
    ]);

    harness.dispatchSync([appIds.events.vocabularyUnmounted]);
    expect(
      harness.getSubscriptionValue([appIds.subscriptions.vocabularyRendered]),
    ).toBe(false);
    expect(effects.at(-1)).toEqual([
      appIds.effects.uiSetBodyOverflow,
      { value: "auto" },
    ]);

    harness.dispatchSync([appIds.events.preferencesLanguageSelected, "de"]);
    harness.dispatchSync([appIds.events.preferencesThemeToggled]);
    expect(
      harness.getSubscriptionValue([
        appIds.subscriptions.preferencesSelectedLanguage,
      ]),
    ).toBe("de");
    expect(
      harness.getSubscriptionValue([appIds.subscriptions.preferencesTheme]),
    ).toBe("dark");
    expect(effects.at(-1)).toEqual([
      appIds.effects.uiSetBodyTheme,
      { theme: "dark" },
    ]);

    harness.dispatchSync([
      appIds.events.preferencesSystemThemeChanged,
      "light",
    ]);
    expect(
      harness.getSubscriptionValue([appIds.subscriptions.preferencesTheme]),
    ).toBe("dark");
  });

  it("models the questions request/result lifecycle and category grouping", () => {
    const { effects, harness } = createDomainHarness();

    harness.dispatchSync([appIds.events.questionsFetchRequested]);
    expect(
      harness.getSubscriptionValue([appIds.subscriptions.questionsLoading]),
    ).toBe(true);
    expect(effects.at(-1)).toEqual([
      appIds.effects.dataFetch,
      { dataType: "questions" },
    ]);

    loadQuestions(harness);
    expect(
      harness.getSubscriptionValue([appIds.subscriptions.questionsLoading]),
    ).toBe(false);
    expect(
      harness.getSubscriptionValue([appIds.subscriptions.questionsLoaded]),
    ).toBe(true);
    expect(
      harness.getSubscriptionValue([appIds.subscriptions.questionsItems]),
    ).toEqual(
      questions.map((question, index) => ({
        ...question,
        globalIndex: index + 1,
      })),
    );
    expect(
      harness.getSubscriptionValue([appIds.subscriptions.questionsCategories]),
    ).toEqual([
      {
        title: "Themes",
        items: [
          ["Geschichte", 1],
          ["Politik", 1],
        ],
      },
      { title: "Bundesländer", items: [["Bayern", 1]] },
    ]);

    harness.dispatchSync([appIds.events.vocabularyFetchRequested]);
    expect(
      harness.getSubscriptionValue([appIds.subscriptions.vocabularyLoading]),
    ).toBe(true);
    expect(effects.at(-1)).toEqual([
      appIds.effects.dataFetch,
      { dataType: "vocabulary" },
    ]);

    harness.dispatchSync([
      appIds.events.vocabularyFetchSucceeded,
      { terms: ["der Staat", "die Wahl"] },
    ]);
    expect(
      harness.getSubscriptionValue([appIds.subscriptions.vocabularyData]),
    ).toEqual({ terms: ["der Staat", "die Wahl"] });

    harness.dispatchSync([appIds.events.questionsFetchFailed, "Network error"]);
    expect(
      harness.getSubscriptionValue([appIds.subscriptions.questionsError]),
    ).toBe("Network error");
  });

  it("keeps the cross-feature practice and navigation graph derived", () => {
    const { harness } = createDomainHarness();
    loadQuestions(harness);

    harness.dispatchSync([appIds.events.navigationCategorySelected, "Politik"]);
    expect(
      harness.getSubscriptionValue([
        appIds.subscriptions.navigationSelectedCategory,
      ]),
    ).toBe("Politik");
    expect(
      harness.getSubscriptionValue([
        appIds.subscriptions.navigationSelectedCategoryCount,
      ]),
    ).toBe(1);
    expect(
      harness.getSubscriptionValue([
        appIds.subscriptions.practiceFilteredQuestions,
      ]),
    ).toHaveLength(1);

    harness.dispatchSync([appIds.events.practiceQuestionAnswered, 1, 1]);
    harness.dispatchSync([appIds.events.practiceFavoriteToggled, 1]);

    expect(
      harness.getSubscriptionValue([
        appIds.subscriptions.practiceUserAnswerByQuestionIndex,
        1,
      ]),
    ).toBe(1);
    expect(
      harness.getSubscriptionValue([
        appIds.subscriptions.practiceIsFavoriteByGlobalIndex,
        1,
      ]),
    ).toBe(true);
    expect(
      harness.getSubscriptionValue([
        appIds.subscriptions.practiceFavoriteCount,
      ]),
    ).toBe(1);
    expect(
      harness.getSubscriptionValue([appIds.subscriptions.practiceWrongCount]),
    ).toBe(1);
    expect(
      harness.getSubscriptionValue([appIds.subscriptions.practiceOverview]),
    ).toEqual({
      correct: 0,
      incorrect: 1,
      totalAnswered: 1,
      totalQuestions: 2,
      remaining: 1,
      accuracy: 0,
      progress: 50,
    });
    expect(
      harness.getSubscriptionValue([
        appIds.subscriptions.practiceCategoryProgress,
      ]),
    ).toEqual({
      Bayern: { answered: 0, total: 1, progress: 0 },
      Geschichte: { answered: 0, total: 1, progress: 0 },
      Politik: { answered: 1, total: 1, progress: 100 },
    });
    expect(
      harness.getSubscriptionValue([appIds.subscriptions.practiceStatistics]),
    ).toEqual({
      correct: 0,
      incorrect: 1,
      totalAnswered: 1,
      totalVisible: 1,
      accuracy: "0.0",
      passed: false,
    });
    expect(
      harness.getSubscriptionValue([
        appIds.subscriptions.navigationQuestionPickerItems,
      ]),
    ).toEqual([
      {
        key: 1,
        className: "question-picker-item selected incorrect",
        ariaLabel: "Question 1 (incorrect)",
        number: 1,
        isAnswered: true,
        indicatorClass: "answer-indicator incorrect",
        filteredIndex: 0,
        isSelected: true,
        isCorrect: false,
      },
    ]);

    harness.dispatchSync([
      appIds.events.navigationCategorySelected,
      "favorites",
    ]);
    expect(
      harness.getSubscriptionValue([
        appIds.subscriptions.practiceFilteredQuestions,
      ]),
    ).toHaveLength(1);
    expect(
      harness.getSubscriptionValue([
        appIds.subscriptions.navigationCurrentQuestion,
      ]),
    ).toMatchObject({ globalIndex: 1 });

    harness.dispatchSync([appIds.events.practiceFavoriteToggled, 1]);
    expect(
      harness.getSubscriptionValue([
        appIds.subscriptions.practiceFilteredQuestionsCount,
      ]),
    ).toBe(0);
  });

  it("stores every wrong practice attempt separately until it is removed", () => {
    const { harness } = createDomainHarness();
    harness.dispatchSync([
      appIds.events.questionsFetchSucceeded,
      [
        {
          question: "Choose A",
          category: "Politik",
          correct: 0,
          answers: ["A", "B", "C"],
        },
      ],
    ]);

    harness.dispatchSync([appIds.events.practiceQuestionAnswered, 1, 1]);
    harness.dispatchSync([appIds.events.practiceQuestionAnswerCleared, 1]);
    harness.dispatchSync([appIds.events.practiceQuestionAnswered, 1, 2]);
    harness.dispatchSync([appIds.events.practiceQuestionAnswerCleared, 1]);
    harness.dispatchSync([appIds.events.practiceQuestionAnswered, 1, 1]);

    expect(harness.getState()[stateKeys.practiceUserAnswers]).toEqual({ 1: 1 });
    expect(harness.getState()[stateKeys.practiceMistakes]).toEqual({
      1: [1, 2, 1],
    });
    expect(
      harness.getSubscriptionValue([
        appIds.subscriptions.practiceMistakeSummaryByQuestionIndex,
        1,
      ]),
    ).toEqual({ totalAttempts: 3, answerCounts: { 1: 2, 2: 1 } });
    // Clearing only the latest answer keeps the durable mistake history.
    harness.dispatchSync([appIds.events.practiceQuestionAnswerCleared, 1]);
    expect(harness.getState()[stateKeys.practiceUserAnswers]).toEqual({});
    expect(harness.getState()[stateKeys.practiceMistakes]).toEqual({
      1: [1, 2, 1],
    });
    expect(
      harness.getSubscriptionValue([appIds.subscriptions.practiceWrongCount]),
    ).toBe(1);
    expect(
      harness.getSubscriptionValue([
        appIds.subscriptions.practiceMistakeSummaryByQuestionIndex,
        1,
      ]),
    ).toEqual({ totalAttempts: 3, answerCounts: { 1: 2, 2: 1 } });

    // A correct retry does not erase or add to the mistake history.
    harness.dispatchSync([appIds.events.practiceQuestionAnswered, 1, 0]);
    expect(harness.getState()[stateKeys.practiceMistakes]).toEqual({
      1: [1, 2, 1],
    });
    harness.dispatchSync([appIds.events.practiceQuestionAnswerCleared, 1]);
    harness.dispatchSync([appIds.events.practiceQuestionAnswered, 1, 2]);
    harness.dispatchSync([appIds.events.navigationCategorySelected, "wrong"]);
    expect(
      harness.getSubscriptionValue([
        appIds.subscriptions.navigationQuestionPickerItems,
      ])[0],
    ).toMatchObject({ isAnswered: true, isCorrect: false });

    harness.dispatchSync([appIds.events.practiceMistakeRemoved, 1]);
    expect(harness.getState()[stateKeys.practiceUserAnswers]).toEqual({ 1: 2 });
    expect(harness.getState()[stateKeys.practiceMistakes]).toEqual({ 1: [] });
    expect(
      harness.getSubscriptionValue([appIds.subscriptions.practiceWrongCount]),
    ).toBe(0);

    harness.dispatchSync([appIds.events.practiceQuestionAnswerCleared, 1]);
    expect(harness.getState()[stateKeys.practiceUserAnswers]).toEqual({});
    expect(harness.getState()[stateKeys.practiceMistakes]).toEqual({ 1: [] });
  });

  it("migrates legacy wrong answers once the question catalog is loaded", () => {
    const { harness } = createDomainHarness();

    // These answers simulate hydrated data from before mistake history existed.
    harness.dispatchSync([appIds.events.practiceQuestionAnswered, 1, 1]);
    harness.dispatchSync([appIds.events.practiceQuestionAnswered, 2, 1]);
    harness.dispatchSync([appIds.events.practiceQuestionAnswered, 3, 1]);
    harness.dispatchSync([appIds.events.practiceMistakeRemoved, 3]);

    expect(harness.getState()[stateKeys.practiceMistakes]).toEqual({ 3: [] });
    loadQuestions(harness);

    // Question 1 was wrong, question 2 was correct, and question 3 has an
    // explicit removal tombstone that the migration must preserve.
    expect(harness.getState()[stateKeys.practiceMistakes]).toEqual({
      1: [1],
      3: [],
    });
    expect(
      harness.getSubscriptionValue([appIds.subscriptions.practiceWrongCount]),
    ).toBe(1);

    harness.dispatchSync([appIds.events.practiceLegacyMistakesMigrated]);
    expect(harness.getState()[stateKeys.practiceMistakes]).toEqual({
      1: [1],
      3: [],
    });

    harness.dispatchSync([appIds.events.practiceQuestionAnswerCleared, 1]);
    expect(harness.getState()[stateKeys.practiceUserAnswers]).toEqual({
      2: 1,
      3: 1,
    });
    expect(harness.getState()[stateKeys.practiceMistakes]).toEqual({
      1: [1],
      3: [],
    });
  });

  it("clears a correct practice answer without creating a mistake", () => {
    const { harness } = createDomainHarness();
    loadQuestions(harness);

    harness.dispatchSync([appIds.events.practiceQuestionAnswered, 1, 0]);
    expect(harness.getState()[stateKeys.practiceMistakes]).toEqual({});
    harness.dispatchSync([appIds.events.practiceQuestionAnswerCleared, 1]);
    expect(harness.getState()[stateKeys.practiceUserAnswers]).toEqual({});
    expect(harness.getState()[stateKeys.practiceMistakes]).toEqual({});
  });

  it("isolates test answers and generates a test selection when test mode is selected", () => {
    const { harness } = createDomainHarness();
    loadQuestions(harness);

    harness.dispatchSync([appIds.events.navigationCategorySelected, "test"]);
    expect(
      harness.getSubscriptionValue([appIds.subscriptions.navigationIsTestMode]),
    ).toBe(true);
    expect(
      harness.getSubscriptionValue([appIds.subscriptions.testSessionQuestions]),
    ).toHaveLength(2);

    harness.dispatchSync([appIds.events.practiceQuestionAnswered, 1, 0]);
    expect(
      harness.getSubscriptionValue([appIds.subscriptions.testSessionAnswers]),
    ).toEqual({ 1: 0 });
    expect(
      harness.getSubscriptionValue([appIds.subscriptions.practiceUserAnswers]),
    ).toEqual({});
    expect(
      harness.getSubscriptionValue([appIds.subscriptions.practiceMistakes]),
    ).toEqual({});

    harness.dispatchSync([appIds.events.practiceQuestionAnswerCleared, 1]);
    expect(
      harness.getSubscriptionValue([appIds.subscriptions.testSessionAnswers]),
    ).toEqual({});
  });

  it("keeps navigation bounds, picker state, and clear-answer intent in the graph", () => {
    const { effects, harness } = createDomainHarness();
    loadQuestions(harness);

    expect(
      harness.getSubscriptionValue([
        appIds.subscriptions.navigationActiveScreen,
      ]),
    ).toBe("home");

    harness.dispatchSync([appIds.events.navigationCategorySelected, "Politik"]);
    expect(
      harness.getSubscriptionValue([
        appIds.subscriptions.navigationActiveScreen,
      ]),
    ).toBe("questions");

    harness.dispatchSync([appIds.events.navigationHomeOpened]);
    expect(
      harness.getSubscriptionValue([
        appIds.subscriptions.navigationActiveScreen,
      ]),
    ).toBe("home");
    expect(
      harness.getSubscriptionValue([
        appIds.subscriptions.navigationSelectedCategory,
      ]),
    ).toBe("Politik");

    harness.dispatchSync([appIds.events.navigationPracticeResumed]);
    expect(
      harness.getSubscriptionValue([
        appIds.subscriptions.navigationActiveScreen,
      ]),
    ).toBe("questions");
    expect(
      harness.getSubscriptionValue([
        appIds.subscriptions.navigationSelectedCategory,
      ]),
    ).toBe(null);

    harness.dispatchSync([appIds.events.navigationQuestionSelected, 2]);
    expect(
      harness.getSubscriptionValue([
        appIds.subscriptions.navigationCurrentQuestionIndex,
      ]),
    ).toBe(1);
    expect(
      harness.getSubscriptionValue([
        appIds.subscriptions.navigationQuestionPickerVisible,
      ]),
    ).toBe(false);

    harness.dispatchSync([appIds.events.navigationNext]);
    expect(
      harness.getSubscriptionValue([
        appIds.subscriptions.navigationCurrentQuestionIndex,
      ]),
    ).toBe(1);
    harness.dispatchSync([appIds.events.navigationPrevious]);
    expect(
      harness.getSubscriptionValue([
        appIds.subscriptions.navigationCurrentQuestionIndex,
      ]),
    ).toBe(0);
    harness.dispatchSync([appIds.events.navigationQuestionPickerShown, true]);
    expect(
      harness.getSubscriptionValue([
        appIds.subscriptions.navigationQuestionPickerVisible,
      ]),
    ).toBe(true);

    harness.dispatchSync([appIds.events.navigationCategorySelected, null]);
    harness.dispatchSync([appIds.events.practiceQuestionAnswered, 1, 0]);
    harness.dispatchSync([appIds.events.practiceAnswersCleared]);
    expect(
      harness.getSubscriptionValue([appIds.subscriptions.practiceUserAnswers]),
    ).toEqual({});

    harness.dispatchSync([appIds.events.practiceClearAnswersRequested]);
    expect(effects.at(-1)).toEqual([appIds.effects.uiConfirmClear, undefined]);
  });
});
