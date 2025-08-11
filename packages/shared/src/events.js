import { regEvent, clearHandlers } from "@flexsurfer/reflex"
import { current } from "immer"
import { EVENT_IDS } from './event-ids.js'
import { EFFECT_IDS } from './effect-ids.js'
import { generateTest } from './test';

// UI Events
regEvent(EVENT_IDS.SET_SHOW_WELCOME, ({ draftDb }, show) => {
  draftDb.showWelcome = show
  return [[EFFECT_IDS.LOCAL_STORAGE_SET, { key: 'showWelcome', value: show }]]
})

regEvent(EVENT_IDS.TOGGLE_SHOW_ANSWERS, ({ draftDb }) => {
  draftDb.showAnswers = !draftDb.showAnswers
})

regEvent(EVENT_IDS.TOGGLE_VOCABULARY, ({ draftDb }) => {
  if (draftDb.showVocabulary) {
    // Start closing
    draftDb.showVocabulary = false
  } else {
    // Open immediately
    draftDb.showVocabulary = true
    draftDb.vocabularyRender = true
    return [[EFFECT_IDS.SET_BODY_OVERFLOW, { value: 'hidden' }]]
  }
})

regEvent(EVENT_IDS.VOCABULARY_UNMOUNT, ({ draftDb }) => {
  draftDb.vocabularyRender = false
  return [[EFFECT_IDS.SET_BODY_OVERFLOW, { value: 'auto' }]]
})

regEvent(EVENT_IDS.SET_BODY_OVERFLOW, (_, value) => {
  return [[EFFECT_IDS.SET_BODY_OVERFLOW, { value: value }]]
})

regEvent(EVENT_IDS.SET_SELECTED_CATEGORY, ({ draftDb }, category) => {
  draftDb.selectedCategory = category
  if (category === 'test') {
    generateTest(draftDb);
  }

  // Reset navigation state when category changes
  draftDb.currentQuestionIndex = 0
  draftDb.showQuestionPicker = false

  return [
    [EFFECT_IDS.SCROLL_TO_TOP],
    [EFFECT_IDS.LOCAL_STORAGE_SET, { key: 'selectedCategory', value: category }],
    [EFFECT_IDS.LOCAL_STORAGE_SET, { key: 'currentQuestionIndex', value: 0 }]
  ]
})

regEvent(EVENT_IDS.SCROLL_TO_TOP, (_, behavior = 'auto') => {
  return [[EFFECT_IDS.SCROLL_TO_TOP, behavior]]
})

regEvent(EVENT_IDS.SET_SELECTED_LANGUAGE, ({ draftDb }, language) => {
  draftDb.selectedLanguage = language
})

regEvent(EVENT_IDS.TOGGLE_THEME, ({ draftDb }) => {
  draftDb.theme = draftDb.theme === 'light' ? 'dark' : 'light'
  draftDb.useSystemTheme = false
  return [
    [EFFECT_IDS.LOCAL_STORAGE_SET, { key: 'theme', value: draftDb.theme }],
    [EFFECT_IDS.SET_BODY_THEME, { theme: draftDb.theme }]
  ]
})

// Data Events
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

  const lands = [
    'Baden-Württemberg',
    'Bayern',
    'Berlin',
    'Brandenburg',
    'Bremen',
    'Hamburg',
    'Hessen',
    'Mecklenburg-Vorpommern',
    'Niedersachsen',
    'Nordrhein-Westfalen',
    'Rheinland-Pfalz',
    'Saarland',
    'Sachsen',
    'Sachsen-Anhalt',
    'Schleswig-Holstein',
    'Thüringen'
  ];

  const themeItems = Object.entries(categoryCount)
    .filter(([cat]) => !lands.includes(cat))
    .sort((a, b) => a[0].localeCompare(b[0]));

  const landItems = Object.entries(categoryCount)
    .filter(([cat]) => lands.includes(cat))
    .sort((a, b) => a[0].localeCompare(b[0]));

  draftDb.categories = [
    { title: 'Themes', items: themeItems },
    { title: 'Bundesländer', items: landItems }
  ];
})

regEvent(EVENT_IDS.FETCH_QUESTIONS_FAILURE, ({ draftDb }, error) => {
  draftDb.questionsLoading = false
  draftDb.questionsError = error
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
  if (draftDb.selectedCategory === 'test') {
    draftDb.testAnswers[questionIndex] = answerIndex
  } else {
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

regEvent(EVENT_IDS.REQUEST_CLEAR_ANSWERS, () => {
  return [[EFFECT_IDS.CONFIRM_CLEAR]]
})

regEvent(EVENT_IDS.CLEAR_QUESTION_ANSWER, ({ draftDb }, questionIndex) => {
  if (draftDb.selectedCategory === 'test') {
    delete draftDb.testAnswers[questionIndex]
  } else {
    delete draftDb.userAnswers[questionIndex]
    return [[EFFECT_IDS.LOCAL_STORAGE_SET, { key: 'userAnswers', value: current(draftDb.userAnswers) }]]
  }
})

// Navigation events 
regEvent(EVENT_IDS.NAVIGATE_TO_QUESTION, ({ draftDb }, questionIndex) => {
  draftDb.currentQuestionIndex = questionIndex
  draftDb.showQuestionPicker = false
  return [[EFFECT_IDS.LOCAL_STORAGE_SET, { key: 'currentQuestionIndex', value: questionIndex }]]
})

regEvent(EVENT_IDS.NAVIGATE_NEXT, ({ draftDb }) => {
  const currentIndex = draftDb.currentQuestionIndex || 0
  const nextIndex = Math.min(currentIndex + 1, draftDb.questions.length - 1)
  draftDb.currentQuestionIndex = nextIndex
  return [[EFFECT_IDS.LOCAL_STORAGE_SET, { key: 'currentQuestionIndex', value: nextIndex }]]
})

regEvent(EVENT_IDS.NAVIGATE_PREV, ({ draftDb }) => {
  const currentIndex = draftDb.currentQuestionIndex || 0
  const prevIndex = Math.max(currentIndex - 1, 0)
  draftDb.currentQuestionIndex = prevIndex
  return [[EFFECT_IDS.LOCAL_STORAGE_SET, { key: 'currentQuestionIndex', value: prevIndex }]]
})

regEvent(EVENT_IDS.SHOW_QUESTION_PICKER, ({ draftDb }, show) => {
  draftDb.showQuestionPicker = show
})