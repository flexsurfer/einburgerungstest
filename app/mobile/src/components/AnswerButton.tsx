import React, { memo } from 'react'
import { TouchableOpacity, Text, StyleSheet } from 'react-native'
import { Answer } from '../types'
import { type Colors, useColors } from '../theme'

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
      return isCorrect ? styles(themeColors).correctButton : styles(themeColors).defaultButton
    } else if (userAnswer !== undefined) {
      if (isSelected && !isCorrect) {
        return styles(themeColors).incorrectButton
      } else if (isCorrect) {
        return styles(themeColors).correctButton
      }
    }
    return styles(themeColors).defaultButton
  }

  const getTextStyle = () => {
    if (showAnswers) {
      return isCorrect ? styles(themeColors).correctText : styles(themeColors).defaultText
    } else if (userAnswer !== undefined) {
      if (isSelected && !isCorrect) {
        return styles(themeColors).incorrectText
      } else if (isCorrect) {
        return styles(themeColors).correctText
      }
    }
    return styles(themeColors).defaultText
  }

  const themeColors = useColors() as Colors

  return (
    <TouchableOpacity
      style={[styles(themeColors).answerButton, getButtonStyle()]}
      onPress={handlePress}
      activeOpacity={0.7}
      disabled={disabled}
    >
      <Text style={[styles(themeColors).answerText, getTextStyle()]}>
        {answer}
      </Text>
    </TouchableOpacity>
  )
})

const styles = (colors: Colors) => StyleSheet.create({
  answerButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.borderColor,
  },
  answerText: {
    fontSize: 16,
    lineHeight: 22,
    color: colors.textColor,
  },
  defaultButton: {
    backgroundColor: colors.bgColor,
  },
  defaultText: {},
  correctButton: {
    backgroundColor: colors.successLight,
    borderColor: colors.successColor,
  },
  correctText: {
    color: colors.successColor,
  },
  incorrectButton: {
    backgroundColor: colors.errorLight,
    borderColor: colors.errorColor,
  },
  incorrectText: {
    color: colors.errorColor,
  },
}) 