import { memo, useCallback, useEffect } from 'react'
import { useSubscription, dispatch } from '@flexsurfer/reflex'
import { SUB_IDS } from 'shared/sub-ids'
import { EVENT_IDS } from 'shared/event-ids'
import '../styles/QuestionPicker.css'

export const QuestionPicker = () => {
  const showQuestionPicker = useSubscription([SUB_IDS.SHOW_QUESTION_PICKER], "QuestionPicker")
  const pickerItems = useSubscription([SUB_IDS.QUESTION_PICKER_ITEMS], "QuestionPicker")

  const handleQuestionSelect = useCallback((index) => {
    dispatch([EVENT_IDS.NAVIGATE_TO_QUESTION, index])
  }, [])

  const handleClose = useCallback(() => {
    dispatch([EVENT_IDS.SHOW_QUESTION_PICKER, false])
  }, [])

  const handleOverlayClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }, [])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && showQuestionPicker) {
        handleClose()
      }
    }

    if (showQuestionPicker) {
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [showQuestionPicker])

  if (!showQuestionPicker || !pickerItems || pickerItems.length === 0) {
    return null
  }

  return (
    <div className="question-picker-overlay" onClick={handleOverlayClick}>
      <div className="question-picker-modal">
        <div className="question-picker-header">
          <h2 className="question-picker-title">Select Question</h2>
          <button
            className="question-picker-close"
            onClick={handleClose}
            aria-label="Close question picker"
          >
            ✕
          </button>
        </div>

        <div className="question-picker-legend">
          <div className="legend-item">
            <div className="legend-dot correct"></div>
            <span>Correct</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot incorrect"></div>
            <span>Incorrect</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot unanswered"></div>
            <span>Unanswered</span>
          </div>
        </div>

        <div className="question-picker-grid">
          {pickerItems.map((item) => (
            <button
              key={item.key}
              className={item.className}
              onClick={() => handleQuestionSelect(item.filteredIndex)}
              aria-label={item.ariaLabel}
            >
              <span className="question-item-number">
                {item.number}
              </span>
              {item.isAnswered && (
                <div className={item.indicatorClass} />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}