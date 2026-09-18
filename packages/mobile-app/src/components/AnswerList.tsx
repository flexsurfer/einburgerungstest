import React, { memo, useCallback } from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { AnswerButton } from "./AnswerButton";
import { Question } from "../types";
import { appIds, useRuntime, useSubscription } from "@ebtest/shared/uklad";
import { useColors } from "../theme";
import { useI18n } from "../i18n";

interface AnswerListProps {
  question: Question;
  translatedAnswers?: string[];
}

export const AnswerList = memo<AnswerListProps>(
  ({ question, translatedAnswers }) => {
    const runtime = useRuntime();
    const { t } = useI18n("AnswerList");

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
    const mistakeSummary = useSubscription(
      [
        appIds.subscriptions.practiceMistakeSummaryByQuestionIndex,
        question.globalIndex,
      ],
      "AnswerList",
    );
    const isTestMode = useSubscription(
      [appIds.subscriptions.navigationIsTestMode],
      "AnswerList",
    );
    const isLearnMode = useSubscription(
      [appIds.subscriptions.navigationIsLearnMode],
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

    const wrongAnswersMode = selectedCategory === "wrong";

    const handleAnswerAction = useCallback(() => {
      runtime.dispatch([
        wrongAnswersMode
          ? appIds.events.practiceMistakeRemoved
          : appIds.events.practiceQuestionAnswerCleared,
        question.globalIndex,
      ]);
    }, [runtime, wrongAnswersMode, question.globalIndex]);

    const themeColors = useColors();
    const showAnswerAction =
      !isTestMode &&
      !isLearnMode &&
      (wrongAnswersMode
        ? mistakeSummary.totalAttempts > 0
        : userAnswer !== undefined);

    return (
      <View style={styles.answerList}>
        {wrongAnswersMode && mistakeSummary.totalAttempts > 0 ? (
          <Text
            style={[styles.mistakeSummary, { color: themeColors.errorColor }]}
          >
            {t("wrongAttempts", { count: mistakeSummary.totalAttempts })}
          </Text>
        ) : null}
        {question.answers.map((answer, index) => (
          <AnswerButton
            key={index}
            answer={answer}
            translation={translatedAnswers?.[index]}
            index={index}
            isCorrect={question.correct === index}
            isSelected={userAnswer === index}
            showAnswers={showAnswers}
            revealCorrectAnswer={wrongAnswersMode}
            disabled={
              isTestMode
                ? testSessionStatus !== "in-progress" || showAnswers
                : wrongAnswersMode || userAnswer !== undefined || showAnswers
            }
            isExamMode={isTestMode}
            onClick={handleAnswerClick}
            userAnswer={userAnswer}
            mistakeCount={
              wrongAnswersMode ? (mistakeSummary.answerCounts[index] ?? 0) : 0
            }
          />
        ))}
        {showAnswerAction && (
          <TouchableOpacity
            style={[
              styles.clearButton,
              {
                borderColor: wrongAnswersMode
                  ? themeColors.errorColor
                  : themeColors.accentColor,
                backgroundColor: "transparent",
              },
            ]}
            onPress={handleAnswerAction}
          >
            <Text
              style={[
                styles.clearButtonText,
                {
                  color: wrongAnswersMode
                    ? themeColors.errorColor
                    : themeColors.accentColor,
                },
              ]}
            >
              {wrongAnswersMode ? t("removeFromMistakes") : t("clearAnswer")}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  },
);

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
  mistakeSummary: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 10,
  },
});
