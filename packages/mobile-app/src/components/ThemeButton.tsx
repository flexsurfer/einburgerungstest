import { memo, useCallback } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { appIds, useRuntime, useSubscription } from "@ebtest/shared/uklad";
import { useColors, type Colors } from "../theme";
import { MoonIcon, SunIcon } from "./Icons";
import { useI18n } from "../i18n";

export const ThemeButton = memo(() => {
  const runtime = useRuntime();
  const colors = useColors();
  const { t } = useI18n("ThemeButton");
  const theme = useSubscription(
    [appIds.subscriptions.preferencesTheme],
    "ThemeButton",
  );

  const toggleTheme = useCallback(() => {
    runtime.dispatch([appIds.events.preferencesThemeToggled]);
  }, [runtime]);

  return (
    <TouchableOpacity
      accessibilityLabel={t("switchTheme", {
        theme: theme === "dark" ? t("light") : t("dark"),
      })}
      accessibilityRole="button"
      onPress={toggleTheme}
      style={styles(colors).button}
    >
      <View
        style={[
          styles(colors).option,
          theme !== "dark" ? styles(colors).optionActive : null,
        ]}
      >
        <SunIcon
          color={theme === "dark" ? colors.disabledText : colors.orangeColor}
        />
      </View>
      <View
        style={[
          styles(colors).option,
          theme === "dark" ? styles(colors).optionActive : null,
        ]}
      >
        <MoonIcon
          color={theme === "dark" ? colors.primaryColor : colors.textMutedColor}
        />
      </View>
    </TouchableOpacity>
  );
});

const styles = (colors: Colors) =>
  StyleSheet.create({
    button: {
      width: 78,
      height: 44,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 2,
      padding: 3,
      borderRadius: 22,
      backgroundColor: colors.surfaceColor,
      borderWidth: 1,
      borderColor: colors.borderColor,
    },
    option: {
      width: 34,
      height: 34,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 17,
    },
    optionActive: {
      backgroundColor: colors.surfaceSoftColor,
    },
  });
