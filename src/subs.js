import { regSub, setupSubsHotReload } from "@flexsurfer/reflex"

// Root subscriptions
regSub('showWelcome')
regSub('mode')
regSub('selectedCategory')
regSub('questions')
regSub('categories')
regSub('vocabularyData')
regSub('userAnswers')
regSub('favorites')
regSub('selectedLanguage')

// Computed subscriptions
regSub('favoriteCount',
  (favorites) => favorites.length,
  () => [['favorites']]
)

regSub('filteredQuestions',
  (questions, selectedCategory, favorites) => {
    if (selectedCategory === 'favorites') {
      return questions.filter(q => favorites.includes(q.globalIndex))
    }
    return selectedCategory
      ? questions.filter(q => q.category === selectedCategory)
      : questions
  },
  () => [['questions'], ['selectedCategory'], ['favorites']]
)

regSub('userAnswerByQuestionIndex',
  (userAnswers, questionIndex) => userAnswers[questionIndex],
  () => [['userAnswers']]
)

regSub('isFavoriteByGlobalIndex',
  (favorites, globalIndex) => favorites.includes(globalIndex),
  () => [['favorites']]
)

regSub('statistics',
  (userAnswers, filteredQuestions) => {
    const correctCount = filteredQuestions.filter(q => userAnswers[q.globalIndex] === q.correct).length
    const totalAnswered = filteredQuestions.filter(q => userAnswers[q.globalIndex] !== undefined).length
    const incorrect = totalAnswered - correctCount
    const totalVisible = filteredQuestions.length
    const accuracy = totalAnswered > 0 ? (correctCount / totalAnswered * 100).toFixed(1) : 0
    
    return {
      correct: correctCount,
      incorrect,
      totalAnswered,
      totalVisible,
      accuracy
    }
  },
  () => [['userAnswers'], ['filteredQuestions']]
)

if (import.meta.hot) {
    const { dispose, accept } = setupSubsHotReload();
    import.meta.hot.dispose(dispose);
    import.meta.hot.accept(accept);
}