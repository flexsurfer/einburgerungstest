import React, { memo, useCallback } from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { AnswerButton } from "./AnswerButton";
import { Question } from "../types";
import { appIds, useRuntime, useSubscription } from "@ebtest/shared/uklad";
import { useColors } from "../theme";

interface AnswerListProps {
  question: Question;
}

export const AnswerList = memo<AnswerListProps>(({ question }) => {
  const runtime = useRuntime();

  const showAnswers = useSubscription(
    [appIds.subscriptions.uiShowAnswers],
    "AnswerList",
  );
  const userAnswer = useSubscription(
    [
      appIds.subscriptions.practiceUserAnswerByQuestionIndex,
      question.globalIndex,
    ],
    "AnswerList",
  );
  const isTestMode = useSubscription(
    [appIds.subscriptions.navigationIsTestMode],
    "AnswerList",
  );
  const selectedCategory = useSubscription(
    [appIds.subscriptions.navigationSelectedCategory],
    "AnswerList",
  );
  const testSessionStatus = useSubscription(
    [appIds.subscriptions.testSessionStatus],
    "AnswerList",
  );

  const handleAnswerClick = useCallback(
    (index: number) => {
      if (isTestMode && testSessionStatus === "in-progress") {
        runtime.dispatch([
          appIds.events.testSessionAnswerSelected,
          question.globalIndex,
          index,
        ]);
        return;
      }

      if (!showAnswers && userAnswer === undefined) {
        runtime.dispatch([
          appIds.events.practiceQuestionAnswered,
          question.globalIndex,
          index,
        ]);
      }
    },
    [
      runtime,
      showAnswers,
      userAnswer,
      isTestMode,
      testSessionStatus,
      question.globalIndex,
    ],
  );

  const handleClearAnswer = useCallback(() => {
    runtime.dispatch([
      appIds.events.practiceQuestionAnswerCleared,
      question.globalIndex,
    ]);
  }, [runtime, question.globalIndex]);

  const themeColors = useColors();
  const isIncorrect =
    !isTestMode &&
    userAnswer !== undefined &&
    userAnswer !== question.correct &&
    !showAnswers;
  const wrongAnswersMode = selectedCategory === "wrong";

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
          disabled={
            isTestMode
              ? testSessionStatus !== "in-progress" || showAnswers
              : userAnswer !== undefined || showAnswers
          }
          isExamMode={isTestMode}
          onClick={handleAnswerClick}
          userAnswer={userAnswer}
        />
      ))}
      {isIncorrect && (
        <TouchableOpacity
          style={[
            styles.clearButton,
            {
              borderColor: themeColors.accentColor,
              backgroundColor: "transparent",
            },
          ]}
          onPress={handleClearAnswer}
        >
          <Text
            style={[styles.clearButtonText, { color: themeColors.accentColor }]}
          >
            {wrongAnswersMode ? "Clear answer" : "Try again"}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  answerList: {
    marginTop: 8,
  },
  clearButton: {
    marginTop: 16,
    padding: 12,
    borderWidth: 1,
    borderRadius: 4,
    alignItems: "center",
  },
  clearButtonText: {
    fontSize: 14,
  },
});
