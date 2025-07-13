import { initAppDb } from "@flexsurfer/reflex"

// Initialize the app database with the initial state
const initialDb = {
    // UI state
    showWelcome: true,
    mode: 'testing',
    selectedCategory: null,
    selectedLanguage: 'en',

    // Data state
    questions: [],
    categories: [],
    vocabularyData: null,

    // User state  
    userAnswers: {},
    favorites: [],

    // Loading states
    questionsLoading: false,
    vocabularyLoading: false,

    // Error states
    questionsError: null,
    vocabularyError: null
}

initAppDb(initialDb)