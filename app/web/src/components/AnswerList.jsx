import { useCallback } from 'react'
import { useSubscription, dispatch } from '@flexsurfer/reflex'
import { AnswerButton } from './AnswerButton.jsx'
import { EVENT_IDS } from 'shared/event-ids'
import { SUB_IDS } from 'shared/sub-ids'

export const AnswerList = ({question}) => {
    
    const showAnswers = useSubscription([SUB_IDS.SHOW_ANSWERS])

    const userAnswer = useSubscription([SUB_IDS.USER_ANSWER_BY_QUESTION_INDEX, question.globalIndex])
  
    const handleAnswerClick = useCallback((index) => {
      if (!showAnswers && userAnswer === undefined) {
        dispatch([EVENT_IDS.ANSWER_QUESTION, question.globalIndex, index])
      }
    }, [showAnswers, userAnswer, question.globalIndex])

    return (
        <div className="answers-container">
            {question.answers.map((answer, index) => (
                <AnswerButton
                    key={index}
                    answer={answer}
                    index={index}
                    isCorrect={question.correct === index}
                    isSelected={userAnswer === index}
                    showAnswers={showAnswers}
                    disabled={userAnswer !== undefined || showAnswers}
                    onClick={handleAnswerClick}
                    userAnswer={userAnswer}
                />
            ))}
        </div>
    )
}