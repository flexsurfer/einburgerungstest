// Subscription IDs constants
export const SUB_IDS = {
  // Root subscriptions - direct state values
  SHOW_WELCOME: 'showWelcome',
  MODE: 'mode',
  SELECTED_CATEGORY: 'selectedCategory',
  QUESTIONS: 'questions',
  QUESTIONS_LOADED: 'questionsLoaded',
  CATEGORIES: 'categories',
  VOCABULARY_DATA: 'vocabularyData',
  USER_ANSWERS: 'userAnswers',
  FAVORITES: 'favorites',
  SELECTED_LANGUAGE: 'selectedLanguage',
  SHOW_VOCABULARY: 'showVocabulary',
  VOCABULARY_RENDER: 'vocabularyRender',
  
  // Computed subscriptions - derived values
  FAVORITE_COUNT: 'favoriteCount',
  FILTERED_QUESTIONS: 'filteredQuestions',
  USER_ANSWER_BY_QUESTION_INDEX: 'userAnswerByQuestionIndex',
  IS_FAVORITE_BY_GLOBAL_INDEX: 'isFavoriteByGlobalIndex',
  STATISTICS: 'statistics'
} 