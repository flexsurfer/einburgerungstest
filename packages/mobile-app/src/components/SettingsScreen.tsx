import { memo, useCallback, useState, type ReactNode } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  appIds,
  useRuntime,
  useSubscription,
  type FederalLand,
  type ThemePreference,
} from "@ebtest/shared/uklad";
import { useColors, type Colors } from "../theme";
import { HOME_IMAGE_ASPECT_RATIO } from "./AppBackground";
import {
  BuildingIcon,
  CheckIcon,
  ChevronRight,
  ChevronUp,
  DeviceIcon,
  MoonIcon,
  SunIcon,
} from "./Icons";
import { LandSelection, landDisplayName } from "./LandSelection";

type ThemeOption = {
  value: ThemePreference;
  title: string;
  description: string;
  icon: (color: string) => ReactNode;
  tone: (colors: Colors) => { background: string; foreground: string };
};

const THEME_OPTIONS: readonly ThemeOption[] = [
  {
    value: "system",
    title: "System",
    description: "Match your device automatically",
    icon: (color) => <DeviceIcon color={color} size={22} />,
    tone: (colors) => ({
      background: colors.primaryPale,
      foreground: colors.primaryColor,
    }),
  },
  {
    value: "light",
    title: "Light",
    description: "Use the light appearance",
    icon: (color) => <SunIcon color={color} size={22} />,
    tone: (colors) => ({
      background: colors.yellowLight,
      foreground: colors.yellowColor,
    }),
  },
  {
    value: "dark",
    title: "Dark",
    description: "Use the dark appearance",
    icon: (color) => <MoonIcon color={color} size={22} />,
    tone: (colors) => ({
      background: colors.blueLight,
      foreground: colors.blueColor,
    }),
  },
];

function ThemeOptionRow({
  option,
  selected,
  divider,
  colors,
  onPress,
}: {
  option: ThemeOption;
  selected: boolean;
  divider: boolean;
  colors: Colors;
  onPress: () => void;
}) {
  const styleSheet = styles(colors);
  const tone = option.tone(colors);

  return (
    <TouchableOpacity
      accessibilityLabel={`${option.title} theme. ${option.description}`}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      activeOpacity={0.72}
      onPress={onPress}
      style={[
        styleSheet.option,
        divider ? styleSheet.optionDivider : null,
        selected ? styleSheet.optionSelected : null,
      ]}
    >
      <View
        style={[styleSheet.optionIcon, { backgroundColor: tone.background }]}
      >
        {option.icon(tone.foreground)}
      </View>
      <View style={styleSheet.optionCopy}>
        <Text style={styleSheet.optionTitle}>{option.title}</Text>
        <Text style={styleSheet.optionDescription}>{option.description}</Text>
      </View>
      <View style={styleSheet.selectionIndicator}>
        {selected ? (
          <View style={styleSheet.selectedCheck}>
            <CheckIcon color={colors.primaryTextColor} size={14} />
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

export const SettingsScreen = memo(() => {
  const runtime = useRuntime();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isWide = width >= 720;
  const contentWidth = Math.max(0, width - insets.left - insets.right);
  const coverImageHeight = Math.max(
    contentWidth / HOME_IMAGE_ASPECT_RATIO,
    insets.top + 132,
  );
  const styleSheet = styles(colors, isWide);
  const selectedLand = useSubscription(
    [appIds.subscriptions.preferencesSelectedLand],
    "SettingsScreen",
  );
  const selectedTheme = useSubscription(
    [appIds.subscriptions.preferencesThemeSelection],
    "SettingsScreen",
  );
  const [landPickerVisible, setLandPickerVisible] = useState(false);

  const closeSettings = useCallback(() => {
    runtime.dispatch([appIds.events.navigationHomeOpened]);
  }, [runtime]);

  const selectTheme = useCallback(
    (theme: ThemePreference) => {
      runtime.dispatch([appIds.events.preferencesThemeSelected, theme]);
    },
    [runtime],
  );

  const selectLand = useCallback(
    (land: FederalLand) => {
      runtime.dispatch([appIds.events.preferencesLandSelected, land]);
    },
    [runtime],
  );

  return (
    <View style={styleSheet.root}>
      <ScrollView
        contentContainerStyle={styleSheet.scrollContent}
        showsVerticalScrollIndicator={false}
        style={styleSheet.screen}
      >
        <View style={[styleSheet.heroSpacer, { height: coverImageHeight }]}>
          <View
            style={[
              styleSheet.topBar,
              {
                minHeight: insets.top + 70,
                paddingTop: insets.top + 10,
              },
            ]}
          >
            <TouchableOpacity
              accessibilityLabel="Back to home"
              accessibilityRole="button"
              activeOpacity={0.7}
              hitSlop={8}
              onPress={closeSettings}
              style={styleSheet.topBarSlot}
            >
              <ChevronUp color={colors.primaryColor} size={25} />
            </TouchableOpacity>
            <Text style={styleSheet.headerTitle}>Settings</Text>
            <View style={styleSheet.topBarSlot} />
          </View>
        </View>

        <View style={styleSheet.contentSheet}>
          <View style={styleSheet.content}>
            <View style={styleSheet.sectionBlock}>
              <View style={styleSheet.sectionHeader}>
                <Text style={styleSheet.sectionTitle}>Federal state</Text>
                <Text style={styleSheet.sectionDescription}>
                  Used for Practice and the three regional exam questions.
                </Text>
              </View>
              <TouchableOpacity
                accessibilityLabel={`Federal state, ${
                  selectedLand === null
                    ? "not selected"
                    : landDisplayName(selectedLand)
                }`}
                accessibilityRole="button"
                activeOpacity={0.72}
                onPress={() => setLandPickerVisible(true)}
                style={styleSheet.landRow}
              >
                <View style={styleSheet.landIcon}>
                  <BuildingIcon color={colors.primaryColor} size={23} />
                </View>
                <View style={styleSheet.landCopy}>
                  <Text style={styleSheet.landLabel}>Selected Land</Text>
                  <Text style={styleSheet.landValue}>
                    {selectedLand === null
                      ? "Choose a federal state"
                      : landDisplayName(selectedLand)}
                  </Text>
                </View>
                <ChevronRight color={colors.textMutedColor} size={20} />
              </TouchableOpacity>
            </View>

            <View style={[styleSheet.sectionBlock, styleSheet.sectionSpacing]}>
              <View style={styleSheet.sectionHeader}>
                <Text style={styleSheet.sectionTitle}>Appearance</Text>
                <Text style={styleSheet.sectionDescription}>
                  Choose how the app looks on this device.
                </Text>
              </View>

              <View
                accessibilityRole="radiogroup"
                style={styleSheet.optionsCard}
              >
                {THEME_OPTIONS.map((option, index) => (
                  <ThemeOptionRow
                    colors={colors}
                    divider={index > 0}
                    key={option.value}
                    onPress={() => selectTheme(option.value)}
                    option={option}
                    selected={selectedTheme === option.value}
                  />
                ))}
              </View>

              <Text style={styleSheet.sectionFooter}>
                System follows your phone’s light or dark appearance. Changes
                are saved automatically.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <Modal
        animationType="slide"
        onRequestClose={() => setLandPickerVisible(false)}
        presentationStyle="pageSheet"
        visible={landPickerVisible}
      >
        <View style={styleSheet.modalRoot}>
          <View
            style={[styleSheet.modalHeader, { paddingTop: insets.top + 10 }]}
          >
            <View style={styleSheet.modalHeaderSlot} />
            <Text style={styleSheet.modalHeaderTitle}>Federal state</Text>
            <TouchableOpacity
              accessibilityLabel="Close federal state selection"
              accessibilityRole="button"
              onPress={() => setLandPickerVisible(false)}
              style={styleSheet.modalDoneButton}
            >
              <Text style={styleSheet.modalDoneText}>Done</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            contentContainerStyle={[
              styleSheet.modalContent,
              { paddingBottom: insets.bottom + 30 },
            ]}
            showsVerticalScrollIndicator={false}
          >
            <View style={styleSheet.modalSelection}>
              <LandSelection
                onSelect={selectLand}
                selectedLand={selectedLand}
              />
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
});

const styles = (colors: Colors, isWide = false) =>
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: "transparent",
    },
    screen: {
      flex: 1,
      backgroundColor: "transparent",
    },
    scrollContent: {
      flexGrow: 1,
    },
    heroSpacer: {
      width: "100%",
      position: "relative",
    },
    topBar: {
      position: "absolute",
      top: 0,
      right: 0,
      left: 0,
      minHeight: 70,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: isWide ? 28 : 20,
      paddingTop: 10,
    },
    topBarSlot: {
      width: 48,
      height: 48,
      alignItems: "flex-start",
      justifyContent: "center",
    },
    headerTitle: {
      color: colors.textColor,
      fontSize: isWide ? 23 : 19,
      lineHeight: isWide ? 28 : 24,
      fontWeight: "500",
      letterSpacing: 0.1,
    },
    contentSheet: {
      flex: 1,
      marginTop: -30,
      paddingTop: 30,
      paddingBottom: 40,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
    },
    content: {
      width: "100%",
      maxWidth: 680,
      alignSelf: "center",
      paddingHorizontal: isWide ? 28 : 18,
    },
    sectionHeader: {
      paddingHorizontal: 4,
      marginBottom: 14,
    },
    sectionBlock: {
      width: "100%",
    },
    sectionSpacing: {
      marginTop: 30,
    },
    sectionTitle: {
      color: colors.textColor,
      fontSize: isWide ? 21 : 18,
      lineHeight: isWide ? 27 : 24,
      fontWeight: "800",
      letterSpacing: -0.2,
    },
    sectionDescription: {
      color: colors.textMutedColor,
      fontSize: 13,
      lineHeight: 19,
      marginTop: 3,
    },
    optionsCard: {
      overflow: "hidden",
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.borderColor,
      backgroundColor: colors.surfaceColor,
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.13,
      shadowRadius: 12,
      elevation: 2,
    },
    option: {
      minHeight: 72,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 14,
      paddingVertical: 11,
      backgroundColor: colors.surfaceColor,
    },
    optionDivider: {
      borderTopWidth: 1,
      borderTopColor: colors.borderColor,
    },
    optionSelected: {
      backgroundColor: colors.primaryPale,
    },
    optionIcon: {
      width: 42,
      height: 42,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 12,
      marginRight: 13,
    },
    optionCopy: {
      flex: 1,
      minWidth: 0,
      paddingRight: 10,
    },
    optionTitle: {
      color: colors.textColor,
      fontSize: 15,
      lineHeight: 20,
      fontWeight: "700",
    },
    optionDescription: {
      color: colors.textMutedColor,
      fontSize: 12,
      lineHeight: 17,
      marginTop: 1,
    },
    selectionIndicator: {
      width: 24,
      height: 24,
      alignItems: "center",
      justifyContent: "center",
    },
    selectedCheck: {
      width: 24,
      height: 24,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 12,
      backgroundColor: colors.primaryColor,
    },
    sectionFooter: {
      color: colors.textMutedColor,
      fontSize: 12,
      lineHeight: 18,
      paddingHorizontal: 5,
      marginTop: 10,
    },
    landRow: {
      minHeight: 74,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 14,
      paddingVertical: 11,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.borderColor,
      backgroundColor: colors.surfaceColor,
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.13,
      shadowRadius: 12,
      elevation: 2,
    },
    landIcon: {
      width: 42,
      height: 42,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 12,
      backgroundColor: colors.primaryPale,
      marginRight: 13,
    },
    landCopy: {
      flex: 1,
      minWidth: 0,
      paddingRight: 10,
    },
    landLabel: {
      color: colors.textMutedColor,
      fontSize: 11,
      lineHeight: 15,
      fontWeight: "600",
    },
    landValue: {
      color: colors.textColor,
      fontSize: 15,
      lineHeight: 20,
      fontWeight: "700",
      marginTop: 1,
    },
    modalRoot: {
      flex: 1,
      backgroundColor: colors.pageColor,
    },
    modalHeader: {
      minHeight: 72,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 18,
      paddingBottom: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderColor,
      backgroundColor: colors.surfaceColor,
    },
    modalHeaderSlot: {
      width: 52,
    },
    modalHeaderTitle: {
      color: colors.textColor,
      fontSize: 17,
      lineHeight: 22,
      fontWeight: "800",
    },
    modalDoneButton: {
      width: 52,
      minHeight: 42,
      alignItems: "flex-end",
      justifyContent: "center",
    },
    modalDoneText: {
      color: colors.primaryColor,
      fontSize: 15,
      lineHeight: 20,
      fontWeight: "800",
    },
    modalContent: {
      width: "100%",
      maxWidth: 680,
      alignSelf: "center",
      paddingHorizontal: isWide ? 28 : 18,
      paddingTop: 8,
    },
    modalSelection: {
      marginTop: 0,
    },
  });
