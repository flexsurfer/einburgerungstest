import { memo, useCallback, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { appIds, useRuntime, type FederalLand } from "@ebtest/shared/uklad";
import { useColors, type Colors } from "../theme";
import { CheckIcon } from "./Icons";
import { LandSelection } from "./LandSelection";
import { useI18n } from "../i18n";

export const OnboardingScreen = memo(() => {
  const runtime = useRuntime();
  const colors = useColors();
  const { t } = useI18n("OnboardingScreen");
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isWide = width >= 720;
  const styleSheet = styles(colors);
  const [selectedLand, setSelectedLand] = useState<FederalLand | null>(null);

  const continueToApp = useCallback(() => {
    if (selectedLand === null) return;
    runtime.dispatch([appIds.events.preferencesLandSelected, selectedLand]);
  }, [runtime, selectedLand]);

  return (
    <ScrollView
      contentContainerStyle={[
        styleSheet.scrollContent,
        {
          paddingTop: insets.top + 10,
          paddingBottom: insets.bottom + 30,
          paddingLeft: insets.left + (isWide ? 28 : 18),
          paddingRight: insets.right + (isWide ? 28 : 18),
        },
      ]}
      showsVerticalScrollIndicator={false}
      style={styleSheet.root}
    >
      <View style={styleSheet.content}>
        <LandSelection onSelect={setSelectedLand} selectedLand={selectedLand} />

        <TouchableOpacity
          accessibilityRole="button"
          accessibilityState={{ disabled: selectedLand === null }}
          activeOpacity={0.82}
          disabled={selectedLand === null}
          onPress={continueToApp}
          style={[
            styleSheet.continueButton,
            selectedLand === null ? styleSheet.continueButtonDisabled : null,
          ]}
        >
          <Text
            style={[
              styleSheet.continueText,
              selectedLand === null ? styleSheet.continueTextDisabled : null,
            ]}
          >
            {t("continue")}
          </Text>
          <CheckIcon
            color={
              selectedLand === null
                ? colors.disabledText
                : colors.primaryTextColor
            }
            size={18}
          />
        </TouchableOpacity>

        <Text style={styleSheet.footer}>{t("onboardingFooter")}</Text>
      </View>
    </ScrollView>
  );
});

const styles = (colors: Colors) =>
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: "transparent",
    },
    scrollContent: {
      flexGrow: 1,
    },
    content: {
      width: "100%",
      maxWidth: 680,
      alignSelf: "center",
    },
    continueButton: {
      minHeight: 54,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 9,
      marginTop: 24,
      borderRadius: 17,
      backgroundColor: colors.primaryColor,
      shadowColor: colors.primaryDarkColor,
      shadowOffset: { width: 0, height: 7 },
      shadowOpacity: 0.2,
      shadowRadius: 12,
      elevation: 4,
    },
    continueButtonDisabled: {
      backgroundColor: colors.disabledBg,
      shadowOpacity: 0,
      elevation: 0,
    },
    continueText: {
      color: colors.primaryTextColor,
      fontSize: 16,
      lineHeight: 21,
      fontWeight: "800",
    },
    continueTextDisabled: {
      color: colors.disabledText,
    },
    footer: {
      color: colors.textMutedColor,
      fontSize: 12,
      lineHeight: 18,
      textAlign: "center",
      marginTop: 13,
    },
  });
