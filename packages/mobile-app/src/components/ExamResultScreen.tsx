import { memo, useCallback } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  appIds,
  useRuntime,
  useSubscription,
  type TestSessionResult,
} from "@ebtest/shared/uklad";
import { useColors, type Colors } from "../theme";

function ResultStat({
  color,
  label,
  value,
  colors,
}: {
  color: string;
  label: string;
  value: number;
  colors: Colors;
}) {
  const styleSheet = styles(colors);
  return (
    <View style={styleSheet.stat}>
      <View style={[styleSheet.statDot, { backgroundColor: color }]} />
      <Text style={styleSheet.statValue}>{value}</Text>
      <Text style={styleSheet.statLabel}>{label}</Text>
    </View>
  );
}

export const ExamResultScreen = memo(() => {
  const runtime = useRuntime();
  const colors = useColors();
  const result = useSubscription(
    [appIds.subscriptions.testSessionResult],
    "ExamResultScreen",
  ) as TestSessionResult;
  const finishReason = useSubscription(
    [appIds.subscriptions.testSessionFinishReason],
    "ExamResultScreen",
  );
  const styleSheet = styles(colors);

  const goHome = useCallback(() => {
    runtime.dispatch([appIds.events.navigationHomeOpened]);
  }, [runtime]);

  const startAgain = useCallback(() => {
    runtime.dispatch([appIds.events.testSessionStarted]);
  }, [runtime]);

  return (
    <ScrollView
      contentContainerStyle={styleSheet.scrollContent}
      showsVerticalScrollIndicator={false}
      style={styleSheet.screen}
    >
      <View style={styleSheet.card}>
        <Text style={styleSheet.eyebrow}>EXAM RESULT</Text>
        <View
          style={[
            styleSheet.scoreCircle,
            result.passed
              ? styleSheet.scoreCirclePassed
              : styleSheet.scoreCircleFailed,
          ]}
        >
          <Text style={styleSheet.scoreValue}>{result.correct}</Text>
          <Text style={styleSheet.scoreTotal}>of {result.total}</Text>
        </View>

        <Text style={styleSheet.title}>
          {result.passed ? "You passed" : "Not passed yet"}
        </Text>
        <Text style={styleSheet.message}>
          {finishReason === "time-expired"
            ? "Time is up. Your saved answers have been evaluated."
            : "Your saved answers have been evaluated."}
        </Text>

        <View style={styleSheet.requirement}>
          <Text style={styleSheet.requirementValue}>
            {result.requiredCorrect}
          </Text>
          <Text style={styleSheet.requirementText}>
            correct answers are required to pass the official test.
          </Text>
        </View>

        <View style={styleSheet.statsRow}>
          <ResultStat
            color={colors.successColor}
            colors={colors}
            label="Correct"
            value={result.correct}
          />
          <ResultStat
            color={colors.errorColor}
            colors={colors}
            label="Incorrect"
            value={result.incorrect}
          />
          <ResultStat
            color={colors.textMutedColor}
            colors={colors}
            label="Unanswered"
            value={result.unanswered}
          />
        </View>

        <TouchableOpacity
          accessibilityRole="button"
          activeOpacity={0.82}
          onPress={startAgain}
          style={styleSheet.primaryButton}
        >
          <Text style={styleSheet.primaryButtonText}>Take another exam</Text>
        </TouchableOpacity>
        <TouchableOpacity
          accessibilityRole="button"
          activeOpacity={0.76}
          onPress={goHome}
          style={styleSheet.secondaryButton}
        >
          <Text style={styleSheet.secondaryButtonText}>Back to home</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
});

const styles = (colors: Colors) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: "transparent",
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 32,
      justifyContent: "center",
    },
    card: {
      width: "100%",
      maxWidth: 560,
      alignSelf: "center",
      paddingHorizontal: 22,
      paddingVertical: 28,
      borderRadius: 22,
      borderWidth: 1,
      borderColor: colors.borderColor,
      backgroundColor: colors.surfaceColor,
      alignItems: "center",
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.16,
      shadowRadius: 18,
      elevation: 5,
    },
    eyebrow: {
      color: colors.primaryColor,
      fontSize: 10,
      lineHeight: 14,
      fontWeight: "800",
      letterSpacing: 1.4,
      marginBottom: 18,
    },
    scoreCircle: {
      width: 124,
      height: 124,
      borderRadius: 62,
      borderWidth: 8,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 18,
    },
    scoreCirclePassed: {
      borderColor: colors.successColor,
      backgroundColor: colors.successLight,
    },
    scoreCircleFailed: {
      borderColor: colors.errorColor,
      backgroundColor: colors.errorLight,
    },
    scoreValue: {
      color: colors.textColor,
      fontSize: 42,
      lineHeight: 46,
      fontWeight: "900",
    },
    scoreTotal: {
      color: colors.textMutedColor,
      fontSize: 13,
      lineHeight: 17,
      fontWeight: "600",
    },
    title: {
      color: colors.textColor,
      fontSize: 26,
      lineHeight: 32,
      fontWeight: "800",
      textAlign: "center",
    },
    message: {
      maxWidth: 390,
      color: colors.textMutedColor,
      fontSize: 14,
      lineHeight: 21,
      textAlign: "center",
      marginTop: 7,
    },
    requirement: {
      width: "100%",
      marginTop: 22,
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderRadius: 14,
      backgroundColor: colors.primaryPale,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    requirementValue: {
      color: colors.primaryColor,
      fontSize: 26,
      lineHeight: 30,
      fontWeight: "900",
    },
    requirementText: {
      flex: 1,
      color: colors.textColor,
      fontSize: 13,
      lineHeight: 18,
      fontWeight: "600",
    },
    statsRow: {
      width: "100%",
      flexDirection: "row",
      marginVertical: 24,
      gap: 8,
    },
    stat: {
      flex: 1,
      minWidth: 0,
      alignItems: "center",
      paddingHorizontal: 4,
      paddingVertical: 12,
      borderWidth: 1,
      borderColor: colors.borderColor,
      borderRadius: 13,
      backgroundColor: colors.bgColor,
    },
    statDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginBottom: 6,
    },
    statValue: {
      color: colors.textColor,
      fontSize: 21,
      lineHeight: 25,
      fontWeight: "800",
    },
    statLabel: {
      color: colors.textMutedColor,
      fontSize: 10,
      lineHeight: 14,
      fontWeight: "600",
      marginTop: 2,
    },
    primaryButton: {
      width: "100%",
      minHeight: 48,
      borderRadius: 14,
      backgroundColor: colors.primaryColor,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 18,
      paddingVertical: 12,
    },
    primaryButtonText: {
      color: colors.primaryTextColor,
      fontSize: 15,
      lineHeight: 20,
      fontWeight: "800",
    },
    secondaryButton: {
      width: "100%",
      minHeight: 46,
      marginTop: 9,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.borderColor,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 18,
      paddingVertical: 11,
    },
    secondaryButtonText: {
      color: colors.textColor,
      fontSize: 14,
      lineHeight: 19,
      fontWeight: "700",
    },
  });
