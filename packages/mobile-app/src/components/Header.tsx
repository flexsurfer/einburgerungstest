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

export const Header = memo(({ style }: { style?: ViewStyle }) => {
  const runtime = useRuntime();
  const colors = useColors();
  const selectedCategory = useSubscription(
    [appIds.subscriptions.navigationSelectedCategory],
    "Header",
  );
  const questionCount = useSubscription(
    [appIds.subscriptions.practiceFilteredQuestionsCount],
    "Header",
  );

  const openHome = useCallback(() => {
    runtime.dispatch([appIds.events.navigationHomeOpened]);
  }, [runtime]);

  const title =
    selectedCategory === null
      ? "All questions"
      : selectedCategory === "favorites"
        ? "Saved questions"
        : selectedCategory === "wrong"
          ? "Review mistakes"
          : selectedCategory === "unanswered"
            ? "Unattempted questions"
            : selectedCategory === "test"
              ? "Mock exam"
              : selectedCategory;

  return (
    <View style={[styles(colors).header, style]}>
      <TouchableOpacity
        accessibilityLabel="Back to home"
        accessibilityRole="button"
        onPress={openHome}
        style={styles(colors).homeButton}
      >
        <HomeIcon color={colors.primaryColor} size={28} />
      </TouchableOpacity>

      <View style={styles(colors).titleContainer}>
        <Text style={styles(colors).eyebrow}>
          {selectedCategory === "test" ? "EXAM MODE" : "PRACTICE"}
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
      color: colors.primaryColor,
      fontSize: 10,
      lineHeight: 14,
      fontWeight: "800",
      letterSpacing: 1.1,
      marginBottom: 1,
    },
    title: {
      color: colors.textColor,
      fontSize: 16,
      lineHeight: 21,
      fontWeight: "700",
    },
  });
