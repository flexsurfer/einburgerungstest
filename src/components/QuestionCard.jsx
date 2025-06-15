import { memo, useCallback, useMemo } from 'react'
import { AnswerButton } from './AnswerButton'
import { StarButton } from './StarButton'
import '../styles/QuestionCard.css'

export const QuestionCard = memo(function QuestionCard({ 
  question, 
  isReviewMode, 
  userAnswer, 
  onAnswerSelect,
  isFavorite,
  onToggleFavorite
}) {
  const handleAnswerClick = useCallback((index) => {
    if (!isReviewMode && userAnswer === undefined) {
      onAnswerSelect(index)
    }
  }, [isReviewMode, userAnswer, onAnswerSelect])

  const answerButtons = useMemo(() => {
    return question.answers.map((answer, index) => (
      <AnswerButton
        key={index}
        answer={answer}
        index={index}
        isCorrect={question.correct === index}
        isSelected={userAnswer === index}
        isReviewMode={isReviewMode}
        disabled={userAnswer !== undefined || isReviewMode}
        onClick={handleAnswerClick}
        userAnswer={userAnswer}
      />
    ))
  }, [question.answers, question.correct, isReviewMode, userAnswer, handleAnswerClick])

  return (
    <div className="question-card">
      <div className="question-badge">
        {question.globalIndex}
      </div>
      <div className="question-header">
        <h3 className="question-text">{question.question}</h3>
        <StarButton
          isFavorite={isFavorite}
          onClick={() => onToggleFavorite(question.globalIndex)}
        />
      </div>
      {question.img && (
        <div className="question-image-container">
          <img 
            src={question.img.url} 
            alt={`Question ${question.globalIndex} illustration`}
            className="question-image"
          />
          {question.img.text && (
            <p className="question-image-text">{question.img.text}</p>
          )}
        </div>
      )}
      <div className="answers-container">
        {answerButtons}
      </div>
    </div>
  )
}, (prevProps, nextProps) => {
  // Custom comparison function for memo
  return (
    prevProps.question === nextProps.question &&
    prevProps.isReviewMode === nextProps.isReviewMode &&
    prevProps.userAnswer === nextProps.userAnswer &&
    prevProps.isFavorite === nextProps.isFavorite
  )
}) 