import { memo, useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import {
  appIds,
  useRuntime,
  useSubscription,
  type TestSessionResult,
} from "@ebtest/shared/uklad";
import { useColors, type Colors } from "../theme";
import { examSecondsRemaining, formatExamTime } from "../exam-time";
import { ClockIcon } from "./Icons";
import { useI18n } from "../i18n";

function useExamCountdown(): number {
  const runtime = useRuntime();
  const status = useSubscription(
    [appIds.subscriptions.testSessionStatus],
    "ExamTimer",
  );
  const endsAt = useSubscription(
    [appIds.subscriptions.testSessionEndsAt],
    "ExamTimer",
  );
  const [remainingSeconds, setRemainingSeconds] = useState(() =>
    endsAt === null ? 0 : examSecondsRemaining(endsAt, Date.now()),
  );
  const expiryDispatched = useRef(false);

  useEffect(() => {
    expiryDispatched.current = false;
    if (status !== "in-progress" || endsAt === null) return;

    const update = () => {
      const nextRemaining = examSecondsRemaining(endsAt, Date.now());
      setRemainingSeconds(nextRemaining);
      if (nextRemaining === 0 && !expiryDispatched.current) {
        expiryDispatched.current = true;
        runtime.dispatch([appIds.events.testSessionFinished, "time-expired"]);
      }
    };

    update();
    const interval = setInterval(update, 250);
    return () => clearInterval(interval);
  }, [endsAt, runtime, status]);

  return remainingSeconds;
}

export const ExamTimer = memo(() => {
  const colors = useColors();
  const { t } = useI18n("ExamTimer");
  const remainingSeconds = useExamCountdown();
  const isUrgent = remainingSeconds <= 5 * 60;
  const styleSheet = styles(colors);

  return (
    <View
      accessibilityLabel={t("timeRemainingValue", {
        time: formatExamTime(remainingSeconds),
      })}
      accessibilityRole="timer"
      style={[styleSheet.timer, isUrgent && styleSheet.timerUrgent]}
    >
      <ClockIcon
        color={isUrgent ? colors.errorColor : colors.primaryColor}
        size={18}
      />
      <Text
        style={[styleSheet.timerText, isUrgent && styleSheet.timerTextUrgent]}
      >
        {formatExamTime(remainingSeconds)}
      </Text>
    </View>
  );
});

export const FinishExamButton = memo(
  ({ compact = false }: { compact?: boolean }) => {
    const runtime = useRuntime();
    const colors = useColors();
    const { t } = useI18n("FinishExamButton");
    const styleSheet = styles(colors);
    const finishExam = useCallback(() => {
      runtime.dispatch([appIds.events.testSessionFinished, "finished"]);
    }, [runtime]);

    return (
      <TouchableOpacity
        accessibilityLabel={t("finishExamAccessibility")}
        accessibilityRole="button"
        activeOpacity={0.82}
        onPress={finishExam}
        style={[
          styleSheet.finishButton,
          compact && styleSheet.finishButtonCompact,
        ]}
      >
        <Text style={styleSheet.finishButtonText}>{t("finishExam")}</Text>
      </TouchableOpacity>
    );
  },
);

export const ExamAnsweredProgress = memo(
  ({ compact = false }: { compact?: boolean }) => {
    const colors = useColors();
    const { t } = useI18n("ExamAnsweredProgress");
    const result = useSubscription(
      [appIds.subscriptions.testSessionResult],
      "ExamAnsweredProgress",
    ) as TestSessionResult;
    const styleSheet = styles(colors);
    const progress =
      result.total === 0
        ? 0
        : Math.min(100, Math.round((result.answered / result.total) * 100));

    return (
      <View
        accessibilityLabel={t("answeredProgress", {
          answered: result.answered,
          total: result.total,
        })}
        accessibilityRole="progressbar"
        accessibilityValue={{
          min: 0,
          max: result.total,
          now: result.answered,
          text: t("answeredProgressShort", {
            answered: result.answered,
            total: result.total,
          }),
        }}
        style={[
          styleSheet.progressContainer,
          compact && styleSheet.progressContainerCompact,
        ]}
      >
        <View style={styleSheet.progressTrack}>
          <View style={[styleSheet.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styleSheet.progressValue}>
          {result.answered} / {result.total}
        </Text>
      </View>
    );
  },
);

export const TabletExamControls = memo(() => {
  const colors = useColors();
  const { t } = useI18n("TabletExamControls");
  const styleSheet = styles(colors);

  return (
    <View style={styleSheet.tabletBar}>
      <View>
        <Text style={styleSheet.tabletEyebrow}>{t("timeRemaining")}</Text>
        <ExamTimer />
      </View>
      <ExamAnsweredProgress compact />
      <FinishExamButton compact />
    </View>
  );
});

const styles = (colors: Colors) =>
  StyleSheet.create({
    timer: {
      minWidth: 100,
      minHeight: 44,
      paddingHorizontal: 12,
      paddingVertical: 9,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.borderColor,
      backgroundColor: colors.surfaceColor,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 7,
    },
    timerUrgent: {
      borderColor: colors.errorColor,
      backgroundColor: colors.errorLight,
    },
    timerText: {
      color: colors.primaryColor,
      fontSize: 16,
      lineHeight: 20,
      fontWeight: "800",
      fontVariant: ["tabular-nums"],
    },
    timerTextUrgent: {
      color: colors.errorColor,
    },
    finishButton: {
      minHeight: 44,
      marginHorizontal: 16,
      paddingHorizontal: 18,
      paddingVertical: 11,
      borderRadius: 14,
      backgroundColor: colors.primaryColor,
      alignItems: "center",
      justifyContent: "center",
    },
    finishButtonCompact: {
      minWidth: 150,
      marginHorizontal: 0,
    },
    finishButtonText: {
      color: colors.primaryTextColor,
      fontSize: 15,
      lineHeight: 20,
      fontWeight: "800",
    },
    progressContainer: {
      marginHorizontal: 16,
      marginBottom: 10,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    progressContainerCompact: {
      flex: 1,
      marginHorizontal: 18,
      marginBottom: 0,
    },
    progressValue: {
      minWidth: 42,
      color: colors.blueColor,
      fontSize: 12,
      lineHeight: 15,
      fontWeight: "800",
      fontVariant: ["tabular-nums"],
      textAlign: "right",
    },
    progressTrack: {
      flex: 1,
      height: 7,
      borderRadius: 4,
      backgroundColor: colors.surfaceSoftColor,
      overflow: "hidden",
    },
    progressFill: {
      height: "100%",
      borderRadius: 4,
      backgroundColor: colors.blueColor,
    },
    tabletBar: {
      marginHorizontal: 20,
      marginTop: 6,
      padding: 14,
      borderWidth: 1,
      borderColor: colors.borderColor,
      borderRadius: 16,
      backgroundColor: colors.surfaceColor,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    tabletEyebrow: {
      color: colors.textMutedColor,
      fontSize: 9,
      lineHeight: 12,
      fontWeight: "800",
      letterSpacing: 1,
      marginBottom: 4,
    },
  });
