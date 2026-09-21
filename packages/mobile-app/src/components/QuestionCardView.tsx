import React, { memo } from "react";
import { View, Text, StyleSheet, useWindowDimensions } from "react-native";
import { appIds, useSubscription } from "@ebtest/shared/uklad";
import { useColors, type Colors } from "../theme";
import { QuestionCard } from "./QuestionCard";
import { NavigationControls } from "./NavigationControls";
import { QuestionPicker } from "./QuestionPicker";
import { Question } from "../types";
import { useI18n } from "../i18n";

export const QuestionCardView = memo(() => {
  const currentQuestion = useSubscription(
    [appIds.subscriptions.navigationCurrentQuestion],
    "QuestionCardView",
  ) as Question | null;
  const colors = useColors();
  const { t } = useI18n("QuestionCardView");
  const dimensions = useWindowDimensions();

  const filteredQuestions = useSubscription(
    [appIds.subscriptions.practiceFilteredQuestions],
    "QuestionView",
  ) as Question[];

  if (!filteredQuestions || filteredQuestions.length === 0) {
    return (
      <View style={styles(colors).emptyContainer}>
        <Text style={styles(colors).emptyText}>{t("noQuestions")}</Text>
      </View>
    );
  }

  if (!currentQuestion) {
    return (
      <View style={styles(colors).emptyContainer}>
        <Text style={styles(colors).emptyText}>{t("loadingQuestion")}</Text>
      </View>
    );
  }

  return (
    <View style={styles(colors).phoneContainer}>
      <QuestionCard
        key={currentQuestion.globalIndex}
        question={currentQuestion}
        isTablet={false}
        numColumns={1}
        screenWidth={dimensions.width}
        gap={0}
        scrollable
      />
      <NavigationControls isVisible={true} />
      <QuestionPicker />
    </View>
  );
});

const styles = (colors: Colors) =>
  StyleSheet.create({
    phoneContainer: {
      flex: 1,
      backgroundColor: "transparent",
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 20,
    },
    emptyText: {
      fontSize: 16,
      color: colors.textColor,
      opacity: 0.6,
      textAlign: "center",
    },
  });
