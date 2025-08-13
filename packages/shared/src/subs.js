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
regSub(SUB_IDS.TEST_QUESTIONS)
regSub(SUB_IDS.TEST_ANSWERS)

// Navigation root subscriptions
regSub(SUB_IDS.CURRENT_QUESTION_INDEX)
regSub(SUB_IDS.SHOW_QUESTION_PICKER)

// Computed subscriptions
regSub(SUB_IDS.FAVORITE_COUNT,
  (favorites) => favorites.length,
  () => [[SUB_IDS.FAVORITES]]
)

regSub(SUB_IDS.WRONG_COUNT,
  (userAnswers, questions) => {
    return questions.filter(q => {
      const ua = userAnswers[q.globalIndex];
      return ua !== undefined && ua !== q.correct;
    }).length;
  },
  () => [[SUB_IDS.USER_ANSWERS], [SUB_IDS.QUESTIONS]]
)

regSub(SUB_IDS.IS_TEST_MODE,
  (selectedCategory) => selectedCategory === 'test',
  () => [[SUB_IDS.SELECTED_CATEGORY]]
)

//TODO: it's not really efficient, could be improved, but it's not a big deal for now
// each time user changes fav or answer, questions are filtered again, and in reflex it compare the result, but it doesn't trigger a re-render
// so we have this unnecessary computations on every fav or answer change
regSub(SUB_IDS.FILTERED_QUESTIONS,
  (questions, selectedCategory, favorites, userAnswers, testQuestions) => {
    if (selectedCategory === 'favorites') {
      return questions.filter(q => favorites.includes(q.globalIndex))
    } else if (selectedCategory === 'wrong') {
      return questions.filter(q => {
        const ua = userAnswers[q.globalIndex];
        return ua !== undefined && ua !== q.correct;
      })
    } else if (selectedCategory === 'test') {
      return testQuestions
    }
    return selectedCategory
      ? questions.filter(q => q.category === selectedCategory)
      : questions
  },
  () => [[SUB_IDS.QUESTIONS], [SUB_IDS.SELECTED_CATEGORY], [SUB_IDS.FAVORITES], [SUB_IDS.USER_ANSWERS], [SUB_IDS.TEST_QUESTIONS]]
)

regSub(SUB_IDS.FILTERED_QUESTIONS_COUNT,
  (filteredQuestions) => filteredQuestions.length,
  () => [[SUB_IDS.FILTERED_QUESTIONS]]
)

regSub(SUB_IDS.USER_ANSWER_BY_QUESTION_INDEX,
  (userAnswers, testAnswers, selectedCategory, questionIndex) => {
    return selectedCategory === 'test' 
      ? testAnswers[questionIndex]
      : userAnswers[questionIndex]
  },
  () => [[SUB_IDS.USER_ANSWERS], [SUB_IDS.TEST_ANSWERS], [SUB_IDS.SELECTED_CATEGORY]]
)

regSub(SUB_IDS.IS_FAVORITE_BY_GLOBAL_INDEX,
  (favorites, globalIndex) => favorites.includes(globalIndex),
  () => [[SUB_IDS.FAVORITES]]
)

regSub(SUB_IDS.STATISTICS,
  (filteredQuestions, userAnswers, testAnswers, selectedCategory) => {
    const answers = selectedCategory === 'test' ? testAnswers : userAnswers
    const correctCount = filteredQuestions.filter(q => answers[q.globalIndex] === q.correct).length
    const totalAnswered = filteredQuestions.filter(q => answers[q.globalIndex] !== undefined).length
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
  () => [[SUB_IDS.FILTERED_QUESTIONS], [SUB_IDS.USER_ANSWERS], [SUB_IDS.TEST_ANSWERS], [SUB_IDS.SELECTED_CATEGORY]]
)

regSub(SUB_IDS.SELECTED_CATEGORY_COUNT,
  (selectedCategory, categories) => {
    if (selectedCategory && selectedCategory !== 'favorites' && selectedCategory !== 'wrong') {
      for (const group of categories) {
        const found = group.items.find(([cat]) => cat === selectedCategory);
        if (found) {
          return found[1];
        }
      }
    }
    return 0;
  },
  () => [[SUB_IDS.SELECTED_CATEGORY], [SUB_IDS.CATEGORIES]]
)

regSub(SUB_IDS.CURRENT_QUESTION,
  (filteredQuestions, currentQuestionIndex) => {
    if (!filteredQuestions || filteredQuestions.length === 0) return null;
    const index = Math.max(0, Math.min(currentQuestionIndex || 0, filteredQuestions.length - 1));
    return filteredQuestions[index];
  },
  () => [[SUB_IDS.FILTERED_QUESTIONS], [SUB_IDS.CURRENT_QUESTION_INDEX]]
)

regSub(SUB_IDS.QUESTION_PICKER_ITEMS,
  (filteredQuestions, userAnswers, testAnswers, currentQuestionIndex, selectedCategory) => {
    return filteredQuestions.map((question, index) => {
      const userAnswer = selectedCategory === 'test' ? testAnswers[question.globalIndex] : userAnswers[question.globalIndex];
      const isAnswered = userAnswer !== undefined;
      const isCorrect = isAnswered && userAnswer === question.correct;
      const isSelected = index === (currentQuestionIndex || 0);
      let className = 'question-picker-item';
      if (isSelected) className += ' selected';
      if (isAnswered) {
        className += isCorrect ? ' correct' : ' incorrect';
      }
      const ariaLabel = `Question ${index + 1}${isAnswered ? (isCorrect ? ' (correct)' : ' (incorrect)') : ''}`;
      return {
        key: question.globalIndex,
        className,
        ariaLabel,
        number: question.globalIndex,
        isAnswered,
        indicatorClass: `answer-indicator ${isCorrect ? 'correct' : 'incorrect'}` ,
        filteredIndex: index,
        isSelected,
        isCorrect
      };
    });
  },
  () => [[SUB_IDS.FILTERED_QUESTIONS], [SUB_IDS.USER_ANSWERS], [SUB_IDS.TEST_ANSWERS], [SUB_IDS.CURRENT_QUESTION_INDEX], [SUB_IDS.SELECTED_CATEGORY]]
)