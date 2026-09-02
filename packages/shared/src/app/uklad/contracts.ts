import type { UkladContracts } from "@ukladjs/core/vanilla";
import { appIds, stateKeys } from "./catalog.js";

export type Theme = "light" | "dark";
export type ThemePreference = Theme | "system";
export type ColorScheme = Theme | null;
export type ScrollMode = "auto" | "smooth";
export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";
export type DataKind = "questions" | "vocabulary";
export type CategorySelection = string | null;
export type NavigationScreen = "settings" | "home" | "questions";
export type AppError = string | null;

export const FEDERAL_LANDS = [
  "Baden-Württemberg",
  "Bayern",
  "Berlin",
  "Brandenburg",
  "Bremen",
  "Hamburg",
  "Hessen",
  "Mecklenburg-Vorpommern",
  "Niedersachsen",
  "Nordrhein-Westfalen",
  "Rheinland-Pfalz",
  "Saarland",
  "Sachsen",
  "Sachsen-Anhalt",
  "Schleswig-Holstein",
  "Thüringen",
] as const;

export type FederalLand = (typeof FEDERAL_LANDS)[number];

export interface QuestionImage {
  url: string;
  text?: string;
}

export interface QuestionInput {
  id?: number;
  question: string;
  category: string;
  correct: number;
  answers: string[];
  img?: QuestionImage;
}

export interface Question extends QuestionInput {
  globalIndex: number;
}

export type UserAnswers = Record<number, number>;
export type Favorites = number[];
export type TestUsedQuestions = Record<string, Record<string, boolean>>;
export type TestSessionStatus = "idle" | "in-progress" | "completed";
export type TestSessionFinishReason = "finished" | "time-expired";
export type VocabularyData = Record<string, unknown>;

export interface TestSessionResult {
  correct: number;
  incorrect: number;
  unanswered: number;
  answered: number;
  total: number;
  requiredCorrect: number;
  passed: boolean;
}

export interface CategoryGroup {
  title: string;
  items: Array<[category: string, count: number]>;
}

export interface Statistics {
  correct: number;
  incorrect: number;
  totalAnswered: number;
  totalVisible: number;
  accuracy: string | number;
  passed: boolean;
}

export interface PracticeOverview {
  correct: number;
  incorrect: number;
  totalAnswered: number;
  totalQuestions: number;
  remaining: number;
  accuracy: number;
  progress: number;
}

export interface CategoryProgress {
  answered: number;
  total: number;
  progress: number;
}

export type PracticeCategoryProgress = Record<string, CategoryProgress>;

export interface QuestionPickerItem {
  key: number;
  className: string;
  ariaLabel: string;
  number: number;
  isAnswered: boolean;
  indicatorClass: string;
  filteredIndex: number;
  isSelected: boolean;
  isCorrect: boolean;
}

export interface AppContracts extends UkladContracts {
  readonly state: {
    [stateKeys.uiShowAnswers]: boolean;

    [stateKeys.preferencesSelectedLanguage]: string;
    [stateKeys.preferencesSelectedLand]: FederalLand | null;
    [stateKeys.preferencesTheme]: Theme;
    [stateKeys.preferencesUseSystemTheme]: boolean;

    [stateKeys.vocabularyData]: VocabularyData | null;
    [stateKeys.vocabularyLoading]: boolean;
    [stateKeys.vocabularyError]: AppError;
    [stateKeys.vocabularyVisible]: boolean;
    [stateKeys.vocabularyRendered]: boolean;

    [stateKeys.questionsItems]: Question[];
    [stateKeys.questionsCategories]: CategoryGroup[];
    [stateKeys.questionsLoading]: boolean;
    [stateKeys.questionsLoaded]: boolean;
    [stateKeys.questionsError]: AppError;

    [stateKeys.practiceUserAnswers]: UserAnswers;
    [stateKeys.practiceFavorites]: Favorites;
    [stateKeys.practiceGlobalIndex]: number | null;
    [stateKeys.practiceLearnGlobalIndex]: number | null;

    [stateKeys.testSessionQuestions]: Question[];
    [stateKeys.testSessionAnswers]: UserAnswers;
    [stateKeys.testSessionUsedQuestions]: TestUsedQuestions;
    [stateKeys.testSessionStatus]: TestSessionStatus;
    [stateKeys.testSessionEndsAt]: number | null;
    [stateKeys.testSessionFinishReason]: TestSessionFinishReason | null;

    [stateKeys.navigationSelectedCategory]: CategorySelection;
    [stateKeys.navigationCurrentQuestionIndex]: number;
    [stateKeys.navigationQuestionPickerVisible]: boolean;
    [stateKeys.navigationActiveScreen]: NavigationScreen;
    [stateKeys.navigationIsLearnMode]: boolean;
  };

  readonly events: {
    [appIds.events.appInitialize]: [];

    [appIds.events.uiShowAnswersToggled]: [];
    [appIds.events.vocabularyToggled]: [];
    [appIds.events.vocabularyUnmounted]: [];
    [appIds.events.navigationCategorySelected]: [category: CategorySelection];
    [appIds.events.navigationLearnOpened]: [];
    [appIds.events.navigationHomeOpened]: [];
    [appIds.events.navigationSettingsOpened]: [];
    [appIds.events.navigationPracticeResumed]: [];
    [appIds.events.preferencesLanguageSelected]: [language: string];
    [appIds.events.preferencesLandSelected]: [land: FederalLand];
    [appIds.events.preferencesThemeSelected]: [theme: ThemePreference];
    [appIds.events.preferencesThemeToggled]: [];
    [appIds.events.uiScrollToTop]: [behavior?: ScrollMode];
    [appIds.events.uiBodyOverflowSet]: [value: string];

    [appIds.events.questionsFetchRequested]: [];
    [appIds.events.questionsFetchSucceeded]: [questions: QuestionInput[]];
    [appIds.events.questionsFetchFailed]: [error: AppError];
    [appIds.events.vocabularyFetchRequested]: [];
    [appIds.events.vocabularyFetchSucceeded]: [data: VocabularyData];
    [appIds.events.vocabularyFetchFailed]: [error: AppError];

    [appIds.events.practiceQuestionAnswered]: [
      questionIndex: number,
      answerIndex: number,
    ];
    [appIds.events.practiceFavoriteToggled]: [questionIndex: number];
    [appIds.events.practiceAnswersCleared]: [];
    [appIds.events.practiceClearAnswersRequested]: [];
    [appIds.events.preferencesSystemThemeChanged]: [scheme: ColorScheme];
    [appIds.events.practiceQuestionAnswerCleared]: [questionIndex: number];

    [appIds.events.testSessionStarted]: [];
    [appIds.events.testSessionAnswerSelected]: [
      questionIndex: number,
      answerIndex: number,
    ];
    [appIds.events.testSessionFinished]: [reason: TestSessionFinishReason];

    [appIds.events.navigationQuestionSelected]: [questionIndex: number];
    [appIds.events.navigationNext]: [];
    [appIds.events.navigationPrevious]: [];
    [appIds.events.navigationQuestionPickerShown]: [show: boolean];
  };

  readonly effects: {
    [appIds.effects.dataFetch]: {
      dataType: DataKind;
      url?: string;
      method?: HttpMethod;
    };
    [appIds.effects.dataLoadLocal]: { dataType: DataKind };
    [appIds.effects.uiScrollToTop]: { behavior?: ScrollMode };
    [appIds.effects.uiConfirmClear]: void;
    [appIds.effects.uiSetBodyTheme]: { theme: Theme };
    [appIds.effects.uiSetBodyOverflow]: { value: string };
  };

  readonly coeffects: {
    [appIds.coeffects.systemColorScheme]: { arg: void; value: ColorScheme };
    [appIds.coeffects.systemRandom]: { arg: void; value: () => number };
    [appIds.coeffects.systemNow]: { arg: void; value: number };
  };

  readonly subscriptions: {
    [appIds.subscriptions.uiShowAnswers]: { params: []; result: boolean };

    [appIds.subscriptions.navigationSelectedCategory]: {
      params: [];
      result: CategorySelection;
    };
    [appIds.subscriptions.navigationCurrentQuestionIndex]: {
      params: [];
      result: number;
    };
    [appIds.subscriptions.navigationQuestionPickerVisible]: {
      params: [];
      result: boolean;
    };
    [appIds.subscriptions.navigationActiveScreen]: {
      params: [];
      result: NavigationScreen;
    };

    [appIds.subscriptions.questionsItems]: { params: []; result: Question[] };
    [appIds.subscriptions.questionsLoaded]: { params: []; result: boolean };
    [appIds.subscriptions.questionsLoading]: { params: []; result: boolean };
    [appIds.subscriptions.questionsCategories]: {
      params: [];
      result: CategoryGroup[];
    };
    [appIds.subscriptions.questionsError]: { params: []; result: AppError };

    [appIds.subscriptions.vocabularyData]: {
      params: [];
      result: VocabularyData | null;
    };
    [appIds.subscriptions.vocabularyLoading]: { params: []; result: boolean };
    [appIds.subscriptions.vocabularyError]: { params: []; result: AppError };
    [appIds.subscriptions.vocabularyVisible]: { params: []; result: boolean };
    [appIds.subscriptions.vocabularyRendered]: { params: []; result: boolean };

    [appIds.subscriptions.preferencesSelectedLanguage]: {
      params: [];
      result: string;
    };
    [appIds.subscriptions.preferencesSelectedLand]: {
      params: [];
      result: FederalLand | null;
    };
    [appIds.subscriptions.preferencesTheme]: { params: []; result: Theme };
    [appIds.subscriptions.preferencesUseSystemTheme]: {
      params: [];
      result: boolean;
    };
    [appIds.subscriptions.preferencesThemeSelection]: {
      params: [];
      result: ThemePreference;
    };

    [appIds.subscriptions.practiceUserAnswers]: {
      params: [];
      result: UserAnswers;
    };
    [appIds.subscriptions.practiceFavorites]: { params: []; result: Favorites };
    [appIds.subscriptions.practiceGlobalIndex]: {
      params: [];
      result: number | null;
    };
    [appIds.subscriptions.practiceLearnGlobalIndex]: {
      params: [];
      result: number | null;
    };
    [appIds.subscriptions.testSessionQuestions]: {
      params: [];
      result: Question[];
    };
    [appIds.subscriptions.testSessionAnswers]: {
      params: [];
      result: UserAnswers;
    };
    [appIds.subscriptions.testSessionStatus]: {
      params: [];
      result: TestSessionStatus;
    };
    [appIds.subscriptions.testSessionEndsAt]: {
      params: [];
      result: number | null;
    };
    [appIds.subscriptions.testSessionFinishReason]: {
      params: [];
      result: TestSessionFinishReason | null;
    };
    [appIds.subscriptions.testSessionResult]: {
      params: [];
      result: TestSessionResult;
    };

    [appIds.subscriptions.practiceFavoriteCount]: {
      params: [];
      result: number;
    };
    [appIds.subscriptions.practiceWrongCount]: { params: []; result: number };
    [appIds.subscriptions.practiceFilteredQuestions]: {
      params: [];
      result: Question[];
    };
    [appIds.subscriptions.practiceFilteredQuestionsCount]: {
      params: [];
      result: number;
    };
    [appIds.subscriptions.practiceUserAnswerByQuestionIndex]: {
      params: [questionIndex: number];
      result: number | undefined;
    };
    [appIds.subscriptions.practiceIsFavoriteByGlobalIndex]: {
      params: [globalIndex: number];
      result: boolean;
    };
    [appIds.subscriptions.practiceStatistics]: {
      params: [];
      result: Statistics;
    };
    [appIds.subscriptions.practiceOverview]: {
      params: [];
      result: PracticeOverview;
    };
    [appIds.subscriptions.practiceCategoryProgress]: {
      params: [];
      result: PracticeCategoryProgress;
    };
    [appIds.subscriptions.navigationSelectedCategoryCount]: {
      params: [];
      result: number;
    };
    [appIds.subscriptions.navigationCurrentQuestion]: {
      params: [];
      result: Question | null;
    };
    [appIds.subscriptions.navigationQuestionPickerItems]: {
      params: [];
      result: QuestionPickerItem[];
    };
    [appIds.subscriptions.navigationIsLearnMode]: {
      params: [];
      result: boolean;
    };
    [appIds.subscriptions.navigationIsTestMode]: {
      params: [];
      result: boolean;
    };
  };
}
