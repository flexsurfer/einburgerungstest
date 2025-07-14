import { useCallback, useState } from 'react'
import { useSubscription, dispatch, getSubscriptionValue } from '@flexsurfer/reflex'
import { AnswerButton } from './AnswerButton'
import { EVENT_IDS } from '../event-ids.js'
import { SUB_IDS } from '../sub-ids.js'

export const AnswerList = ({question}) => {
    
    const mode = useSubscription([SUB_IDS.MODE])

    const userAnswer = useSubscription([SUB_IDS.USER_ANSWER_BY_QUESTION_INDEX, question.globalIndex])

    const isReviewMode = mode === 'review'
  
    const handleAnswerClick = useCallback((index) => {
      if (!isReviewMode && userAnswer === undefined) {
        dispatch([EVENT_IDS.ANSWER_QUESTION, question.globalIndex, index])
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