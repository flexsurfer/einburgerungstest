import { memo, useCallback } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type ViewStyle,
} from "react-native";
import { appIds, useRuntime, useSubscription } from "@ebtest/shared/uklad";
import { useColors, type Colors } from "../theme";
import { HomeIcon } from "./Icons";
import { categoryDisplayName, useI18n } from "../i18n";

export const Header = memo(({ style }: { style?: ViewStyle }) => {
  const runtime = useRuntime();
  const colors = useColors();
  const { language, t } = useI18n("Header");
  const selectedCategory = useSubscription(
    [appIds.subscriptions.navigationSelectedCategory],
    "Header",
  );
  const questionCount = useSubscription(
    [appIds.subscriptions.practiceFilteredQuestionsCount],
    "Header",
  );
  const isLearnMode = useSubscription(
    [appIds.subscriptions.navigationIsLearnMode],
    "Header",
  );

  const openHome = useCallback(() => {
    runtime.dispatch([appIds.events.navigationHomeOpened]);
  }, [runtime]);

  const title =
    selectedCategory === null
      ? t("allQuestions")
      : selectedCategory === "favorites"
        ? t("savedQuestionsLower")
        : selectedCategory === "wrong"
          ? t("reviewMistakes")
          : selectedCategory === "unanswered"
            ? t("unattemptedQuestions")
            : selectedCategory === "test"
              ? t("mockExamLower")
              : categoryDisplayName(selectedCategory, language);

  return (
    <View style={[styles(colors).header, style]}>
      <TouchableOpacity
        accessibilityLabel={t("backToHome")}
        accessibilityRole="button"
        onPress={openHome}
        style={styles(colors).homeButton}
      >
        <HomeIcon color={colors.textMutedColor} size={22} />
      </TouchableOpacity>

      <View style={styles(colors).titleContainer}>
        <Text style={styles(colors).eyebrow}>
          {isLearnMode
            ? t("learnMode")
            : selectedCategory === "test"
              ? t("examMode")
              : t("practiceMode")}
        </Text>
        <Text numberOfLines={1} style={styles(colors).title}>
          {title} · {questionCount}
        </Text>
      </View>
    </View>
  );
});

const styles = (colors: Colors) =>
  StyleSheet.create({
    header: {
      minHeight: 68,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      backgroundColor: "transparent",
      paddingHorizontal: 16,
      paddingVertical: 10,
    },
    homeButton: {
      width: 48,
      height: 48,
      alignItems: "flex-start",
      justifyContent: "center",
    },
    titleContainer: {
      flex: 1,
      minWidth: 0,
    },
    eyebrow: {
      color: colors.textMutedColor,
      fontSize: 10,
      lineHeight: 14,
      fontWeight: "500",
      letterSpacing: 0.4,
      marginBottom: 1,
    },
    title: {
      color: colors.textMutedColor,
      fontSize: 14,
      lineHeight: 20,
      fontWeight: "500",
    },
  });
