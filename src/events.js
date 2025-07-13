import { regEvent, clearHandlers } from "@flexsurfer/reflex"
import { current } from "immer"

// Initialize application, load data from localStorage, fetch questions from data.json
regEvent('initializeApp',
  ({ draftDb, localStorage }) => {
    draftDb.userAnswers = localStorage.userAnswers || {}
    draftDb.favorites = localStorage.favorites || []
    draftDb.showWelcome = localStorage.showWelcome ?? true
    
    return [
      ['dispatch', ['fetchQuestions']]
    ]
  },
  [['localStorageGet', 'userAnswers'], ['localStorageGet', 'favorites'], ['localStorageGet', 'showWelcome']]
)

// UI Events
regEvent('setShowWelcome', ({ draftDb }, show) => {
  draftDb.showWelcome = show
  return [['localStorageSet', { key: 'showWelcome', value: show }]]
})

regEvent('setMode', ({ draftDb }, mode) => {
  draftDb.mode = mode
})

regEvent('setSelectedCategory', ({ draftDb }, category) => {
  draftDb.selectedCategory = category
  //TODO fix bug in reflex, it's should be possible to call effect without parameters
  return [['scrollToTop', null]]
})

regEvent('setSelectedLanguage', ({ draftDb }, language) => {
  draftDb.selectedLanguage = language
})

// Data Events
regEvent('fetchQuestions', ({ draftDb }) => {
  draftDb.questionsLoading = true
  draftDb.questionsError = null
  return [
    ['fetch', {
      url: 'data.json',
      onSuccess: ['fetchQuestionsSuccess'],
      onFailure: ['fetchQuestionsFailure']
    }]
  ]
})

regEvent('fetchQuestionsSuccess', ({ draftDb }, data) => {
  draftDb.questionsLoading = false
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

regEvent('fetchQuestionsFailure', ({ draftDb }, error) => {
  draftDb.questionsLoading = false
  draftDb.questionsError = error
})

regEvent('fetchVocabulary', ({ draftDb }) => {
  draftDb.vocabularyLoading = true
  draftDb.vocabularyError = null
  return [
    ['fetch', {
      url: 'vocabulary_multilang.json',
      onSuccess: ['fetchVocabularySuccess'],
      onFailure: ['fetchVocabularyFailure']
    }]
  ]
})

regEvent('fetchVocabularySuccess', ({ draftDb }, data) => {
  draftDb.vocabularyLoading = false
  draftDb.vocabularyError = null
  draftDb.vocabularyData = data
})

regEvent('fetchVocabularyFailure', ({ draftDb }, error) => {
  draftDb.vocabularyLoading = false
  draftDb.vocabularyError = error
})

// User Actions Events
regEvent('answerQuestion', ({ draftDb }, questionIndex, answerIndex) => {
  if (draftDb.mode === 'testing') {
    draftDb.userAnswers[questionIndex] = answerIndex

    return [['localStorageSet', { key: 'userAnswers', value: current(draftDb.userAnswers) }]]
  }
})

regEvent('toggleFavorite', ({ draftDb }, questionIndex) => {
  const favorites = draftDb.favorites
  const index = favorites.indexOf(questionIndex)

  if (index === -1) {
    favorites.push(questionIndex)
  } else {
    favorites.splice(index, 1)
  }

  return [['localStorageSet', { key: 'favorites', value: current(favorites) }]]
})

regEvent('clearAnswers', ({ draftDb }) => {
  draftDb.userAnswers = {}
  return [['localStorageRemove', { key: 'userAnswers' }]]
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