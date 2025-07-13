import { useCallback, useState } from 'react'
import { useSubscription, dispatch, getSubscriptionValue } from '@flexsurfer/reflex'
import { AnswerButton } from './AnswerButton'

export const AnswerList = ({question}) => {
    
    const mode = useSubscription(['mode'])

    const userAnswer = useSubscription(['userAnswerByQuestionIndex', question.globalIndex])

    const isReviewMode = mode === 'review'
  
    const handleAnswerClick = useCallback((index) => {
      if (!isReviewMode && userAnswer === undefined) {
        dispatch(['answerQuestion', question.globalIndex, index])
      }
    }, [isReviewMode, userAnswer, question.globalIndex])

    return (
        <div className="answers-container">
            {question.answers.map((answer, index) => (
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
            ))}
        </div>
    )
}