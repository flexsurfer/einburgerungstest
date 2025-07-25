import React, { memo, useCallback } from 'react'
import { View, StyleSheet } from 'react-native'
import { AnswerButton } from './AnswerButton'
import { Question } from '../types'
import { useSubscription } from '@flexsurfer/reflex'
import { dispatch } from '@flexsurfer/reflex'
import { EVENT_IDS } from 'shared/event-ids'
import { SUB_IDS } from 'shared/sub-ids'

interface AnswerListProps {
    question: Question
}

export const AnswerList = memo<AnswerListProps>(({ question }) => {

    const showAnswers = useSubscription<boolean>([SUB_IDS.SHOW_ANSWERS])
    const userAnswer = useSubscription([SUB_IDS.USER_ANSWER_BY_QUESTION_INDEX, question.globalIndex]) as number | undefined


    const handleAnswerClick = useCallback((index: number) => {
        if (!showAnswers && userAnswer === undefined) {
            dispatch([EVENT_IDS.ANSWER_QUESTION, question.globalIndex, index])
        }
    }, [showAnswers, userAnswer, question.globalIndex])

    return (
        <View style={styles.answerList}>
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
        </View>
    )
})

const styles = StyleSheet.create({
    answerList: {
        marginTop: 8,
    },
}) 