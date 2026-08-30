import React, { memo, useCallback } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import {
  appIds,
  useRuntime,
  useSubscription,
} from "@ebtest/shared/uklad";
import { useColors, type Colors } from "../theme";
import { LeftArrow, RightArrow, DownArrow } from "./Icons";

interface NavigationControlsProps {
  isVisible?: boolean;
}

export const NavigationControls = memo<NavigationControlsProps>(
  ({ isVisible = true }) => {
    const runtime = useRuntime();
    const colors = useColors();

    const currentQuestionIndex = useSubscription(
      [appIds.subscriptions.navigationCurrentQuestionIndex],
      "NavigationControls",
    );
    const filteredQuestionsCount = useSubscription(
      [appIds.subscriptions.practiceFilteredQuestionsCount],
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

    return (
      <View style={styles(colors).container}>
        <TouchableOpacity
          style={[
            styles(colors).navButton,
            isFirstQuestion && styles(colors).disabledButton,
          ]}
          onPress={handlePrevious}
          disabled={isFirstQuestion}
          accessibilityLabel="Previous question"
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <LeftArrow
              color={isFirstQuestion ? colors.textColor : colors.bgColor}
            />
            <Text
              style={[
                styles(colors).navButtonText,
                isFirstQuestion && styles(colors).disabledButtonText,
              ]}
            >
              Prev
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles(colors).questionNumberButton}
          onPress={handleQuestionNumberPress}
        >
          <Text style={styles(colors).questionNumberText}>
            {currentIndex + 1} of {filteredQuestionsCount}
          </Text>
          <DownArrow color={colors.accentColor} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles(colors).navButton,
            isLastQuestion && styles(colors).disabledButton,
          ]}
          onPress={handleNext}
          disabled={isLastQuestion}
          accessibilityLabel="Next question"
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text
              style={[
                styles(colors).navButtonText,
                isLastQuestion && styles(colors).disabledButtonText,
              ]}
            >
              Next
            </Text>
            <RightArrow
              color={isLastQuestion ? colors.textColor : colors.bgColor}
            />
          </View>
        </TouchableOpacity>
      </View>
    );
  },
);

const styles = (colors: Colors) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: colors.bgColor,
    },
    navButton: {
      paddingHorizontal: 8,
      paddingVertical: 6,
      borderRadius: 8,
      backgroundColor: colors.accentColor,
      minWidth: 80,
      alignItems: "center",
    },
    disabledButton: {
      backgroundColor: colors.borderColor,
      opacity: 0.5,
    },
    navButtonText: {
      color: colors.bgColor,
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
      paddingVertical: 6,
      borderRadius: 12,
      backgroundColor: colors.bgColor,
      borderWidth: 2,
      borderColor: colors.accentColor,
      minWidth: 100,
    },
    questionNumberText: {
      color: colors.accentColor,
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
