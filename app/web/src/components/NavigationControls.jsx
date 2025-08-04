import { memo, useCallback } from 'react'
import { useSubscription, dispatch } from '@flexsurfer/reflex'
import { SUB_IDS } from 'shared/sub-ids'
import { EVENT_IDS } from 'shared/event-ids'
import { LeftArrow, RightArrow, DownArrow } from './Icons'
import '../styles/NavigationControls.css'

export const NavigationControls = memo(({ isVisible = true }) => {

  const currentQuestionIndex = useSubscription([SUB_IDS.CURRENT_QUESTION_INDEX], "NavigationControls")
  const filteredQuestionsCount = useSubscription([SUB_IDS.FILTERED_QUESTIONS_COUNT], "NavigationControls")

  const currentIndex = currentQuestionIndex || 0
  const isFirstQuestion = currentIndex === 0
  const isLastQuestion = currentIndex === filteredQuestionsCount - 1

  const handlePrevious = useCallback(() => {
    if (!isFirstQuestion) {
      dispatch([EVENT_IDS.NAVIGATE_PREV])
    }
  }, [isFirstQuestion])

  const handleNext = useCallback(() => {
    if (!isLastQuestion) {
      dispatch([EVENT_IDS.NAVIGATE_NEXT])
    }
  }, [isLastQuestion])

  const handleQuestionNumberPress = useCallback(() => {
    dispatch([EVENT_IDS.SHOW_QUESTION_PICKER, true])
  }, [])

  if (!isVisible ) {
    return null
  }

  return (
    <div className="navigation-controls">
      <button
        className={`nav-button ${isFirstQuestion ? 'disabled' : ''}`}
        onClick={handlePrevious}
        disabled={isFirstQuestion}
        title="Previous question (← or h key)"
      >
        <LeftArrow />
        Prev
      </button>

      <button
        className="question-number-button"
        onClick={handleQuestionNumberPress}
      >
        <span className="question-number-text">{currentIndex + 1} of {filteredQuestionsCount}</span>
        <DownArrow />
      </button>

      <button
        className={`nav-button ${isLastQuestion ? 'disabled' : ''}`}
        onClick={handleNext}
        disabled={isLastQuestion}
        title="Next question (→ or l key)"
      >
        Next
        <RightArrow />
      </button>
    </div>
  )
})