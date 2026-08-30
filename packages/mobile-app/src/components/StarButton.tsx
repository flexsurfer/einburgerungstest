import React, { memo } from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import {
  appIds,
  useRuntime,
  useSubscription,
} from "@ebtest/shared/uklad";

interface StarButtonProps {
  globalIndex: number;
}

export const StarButton = memo<StarButtonProps>(({ globalIndex }) => {
  const runtime = useRuntime();
  const isFavorite = useSubscription(
    [appIds.subscriptions.practiceIsFavoriteByGlobalIndex, globalIndex],
    "StarButton",
  );

  const handlePress = () => {
    runtime.dispatch([appIds.events.practiceFavoriteToggled, globalIndex]);
  };

  return (
    <TouchableOpacity
      style={styles.starButton}
      onPress={handlePress}
      activeOpacity={0.7}
      hitSlop={{ top: 10, bottom: 10, left: 20, right: 20 }}
    >
      <Text
        style={[
          styles.starIcon,
          isFavorite ? styles.starIconActive : styles.starIconInactive,
        ]}
      >
        {isFavorite ? "★" : "☆"}
      </Text>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  starButton: {
    padding: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  starIcon: {
    fontSize: 24,
  },
  starIconInactive: {
    color: "#F1C40F",
  },
  starIconActive: {
    color: "#F1C40F",
  },
});
