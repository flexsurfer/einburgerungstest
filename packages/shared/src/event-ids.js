// Event IDs constants
export const EVENT_IDS = {
  // Application initialization
  INITIALIZE_APP: 'initializeApp',
  STORAGE_LOADED: 'storageLoaded',
  STORAGE_LOAD_FAILED: 'storageLoadFailed',
  
  // UI Events
  SET_SHOW_WELCOME: 'setShowWelcome',
  SET_MODE: 'setMode',
  TOGGLE_VOCABULARY: 'toggleVocabulary',
  VOCABULARY_UNMOUNT: 'vocabularyUnmount',
  SET_SELECTED_CATEGORY: 'setSelectedCategory',
  SET_SELECTED_LANGUAGE: 'setSelectedLanguage',
  
  // Data Events
  FETCH_QUESTIONS: 'fetchQuestions',
  FETCH_QUESTIONS_SUCCESS: 'fetchQuestionsSuccess',
  FETCH_QUESTIONS_FAILURE: 'fetchQuestionsFailure',
  FETCH_VOCABULARY: 'fetchVocabulary',
  FETCH_VOCABULARY_SUCCESS: 'fetchVocabularySuccess',
  FETCH_VOCABULARY_FAILURE: 'fetchVocabularyFailure',
  
  // User Actions Events
  ANSWER_QUESTION: 'answerQuestion',
  TOGGLE_FAVORITE: 'toggleFavorite',
  CLEAR_ANSWERS: 'clearAnswers'
} 