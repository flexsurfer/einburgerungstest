import { memo, useCallback } from 'react'
import '../styles/AnswerButton.css'

export const AnswerButton = memo(function AnswerButton({
  answer,
  index,
  isCorrect,
  isSelected,
  isReviewMode,
  disabled,
  onClick,
  userAnswer
}) {
  const getClassName = useCallback(() => {
    const classes = ['answer-button']
    
    if (isReviewMode) {
      classes.push('review-mode')
      if (isCorrect) {
        classes.push('correct')
      }
    } else if (userAnswer !== undefined) {
      classes.push('test-mode')
      if (isSelected && !isCorrect) {
        classes.push('incorrect')
      } else if (isCorrect) {
        classes.push('correct')
      }
    }
    
    return classes.join(' ')
  }, [isReviewMode, isCorrect, userAnswer, isSelected])

  const handleClick = useCallback(() => {
    if (!isReviewMode && userAnswer === undefined) {
      onClick(index)
    }
  }, [isReviewMode, userAnswer, onClick, index])

  return (
    <button
      className={getClassName()}
      onClick={handleClick}
      disabled={disabled}
    >
      {answer}
    </button>
  )
}, (prevProps, nextProps) => {
  // Custom comparison function for memo
  return (
    prevProps.answer === nextProps.answer &&
    prevProps.index === nextProps.index &&
    prevProps.isCorrect === nextProps.isCorrect &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.isReviewMode === nextProps.isReviewMode &&
    prevProps.disabled === nextProps.disabled &&
    prevProps.userAnswer === nextProps.userAnswer
  )
}) 