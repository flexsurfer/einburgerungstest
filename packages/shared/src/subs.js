import { regSub, setupSubsHotReload } from "@flexsurfer/reflex"
import { SUB_IDS } from './sub-ids.js'

// Root subscriptions
regSub(SUB_IDS.SHOW_WELCOME)
regSub(SUB_IDS.SHOW_ANSWERS)
regSub(SUB_IDS.SELECTED_CATEGORY)
regSub(SUB_IDS.QUESTIONS)
regSub(SUB_IDS.QUESTIONS_LOADED)
regSub(SUB_IDS.CATEGORIES)
regSub(SUB_IDS.VOCABULARY_DATA)
regSub(SUB_IDS.USER_ANSWERS)
regSub(SUB_IDS.FAVORITES)
regSub(SUB_IDS.SELECTED_LANGUAGE)
regSub(SUB_IDS.SHOW_VOCABULARY)
regSub(SUB_IDS.VOCABULARY_RENDER)
regSub(SUB_IDS.THEME)

// Computed subscriptions
regSub(SUB_IDS.FAVORITE_COUNT,
  (favorites) => favorites.length,
  () => [[SUB_IDS.FAVORITES]]
)

regSub(SUB_IDS.FILTERED_QUESTIONS,
  (questions, selectedCategory, favorites) => {
    if (selectedCategory === 'favorites') {
      return questions.filter(q => favorites.includes(q.globalIndex))
    }
    return selectedCategory
      ? questions.filter(q => q.category === selectedCategory)
      : questions
  },
  () => [[SUB_IDS.QUESTIONS], [SUB_IDS.SELECTED_CATEGORY], [SUB_IDS.FAVORITES]]
)

regSub(SUB_IDS.USER_ANSWER_BY_QUESTION_INDEX,
  (userAnswers, questionIndex) => userAnswers[questionIndex],
  () => [[SUB_IDS.USER_ANSWERS]]
)

regSub(SUB_IDS.IS_FAVORITE_BY_GLOBAL_INDEX,
  (favorites, globalIndex) => favorites.includes(globalIndex),
  () => [[SUB_IDS.FAVORITES]]
)

regSub(SUB_IDS.STATISTICS,
  (userAnswers, filteredQuestions) => {
    const correctCount = filteredQuestions.filter(q => userAnswers[q.globalIndex] === q.correct).length
    const totalAnswered = filteredQuestions.filter(q => userAnswers[q.globalIndex] !== undefined).length
    const incorrect = totalAnswered - correctCount
    const totalVisible = filteredQuestions.length
    const accuracy = totalAnswered > 0 ? (correctCount / totalAnswered * 100).toFixed(1) : 0
    const passed = accuracy > 51.5
    return {
      correct: correctCount,
      incorrect,
      totalAnswered,
      totalVisible,
      accuracy,
      passed
    }
  },
  () => [[SUB_IDS.USER_ANSWERS], [SUB_IDS.FILTERED_QUESTIONS]]
)