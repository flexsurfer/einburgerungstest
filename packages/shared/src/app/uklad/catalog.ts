/**
 * The single source of truth for Uklad state roots and application ids.
 *
 * All application ids live here. Feature modules and platform adapters must
 * reference this catalog rather than introducing another id file or repeating
 * a string literal.
 */
export const stateKeys = {
  uiShowAnswers: "uiShowAnswers",

  preferencesSelectedLanguage: "preferencesSelectedLanguage",
  preferencesSelectedLand: "preferencesSelectedLand",
  preferencesTheme: "preferencesTheme",
  preferencesUseSystemTheme: "preferencesUseSystemTheme",

  vocabularyData: "vocabularyData",
  vocabularyLoading: "vocabularyLoading",
  vocabularyError: "vocabularyError",
  vocabularyVisible: "vocabularyVisible",
  vocabularyRendered: "vocabularyRendered",

  questionsItems: "questionsItems",
  questionsCategories: "questionsCategories",
  questionsLoading: "questionsLoading",
  questionsLoaded: "questionsLoaded",
  questionsError: "questionsError",

  practiceUserAnswers: "practiceUserAnswers",
  practiceFavorites: "practiceFavorites",
  practiceGlobalIndex: "practiceGlobalIndex",
  practiceLearnGlobalIndex: "practiceLearnGlobalIndex",

  testSessionQuestions: "testSessionQuestions",
  testSessionAnswers: "testSessionAnswers",
  testSessionUsedQuestions: "testSessionUsedQuestions",

  navigationSelectedCategory: "navigationSelectedCategory",
  navigationCurrentQuestionIndex: "navigationCurrentQuestionIndex",
  navigationQuestionPickerVisible: "navigationQuestionPickerVisible",
  navigationActiveScreen: "navigationActiveScreen",
  navigationIsLearnMode: "navigationIsLearnMode",
} as const;

export const appIds = {
  events: {
    appInitialize: "app/initialize",

    uiShowAnswersToggled: "ui/show-answers-toggled",
    vocabularyToggled: "vocabulary/toggled",
    vocabularyUnmounted: "vocabulary/unmounted",
    navigationCategorySelected: "navigation/category-selected",
    navigationLearnOpened: "navigation/learn-opened",
    navigationHomeOpened: "navigation/home-opened",
    navigationSettingsOpened: "navigation/settings-opened",
    navigationPracticeResumed: "navigation/practice-resumed",
    preferencesLanguageSelected: "preferences/language-selected",
    preferencesLandSelected: "preferences/land-selected",
    preferencesThemeSelected: "preferences/theme-selected",
    preferencesThemeToggled: "preferences/theme-toggled",
    uiScrollToTop: "ui/scroll-to-top",
    uiBodyOverflowSet: "ui/body-overflow-set",

    questionsFetchRequested: "questions/fetch-requested",
    questionsFetchSucceeded: "questions/fetch-succeeded",
    questionsFetchFailed: "questions/fetch-failed",
    vocabularyFetchRequested: "vocabulary/fetch-requested",
    vocabularyFetchSucceeded: "vocabulary/fetch-succeeded",
    vocabularyFetchFailed: "vocabulary/fetch-failed",

    practiceQuestionAnswered: "practice/question-answered",
    practiceFavoriteToggled: "practice/favorite-toggled",
    practiceAnswersCleared: "practice/answers-cleared",
    practiceClearAnswersRequested: "practice/clear-answers-requested",
    preferencesSystemThemeChanged: "preferences/system-theme-changed",
    practiceQuestionAnswerCleared: "practice/question-answer-cleared",

    navigationQuestionSelected: "navigation/question-selected",
    navigationNext: "navigation/next",
    navigationPrevious: "navigation/previous",
    navigationQuestionPickerShown: "navigation/question-picker-shown",
  },
  subscriptions: {
    uiShowAnswers: "ui/show-answers",

    navigationSelectedCategory: "navigation/selected-category",
    navigationCurrentQuestionIndex: "navigation/current-question-index",
    navigationQuestionPickerVisible: "navigation/question-picker-visible",
    navigationActiveScreen: "navigation/active-screen",

    questionsItems: "questions/items",
    questionsLoaded: "questions/loaded",
    questionsLoading: "questions/loading",
    questionsCategories: "questions/categories",
    questionsError: "questions/error",

    vocabularyData: "vocabulary/data",
    vocabularyLoading: "vocabulary/loading",
    vocabularyError: "vocabulary/error",
    vocabularyVisible: "vocabulary/visible",
    vocabularyRendered: "vocabulary/rendered",

    preferencesSelectedLanguage: "preferences/selected-language",
    preferencesSelectedLand: "preferences/selected-land",
    preferencesTheme: "preferences/theme",
    preferencesUseSystemTheme: "preferences/use-system-theme",
    preferencesThemeSelection: "preferences/theme-selection",

    practiceUserAnswers: "practice/user-answers",
    practiceFavorites: "practice/favorites",
    practiceGlobalIndex: "practice/global-index",
    practiceLearnGlobalIndex: "practice/learn-global-index",
    testSessionQuestions: "test-session/questions",
    testSessionAnswers: "test-session/answers",

    practiceFavoriteCount: "practice/favorite-count",
    practiceWrongCount: "practice/wrong-count",
    practiceFilteredQuestions: "practice/filtered-questions",
    practiceFilteredQuestionsCount: "practice/filtered-questions-count",
    practiceUserAnswerByQuestionIndex: "practice/user-answer-by-question-index",
    practiceIsFavoriteByGlobalIndex: "practice/is-favorite-by-global-index",
    practiceStatistics: "practice/statistics",
    practiceOverview: "practice/overview",
    practiceCategoryProgress: "practice/category-progress",
    navigationSelectedCategoryCount: "navigation/selected-category-count",
    navigationCurrentQuestion: "navigation/current-question",
    navigationQuestionPickerItems: "navigation/question-picker-items",
    navigationIsLearnMode: "navigation/is-learn-mode",
    navigationIsTestMode: "navigation/is-test-mode",
  },
  effects: {
    dataFetch: "data/fetch",
    dataLoadLocal: "data/load-local",
    uiScrollToTop: "ui/scroll-to-top",
    uiConfirmClear: "ui/confirm-clear",
    uiSetBodyTheme: "ui/set-body-theme",
    uiSetBodyOverflow: "ui/set-body-overflow",
  },
  coeffects: {
    systemColorScheme: "system/color-scheme",
    systemRandom: "system/random",
  },
} as const;
