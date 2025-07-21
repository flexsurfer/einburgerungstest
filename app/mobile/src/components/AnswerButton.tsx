import React, { memo } from 'react'
import { TouchableOpacity, Text, StyleSheet } from 'react-native'
import { Answer } from '../types'

interface AnswerButtonProps {
  answer: Answer
  index: number
  isCorrect: boolean
  isSelected: boolean
  showAnswers: boolean
  disabled: boolean
  onClick: (index: number) => void
  userAnswer: number | undefined
}

export const AnswerButton = memo<AnswerButtonProps>(({ answer, index, isCorrect, isSelected, showAnswers, disabled, onClick, userAnswer }) => {
  const handlePress = () => {
    if (!disabled) {
      onClick(index)
    }
  }

  const getButtonStyle = () => {
    if (showAnswers) {
      return isCorrect ? styles.correctButton : styles.defaultButton
    } else if (userAnswer !== undefined) {
      if (isSelected && !isCorrect) {
        return styles.incorrectButton
      } else if (isCorrect) {
        return styles.correctButton
      }
    }
    return styles.defaultButton
  }

  const getTextStyle = () => {
    if (showAnswers) {
      return isCorrect ? styles.correctText : styles.defaultText
    } else if (userAnswer !== undefined) {
      if (isSelected && !isCorrect) {
        return styles.incorrectText
      } else if (isCorrect) {
        return styles.correctText
      }
    }
    return styles.defaultText
  }

  return (
    <TouchableOpacity
      style={[styles.answerButton, getButtonStyle()]}
      onPress={handlePress}
      activeOpacity={0.7}
      disabled={disabled}
    >
      <Text style={[styles.answerText, getTextStyle()]}>
        {answer}
      </Text>
    </TouchableOpacity>
  )
})

const styles = StyleSheet.create({
  answerButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  answerText: {
    fontSize: 16,
    lineHeight: 22,
    color: '#2C3E50',
  },
  defaultButton: {
    backgroundColor: '#ffffff',
  },
  defaultText: {},
  correctButton: {
    backgroundColor: 'rgba(40, 167, 69, 0.1)',
    borderColor: '#28a745',
  },
  correctText: {
    color: '#28a745',
  },
  incorrectButton: {
    backgroundColor: 'rgba(231, 76, 60, 0.1)',
    borderColor: '#E74C3C',
  },
  incorrectText: {
    color: '#E74C3C',
  },
}) 