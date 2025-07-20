import { useCallback } from 'react'
import '../styles/AnswerButton.css'

export const AnswerButton = ({ answer, index, isCorrect, isSelected, showAnswers, disabled, onClick, userAnswer }) => {

  const getClassName = useCallback(() => {
    const classes = ['answer-button']

    if (showAnswers) {
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
  }, [showAnswers, isCorrect, userAnswer, isSelected])

  const handleClick = useCallback(() => {
    if (!showAnswers && userAnswer === undefined) {
      onClick(index)
    }
  }, [showAnswers, userAnswer, onClick, index])

  return (
    <button
      className={getClassName()}
      onClick={handleClick}
      disabled={disabled}
    >
      {answer}
    </button>
  )
}