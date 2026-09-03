import React, { memo, useCallback } from "react";
import { Pressable, StyleSheet } from "react-native";
import { appIds, useRuntime, useSubscription } from "@ebtest/shared/uklad";
import { useColors } from "../theme";
import { BookmarkIcon } from "./Icons";

interface BookmarkButtonProps {
  globalIndex: number;
}

export const BookmarkButton = memo<BookmarkButtonProps>(({ globalIndex }) => {
  const runtime = useRuntime();
  const colors = useColors();
  const isBookmarked = useSubscription(
    [appIds.subscriptions.practiceIsFavoriteByGlobalIndex, globalIndex],
    "BookmarkButton",
  );

  const handlePress = useCallback(() => {
    runtime.dispatch([appIds.events.practiceFavoriteToggled, globalIndex]);
  }, [globalIndex, runtime]);

  return (
    <Pressable
      accessibilityLabel={
        isBookmarked ? "Remove question bookmark" : "Bookmark question"
      }
      accessibilityRole="button"
      accessibilityState={{ selected: isBookmarked }}
      hitSlop={10}
      onPress={handlePress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: isBookmarked
            ? colors.orangeLight
            : colors.surfaceSoftColor,
          borderColor: isBookmarked ? colors.orangeColor : colors.borderColor,
        },
        pressed && styles.pressed,
      ]}
    >
      <BookmarkIcon
        color={isBookmarked ? colors.orangeColor : colors.textMutedColor}
        filled={isBookmarked}
        size={22}
      />
    </Pressable>
  );
});

const styles = StyleSheet.create({
  button: {
    width: 42,
    height: 42,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.96 }],
  },
});
