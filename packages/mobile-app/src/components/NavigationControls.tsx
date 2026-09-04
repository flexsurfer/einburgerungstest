import React, { memo, useCallback } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { appIds, useRuntime, useSubscription } from "@ebtest/shared/uklad";
import { useColors, type Colors } from "../theme";
import { LeftArrow, RightArrow, DownArrow } from "./Icons";
import {
  ExamAnsweredProgress,
  ExamTimer,
  FinishExamButton,
} from "./ExamSessionControls";
import { useI18n } from "../i18n";

interface NavigationControlsProps {
  isVisible?: boolean;
}

export const NavigationControls = memo<NavigationControlsProps>(
  ({ isVisible = true }) => {
    const runtime = useRuntime();
    const colors = useColors();
    const { t } = useI18n("NavigationControls");

    const currentQuestionIndex = useSubscription(
      [appIds.subscriptions.navigationCurrentQuestionIndex],
      "NavigationControls",
    );
    const filteredQuestionsCount = useSubscription(
      [appIds.subscriptions.practiceFilteredQuestionsCount],
      "NavigationControls",
    );
    const isTestMode = useSubscription(
      [appIds.subscriptions.navigationIsTestMode],
      "NavigationControls",
    );

    const currentIndex = currentQuestionIndex || 0;
    const isFirstQuestion = currentIndex === 0;
    const isLastQuestion = currentIndex === filteredQuestionsCount - 1;

    const handlePrevious = useCallback(() => {
      if (!isFirstQuestion) {
        runtime.dispatch([appIds.events.navigationPrevious]);
      }
    }, [runtime, isFirstQuestion]);

    const handleNext = useCallback(() => {
      if (!isLastQuestion) {
        runtime.dispatch([appIds.events.navigationNext]);
      }
    }, [runtime, isLastQuestion]);

    const handleQuestionNumberPress = useCallback(() => {
      runtime.dispatch([appIds.events.navigationQuestionPickerShown, true]);
    }, [runtime]);

    if (!isVisible) {
      return null;
    }

    const navigationRow = (
      <View style={styles(colors).container}>
        <TouchableOpacity
          style={[
            styles(colors).navButton,
            isFirstQuestion && styles(colors).disabledButton,
          ]}
          onPress={handlePrevious}
          disabled={isFirstQuestion}
          accessibilityLabel={t("previousQuestion")}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <LeftArrow
              color={
                isFirstQuestion ? colors.disabledText : colors.primaryTextColor
              }
            />
            <Text
              style={[
                styles(colors).navButtonText,
                isFirstQuestion && styles(colors).disabledButtonText,
              ]}
            >
              {t("previous")}
            </Text>
          </View>
        </TouchableOpacity>

        {isTestMode ? (
          <ExamTimer />
        ) : (
          <TouchableOpacity
            style={styles(colors).questionNumberButton}
            onPress={handleQuestionNumberPress}
          >
            <Text style={styles(colors).questionNumberText}>
              {t("itemOfTotal", {
                current: currentIndex + 1,
                total: filteredQuestionsCount,
              })}
            </Text>
            <DownArrow color={colors.primaryColor} />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[
            styles(colors).navButton,
            isLastQuestion && styles(colors).disabledButton,
          ]}
          onPress={handleNext}
          disabled={isLastQuestion}
          accessibilityLabel={t("nextQuestion")}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text
              style={[
                styles(colors).navButtonText,
                isLastQuestion && styles(colors).disabledButtonText,
              ]}
            >
              {t("next")}
            </Text>
            <RightArrow
              color={
                isLastQuestion ? colors.disabledText : colors.primaryTextColor
              }
            />
          </View>
        </TouchableOpacity>
      </View>
    );

    if (isTestMode) {
      return (
        <View style={styles(colors).examContainer}>
          {navigationRow}
          <ExamAnsweredProgress />
          <FinishExamButton />
        </View>
      );
    }

    return navigationRow;
  },
);

const styles = (colors: Colors) =>
  StyleSheet.create({
    examContainer: {
      paddingBottom: 14,
      backgroundColor: "transparent",
    },
    container: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingTop: 10,
      paddingBottom: 14,
      backgroundColor: "transparent",
    },
    navButton: {
      minHeight: 44,
      paddingHorizontal: 10,
      paddingVertical: 9,
      borderRadius: 14,
      backgroundColor: colors.primaryColor,
      minWidth: 80,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: colors.primaryDarkColor,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.18,
      shadowRadius: 8,
      elevation: 3,
    },
    disabledButton: {
      backgroundColor: colors.disabledBg,
      opacity: 0.82,
      shadowOpacity: 0,
      elevation: 0,
    },
    navButtonText: {
      color: colors.primaryTextColor,
      fontSize: 16,
      fontWeight: "600",
    },
    disabledButtonText: {
      color: colors.textColor,
    },
    questionNumberButton: {
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "row",
      paddingHorizontal: 10,
      paddingVertical: 9,
      borderRadius: 14,
      backgroundColor: colors.surfaceColor,
      borderWidth: 1,
      borderColor: colors.borderColor,
      minWidth: 100,
      minHeight: 44,
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.12,
      shadowRadius: 7,
      elevation: 2,
    },
    questionNumberText: {
      color: colors.primaryColor,
      fontSize: 14,
      fontWeight: "bold",
      marginRight: 4,
    },
    totalQuestionsText: {
      color: colors.textColor,
      fontSize: 10,
      opacity: 0.6,
      marginTop: 2,
    },
  });
