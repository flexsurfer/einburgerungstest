import React, { memo, useCallback, useState } from 'react'
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native'
import { AnswerButton } from './AnswerButton'
import { Question } from '../types'
import { useSubscription } from '@flexsurfer/reflex'
import { dispatch } from '@flexsurfer/reflex'
import { EVENT_IDS } from 'shared/event-ids'
import { SUB_IDS } from 'shared/sub-ids'
import { useColors } from '../theme'

interface AnswerListProps {
    question: Question
}

export const AnswerList = memo<AnswerListProps>(({ question }) => {

    const showAnswers = useSubscription<boolean>([SUB_IDS.SHOW_ANSWERS], "AnswerList")
    const userAnswer = useSubscription([SUB_IDS.USER_ANSWER_BY_QUESTION_INDEX, question.globalIndex], "AnswerList") as number | undefined
    const isTestMode = useSubscription([SUB_IDS.IS_TEST_MODE], "AnswerList") as boolean
    const selectedCategory = useSubscription([SUB_IDS.SELECTED_CATEGORY], "AnswerList")

    const handleAnswerClick = useCallback((index: number) => {
        if (!showAnswers && userAnswer === undefined) {
            dispatch([EVENT_IDS.ANSWER_QUESTION, question.globalIndex, index])
        }
    }, [showAnswers, userAnswer, question.globalIndex])

    const handleClearAnswer = useCallback(() => {
        dispatch([EVENT_IDS.CLEAR_QUESTION_ANSWER, question.globalIndex])
    }, [question.globalIndex])

    const themeColors = useColors()
    const isIncorrect = !isTestMode &&  userAnswer !== undefined && userAnswer !== question.correct && !showAnswers;
    const wrongAnswersMode = selectedCategory === 'wrong'
    
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
            {isIncorrect && (
                <TouchableOpacity
                    style={[styles.clearButton, { borderColor: themeColors.accentColor, backgroundColor:'transparent' }]}
                    onPress={handleClearAnswer}
                >
                    <Text style={[styles.clearButtonText, { color: themeColors.accentColor }]}>{wrongAnswersMode ? 'Clear answer' : 'Try again'}</Text>
                </TouchableOpacity>
            )}
        </View>
    )
})

const styles = StyleSheet.create({
    answerList: {
        marginTop: 8,
    },
    clearButton: {
        marginTop: 16,
        padding: 12,
        borderWidth: 1,
        borderRadius: 4,
        alignItems: 'center',
    },
    clearButtonText: {
        fontSize: 14,
    },
}) 