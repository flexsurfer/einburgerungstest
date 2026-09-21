import React, { memo } from "react";
import { TouchableOpacity, Text, StyleSheet, View } from "react-native";
import { Answer } from "../types";
import { type Colors, useColors } from "../theme";
import { useI18n } from "../i18n";

interface AnswerButtonProps {
  answer: Answer;
  translation?: string;
  index: number;
  isCorrect: boolean;
  isSelected: boolean;
  showAnswers: boolean;
  disabled: boolean;
  isExamMode: boolean;
  onClick: (index: number) => void;
  userAnswer: number | undefined;
  mistakeCount?: number;
  revealCorrectAnswer?: boolean;
}

export const AnswerButton = memo<AnswerButtonProps>(
  ({
    answer,
    translation,
    index,
    isCorrect,
    isSelected,
    showAnswers,
    disabled,
    isExamMode,
    onClick,
    userAnswer,
    mistakeCount = 0,
    revealCorrectAnswer = false,
  }) => {
    const { t } = useI18n("AnswerButton");
    const handlePress = () => {
      if (!disabled) {
        onClick(index);
      }
    };

    const getButtonStyle = () => {
      if (isExamMode) {
        return isSelected
          ? styles(themeColors).selectedButton
          : styles(themeColors).defaultButton;
      } else if (showAnswers || revealCorrectAnswer) {
        if (isCorrect) return styles(themeColors).correctButton;
        if (mistakeCount > 0) return styles(themeColors).mistakeButton;
      } else if (userAnswer !== undefined) {
        if (isSelected && !isCorrect) {
          return styles(themeColors).incorrectButton;
        } else if (isCorrect) {
          return styles(themeColors).correctButton;
        } else if (mistakeCount > 0) {
          return styles(themeColors).mistakeButton;
        }
      } else if (mistakeCount > 0) {
        return styles(themeColors).mistakeButton;
      }
      return styles(themeColors).defaultButton;
    };

    const getTextStyle = () => {
      if (isExamMode) {
        return isSelected
          ? styles(themeColors).selectedText
          : styles(themeColors).defaultText;
      } else if (showAnswers || revealCorrectAnswer) {
        if (isCorrect) return styles(themeColors).correctText;
        if (mistakeCount > 0) return styles(themeColors).mistakeText;
      } else if (userAnswer !== undefined) {
        if (isSelected && !isCorrect) {
          return styles(themeColors).incorrectText;
        } else if (isCorrect) {
          return styles(themeColors).correctText;
        } else if (mistakeCount > 0) {
          return styles(themeColors).mistakeText;
        }
      } else if (mistakeCount > 0) {
        return styles(themeColors).mistakeText;
      }
      return styles(themeColors).defaultText;
    };

    const themeColors = useColors() as Colors;

    return (
      <TouchableOpacity
        style={[styles(themeColors).answerButton, getButtonStyle()]}
        onPress={handlePress}
        activeOpacity={0.7}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityState={{ disabled, selected: isSelected }}
      >
        <View style={styles(themeColors).answerContent}>
          <Text style={[styles(themeColors).answerText, getTextStyle()]}>
            {answer}
          </Text>
          {translation ? (
            <Text style={styles(themeColors).translationText}>
              {translation}
            </Text>
          ) : null}
        </View>
        {mistakeCount > 0 ? (
          <View style={styles(themeColors).mistakeCount}>
            <Text style={styles(themeColors).mistakeCountText}>
              {mistakeCount}{" "}
              {mistakeCount === 1 ? t("mistake") : t("mistakesPlural")}
            </Text>
          </View>
        ) : null}
      </TouchableOpacity>
    );
  },
);

const styles = (colors: Colors) =>
  StyleSheet.create({
    answerButton: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 8,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: colors.borderColor,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
    },
    answerContent: {
      flex: 1,
    },
    answerText: {
      fontSize: 16,
      lineHeight: 22,
      fontWeight: "500",
      color: colors.textColor,
    },
    translationText: {
      fontSize: 13,
      lineHeight: 19,
      color: colors.textMutedColor,
      marginTop: 4,
    },
    defaultButton: {
      backgroundColor: colors.bgColor,
    },
    defaultText: {},
    selectedButton: {
      backgroundColor: colors.surfaceSoftColor,
      borderColor: colors.textMutedColor,
      borderWidth: 2,
    },
    selectedText: {
      color: colors.textColor,
      fontWeight: "700",
    },
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
    mistakeButton: {
      backgroundColor: colors.errorLight,
      borderColor: colors.errorColor,
    },
    mistakeText: {
      color: colors.errorColor,
    },
    mistakeCount: {
      backgroundColor: colors.errorLight,
      borderRadius: 999,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    mistakeCountText: {
      color: colors.textMutedColor,
      fontSize: 11,
      fontWeight: "500",
    },
  });
