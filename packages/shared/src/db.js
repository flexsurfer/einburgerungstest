import { initAppDb } from "@flexsurfer/reflex"

const initialDb = {
    // UI state
    showWelcome: true,
    showAnswers: false,
    selectedCategory: null,
    selectedLanguage: 'en',
    showVocabulary: false,
    vocabularyRender: false,
    theme: 'light',
    useSystemTheme: true,

    // Data state
    questions: [],
    categories: [],
    vocabularyData: null,

    // User state  
    userAnswers: {},
    favorites: [],

    // Loading states
    questionsLoading: false,
    questionsLoaded: false,
    vocabularyLoading: false,

    // Error states
    questionsError: null,
    vocabularyError: null
}

initAppDb(initialDb)