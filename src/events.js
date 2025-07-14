import { regEvent, clearHandlers } from "@flexsurfer/reflex"
import { current } from "immer"
import { EVENT_IDS } from './event-ids.js'
import { EFFECT_IDS } from './effect-ids.js'

// Initialize application, load data from localStorage, fetch questions from data.json
regEvent(EVENT_IDS.INITIALIZE_APP,
  ({ draftDb, localStorage }) => {
    draftDb.userAnswers = localStorage.userAnswers || {}
    draftDb.favorites = localStorage.favorites || []
    draftDb.showWelcome = localStorage.showWelcome ?? true
    
    return [
      ['dispatch', [EVENT_IDS.FETCH_QUESTIONS]]
    ]
  },
  [[EFFECT_IDS.LOCAL_STORAGE_GET, 'userAnswers'], [EFFECT_IDS.LOCAL_STORAGE_GET, 'favorites'], [EFFECT_IDS.LOCAL_STORAGE_GET, 'showWelcome']]
)

// UI Events
regEvent(EVENT_IDS.SET_SHOW_WELCOME, ({ draftDb }, show) => {
  draftDb.showWelcome = show
  return [[EFFECT_IDS.LOCAL_STORAGE_SET, { key: 'showWelcome', value: show }]]
})

regEvent(EVENT_IDS.SET_MODE, ({ draftDb }, mode) => {
  draftDb.mode = mode
})

regEvent(EVENT_IDS.TOGGLE_VOCABULARY, ({ draftDb }) => {
  if (draftDb.showVocabulary) {
    // Start closing
    draftDb.showVocabulary = false
  } else {
    // Open immediately
    draftDb.showVocabulary = true
    draftDb.vocabularyRender = true
    // Prevent body scrolling
    document.body.style.overflow = 'hidden'
  }
})

regEvent(EVENT_IDS.VOCABULARY_UNMOUNT, ({ draftDb }) => {
  draftDb.vocabularyRender = false
  // Restore body scrolling
  document.body.style.overflow = 'auto'
})

regEvent(EVENT_IDS.SET_SELECTED_CATEGORY, ({ draftDb }, category) => {
  draftDb.selectedCategory = category
  //TODO fix bug in reflex, it's should be possible to call effect without parameters
  return [[EFFECT_IDS.SCROLL_TO_TOP, null]]
})

regEvent(EVENT_IDS.SET_SELECTED_LANGUAGE, ({ draftDb }, language) => {
  draftDb.selectedLanguage = language
})

// Data Events
regEvent(EVENT_IDS.FETCH_QUESTIONS, ({ draftDb }) => {
  draftDb.questionsLoading = true
  draftDb.questionsError = null
  return [
    [EFFECT_IDS.FETCH, {
      url: 'data.json',
      onSuccess: [EVENT_IDS.FETCH_QUESTIONS_SUCCESS],
      onFailure: [EVENT_IDS.FETCH_QUESTIONS_FAILURE]
    }]
  ]
})

regEvent(EVENT_IDS.FETCH_QUESTIONS_SUCCESS, ({ draftDb }, data) => {
  draftDb.questionsLoading = false
  draftDb.questionsLoaded = true
  draftDb.questionsError = null

  // Add index to each question
  const questionsWithIndex = data.map((question, index) => ({
    ...question,
    globalIndex: index + 1
  }))
  draftDb.questions = questionsWithIndex

  // Extract unique categories and count questions
  const categoryCount = questionsWithIndex.reduce((acc, question) => {
    acc[question.category] = (acc[question.category] || 0) + 1
    return acc
  }, {})

  // Convert to array and sort by count in descending order
  const sortedCategories = Object.entries(categoryCount)
    .sort((a, b) => b[1] - a[1])

  draftDb.categories = sortedCategories
})

regEvent(EVENT_IDS.FETCH_QUESTIONS_FAILURE, ({ draftDb }, error) => {
  draftDb.questionsLoading = false
  draftDb.questionsError = error
})

regEvent(EVENT_IDS.FETCH_VOCABULARY, ({ draftDb }) => {
  draftDb.vocabularyLoading = true
  draftDb.vocabularyError = null
  return [
    [EFFECT_IDS.FETCH, {
      url: 'vocabulary_multilang.json',
      onSuccess: [EVENT_IDS.FETCH_VOCABULARY_SUCCESS],
      onFailure: [EVENT_IDS.FETCH_VOCABULARY_FAILURE]
    }]
  ]
})

regEvent(EVENT_IDS.FETCH_VOCABULARY_SUCCESS, ({ draftDb }, data) => {
  draftDb.vocabularyLoading = false
  draftDb.vocabularyError = null
  draftDb.vocabularyData = data
})

regEvent(EVENT_IDS.FETCH_VOCABULARY_FAILURE, ({ draftDb }, error) => {
  draftDb.vocabularyLoading = false
  draftDb.vocabularyError = error
})

// User Actions Events
regEvent(EVENT_IDS.ANSWER_QUESTION, ({ draftDb }, questionIndex, answerIndex) => {
  if (draftDb.mode === 'testing') {
    draftDb.userAnswers[questionIndex] = answerIndex

    return [[EFFECT_IDS.LOCAL_STORAGE_SET, { key: 'userAnswers', value: current(draftDb.userAnswers) }]]
  }
})

regEvent(EVENT_IDS.TOGGLE_FAVORITE, ({ draftDb }, questionIndex) => {
  const favorites = draftDb.favorites
  const index = favorites.indexOf(questionIndex)

  if (index === -1) {
    favorites.push(questionIndex)
  } else {
    favorites.splice(index, 1)
  }

  return [[EFFECT_IDS.LOCAL_STORAGE_SET, { key: 'favorites', value: current(favorites) }]]
})

regEvent(EVENT_IDS.CLEAR_ANSWERS, ({ draftDb }) => {
  draftDb.userAnswers = {}
  return [[EFFECT_IDS.LOCAL_STORAGE_REMOVE, { key: 'userAnswers' }]]
})

// Vite Hot reload
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    clearHandlers('event');
  })

  import.meta.hot.accept((newModule) => {
    if (newModule) {
      console.log('updated: new events module')
    }
  })
}