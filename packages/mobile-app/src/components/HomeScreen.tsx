import { memo, useCallback, useState, type ReactNode } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Rect,
  Stop,
} from "react-native-svg";
import {
  appIds,
  useRuntime,
  useSubscription,
  type CategoryGroup,
  type CategorySelection,
  type PracticeOverview,
} from "@ebtest/shared/uklad";
import { useColors, type Colors } from "../theme";
import { HOME_IMAGE_ASPECT_RATIO } from "./AppBackground";
import {
  BookmarkIcon,
  BookOpenIcon,
  BuildingIcon,
  CheckCircleIcon,
  ChevronRight,
  DocumentIcon,
  ExamIcon,
  MenuIcon,
  PlayIcon,
  PeopleIcon,
  ReviewIcon,
  ScaleIcon,
  TargetIcon,
} from "./Icons";

type ActionCardWidth = "48.2%";

type Tone = {
  backgroundColor: string;
  color: string;
};

type ActionCardProps = {
  title: string;
  detail: string;
  icon: ReactNode;
  tone: Tone;
  width: ActionCardWidth;
  colors: Colors;
  onPress: () => void;
  disabled?: boolean;
};

const TOPIC_LABELS: Record<string, string> = {
  "Bildung und Arbeit": "Education & Work",
  "Bund und Länder": "Democracy & Government",
  "Europa und Welt": "Europe & World",
  Geschichte: "History & Responsibility",
  "Gesellschaft und Familie": "Society",
  Politik: "Politics",
  Recht: "Democracy & Law",
  "Religion und Kultur": "Religion & Culture",
  Staat: "The German State",
  Wirtschaft: "Economy",
};

const CORE_TOPIC_ORDER = [
  "Recht",
  "Geschichte",
  "Gesellschaft und Familie",
  "Politik",
  "Bund und Länder",
  "Staat",
  "Bildung und Arbeit",
  "Wirtschaft",
  "Europa und Welt",
  "Religion und Kultur",
];

const STATE_LABELS: Record<string, string> = {
  "Baden-Württemberg": "Baden-Württemberg",
  Bayern: "Bavaria",
  Berlin: "Berlin",
  Brandenburg: "Brandenburg",
  Bremen: "Bremen",
  Hamburg: "Hamburg",
  Hessen: "Hesse",
  "Mecklenburg-Vorpommern": "Mecklenburg-Vorpommern",
  Niedersachsen: "Lower Saxony",
  "Nordrhein-Westfalen": "North Rhine-Westphalia",
  "Rheinland-Pfalz": "Rhineland-Palatinate",
  Saarland: "Saarland",
  Sachsen: "Saxony",
  "Sachsen-Anhalt": "Saxony-Anhalt",
  "Schleswig-Holstein": "Schleswig-Holstein",
  Thüringen: "Thuringia",
};

const stateAbbreviations: Record<string, string> = {
  "Baden-Württemberg": "BW",
  Bayern: "BY",
  Berlin: "BE",
  Brandenburg: "BB",
  Bremen: "HB",
  Hamburg: "HH",
  Hessen: "HE",
  "Mecklenburg-Vorpommern": "MV",
  Niedersachsen: "NI",
  "Nordrhein-Westfalen": "NW",
  "Rheinland-Pfalz": "RP",
  Saarland: "SL",
  Sachsen: "SN",
  "Sachsen-Anhalt": "ST",
  "Schleswig-Holstein": "SH",
  Thüringen: "TH",
};

function HeroGradient({ colors }: { colors: Colors }) {
  return (
    <Svg pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Defs>
        <LinearGradient
          id="homeHeroGradient"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <Stop offset="0%" stopColor={colors.primaryColor} />
          <Stop offset="55%" stopColor={colors.primaryMidColor} />
          <Stop offset="100%" stopColor={colors.heroGradientEnd} />
        </LinearGradient>
      </Defs>
      <Rect width="100%" height="100%" fill="url(#homeHeroGradient)" />
    </Svg>
  );
}

function ProgressRing({
  value,
  correct,
  incorrect,
  totalQuestions,
  colors,
}: {
  value: number;
  correct: number;
  incorrect: number;
  totalQuestions: number;
  colors: Colors;
}) {
  const size = 128;
  const strokeWidth = 11;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const normalizedValue = Math.max(0, Math.min(value, 100));
  const normalizedTotal = Math.max(0, totalQuestions);
  const normalizedCorrect = Math.max(0, Math.min(correct, normalizedTotal));
  const normalizedIncorrect = Math.max(
    0,
    Math.min(incorrect, normalizedTotal - normalizedCorrect),
  );
  const correctRatio =
    normalizedTotal === 0 ? 0 : normalizedCorrect / normalizedTotal;
  const incorrectRatio =
    normalizedTotal === 0 ? 0 : normalizedIncorrect / normalizedTotal;
  const correctOffset = circumference - correctRatio * circumference;
  const incorrectOffset = circumference - incorrectRatio * circumference;
  const incorrectStartAngle = -90 + correctRatio * 360;

  return (
    <View
      accessible
      accessibilityLabel={`${normalizedValue}% overall progress, ${normalizedCorrect} correct, ${normalizedIncorrect} incorrect`}
      style={staticStyles.progressRing}
    >
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.26)"
          strokeWidth={strokeWidth}
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colors.primaryLight}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={correctOffset}
          strokeLinecap="round"
          strokeWidth={strokeWidth}
          rotation="-90"
          originX={size / 2}
          originY={size / 2}
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colors.errorColor}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={incorrectOffset}
          strokeLinecap="round"
          strokeWidth={strokeWidth}
          rotation={incorrectStartAngle}
          originX={size / 2}
          originY={size / 2}
        />
      </Svg>
      <View pointerEvents="none" style={staticStyles.progressValueWrap}>
        <Text style={staticStyles.progressValue}>{normalizedValue}%</Text>
        <Text style={staticStyles.progressLabel}>Overall Progress</Text>
      </View>
    </View>
  );
}

function ProgressStat({
  icon,
  value,
  label,
  colors,
}: {
  icon: ReactNode;
  value: string | number;
  label: string;
  colors: Colors;
}) {
  const styleSheet = styles(colors);
  return (
    <View style={styleSheet.progressStat}>
      {icon}
      <Text style={styleSheet.progressStatValue}>{value}</Text>
      <Text style={styleSheet.progressStatLabel}>{label}</Text>
    </View>
  );
}

function ActionCard({
  title,
  detail,
  icon,
  tone,
  width,
  colors,
  onPress,
  disabled = false,
}: ActionCardProps) {
  const styleSheet = styles(colors);
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      activeOpacity={0.78}
      disabled={disabled}
      onPress={onPress}
      style={[
        styleSheet.actionCard,
        { width },
        disabled ? styleSheet.disabledCard : null,
      ]}
    >
      <View style={styleSheet.actionIconWrap}>
        <View
          style={[
            styleSheet.actionIcon,
            { backgroundColor: tone.backgroundColor },
          ]}
        >
          {icon}
        </View>
      </View>
      <View style={styleSheet.actionCopy}>
        <Text numberOfLines={2} style={styleSheet.actionTitle}>
          {title}
        </Text>
        <Text numberOfLines={1} style={styleSheet.actionDetail}>
          {detail}
        </Text>
      </View>
      <ChevronRight
        color={disabled ? colors.disabledText : colors.textMutedColor}
      />
    </TouchableOpacity>
  );
}

function TopicRow({
  category,
  count,
  index,
  colors,
  divider,
  onPress,
}: {
  category: string;
  count: number;
  index: number;
  colors: Colors;
  divider: boolean;
  onPress: () => void;
}) {
  const styleSheet = styles(colors);
  const tones: Tone[] = [
    { backgroundColor: colors.blueLight, color: colors.blueColor },
    { backgroundColor: colors.primaryPale, color: colors.primaryColor },
    { backgroundColor: colors.orangeLight, color: colors.orangeColor },
    { backgroundColor: colors.yellowLight, color: colors.yellowColor },
  ];
  const tone = tones[index % tones.length];
  const topicIcon =
    category === "Recht" ? (
      <ScaleIcon color={tone.color} />
    ) : category === "Geschichte" ? (
      <BuildingIcon color={tone.color} />
    ) : category === "Gesellschaft und Familie" ? (
      <PeopleIcon color={tone.color} />
    ) : (
      <DocumentIcon color={tone.color} />
    );

  return (
    <TouchableOpacity
      accessibilityLabel={`${TOPIC_LABELS[category] ?? category}, ${count} questions`}
      accessibilityRole="button"
      activeOpacity={0.78}
      onPress={onPress}
      style={[styleSheet.topicRow, divider ? styleSheet.topicRowDivider : null]}
    >
      <View
        style={[
          styleSheet.topicIcon,
          { backgroundColor: tone.backgroundColor },
        ]}
      >
        {topicIcon}
      </View>
      <View style={styleSheet.topicCopy}>
        <Text numberOfLines={1} style={styleSheet.topicTitle}>
          {TOPIC_LABELS[category] ?? category}
        </Text>
        <Text style={styleSheet.topicCount}>{count} questions</Text>
      </View>
      <ChevronRight color={colors.textMutedColor} size={20} />
    </TouchableOpacity>
  );
}

function StateCard({
  category,
  count,
  colors,
  onPress,
}: {
  category: string;
  count: number;
  colors: Colors;
  onPress: () => void;
}) {
  const styleSheet = styles(colors);
  return (
    <TouchableOpacity
      accessibilityLabel={`${STATE_LABELS[category] ?? category}, ${count} questions`}
      accessibilityRole="button"
      activeOpacity={0.78}
      onPress={onPress}
      style={styleSheet.stateCard}
    >
      <View style={styleSheet.stateBadge}>
        <Text style={styleSheet.stateBadgeText}>
          {stateAbbreviations[category] ?? category.slice(0, 2).toUpperCase()}
        </Text>
      </View>
      <Text numberOfLines={2} style={styleSheet.stateTitle}>
        {STATE_LABELS[category] ?? category}
      </Text>
      <Text style={styleSheet.stateCount}>{count}</Text>
    </TouchableOpacity>
  );
}

export const HomeScreen = memo(() => {
  const runtime = useRuntime();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isWide = width >= 720;
  const contentWidth = Math.max(0, width - insets.left - insets.right);
  const coverImageHeight = contentWidth / HOME_IMAGE_ASPECT_RATIO;
  const styleSheet = styles(colors, isWide);
  const [showAllCoreTopics, setShowAllCoreTopics] = useState(false);
  const [showAllStates, setShowAllStates] = useState(false);

  const overview = useSubscription(
    [appIds.subscriptions.practiceOverview],
    "HomeScreen",
  ) as PracticeOverview;
  const categories = useSubscription(
    [appIds.subscriptions.questionsCategories],
    "HomeScreen",
  ) as CategoryGroup[];
  const favoriteCount = useSubscription(
    [appIds.subscriptions.practiceFavoriteCount],
    "HomeScreen",
  );
  const wrongCount = useSubscription(
    [appIds.subscriptions.practiceWrongCount],
    "HomeScreen",
  );
  const practiceGlobalIndex = useSubscription(
    [appIds.subscriptions.practiceGlobalIndex],
    "HomeScreen",
  );

  const openCategory = useCallback(
    (category: CategorySelection) => {
      runtime.dispatch([appIds.events.navigationCategorySelected, category]);
    },
    [runtime],
  );

  const openSettings = useCallback(() => {
    runtime.dispatch([appIds.events.navigationSettingsOpened]);
  }, [runtime]);

  const canResume = practiceGlobalIndex !== null;

  const handlePrimaryAction = useCallback(() => {
    if (canResume) {
      runtime.dispatch([appIds.events.navigationPracticeResumed]);
    } else {
      runtime.dispatch([appIds.events.navigationCategorySelected, null]);
    }
  }, [canResume, runtime]);

  const coreTopics = categories.find((group) => group.title === "Themes");
  const federalStates = categories.find(
    (group) => group.title === "Bundesländer",
  );
  const orderedCoreTopics = [...(coreTopics?.items ?? [])].sort(
    ([left], [right]) => {
      const leftOrder = CORE_TOPIC_ORDER.indexOf(left);
      const rightOrder = CORE_TOPIC_ORDER.indexOf(right);
      if (leftOrder === -1 && rightOrder === -1) {
        return left.localeCompare(right);
      }
      if (leftOrder === -1) return 1;
      if (rightOrder === -1) return -1;
      return leftOrder - rightOrder;
    },
  );
  const visibleCoreTopics = showAllCoreTopics
    ? orderedCoreTopics
    : orderedCoreTopics.slice(0, 3);
  const visibleStates = showAllStates
    ? (federalStates?.items ?? [])
    : (federalStates?.items ?? []).slice(0, 3);

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
              accessibilityLabel="Open settings"
              accessibilityRole="button"
              activeOpacity={0.7}
              hitSlop={8}
              onPress={openSettings}
              style={styleSheet.topBarSlot}
            >
              <MenuIcon color={colors.primaryColor} size={28} />
            </TouchableOpacity>
            <View style={styleSheet.brand}>
              <Text style={styleSheet.brandTitle}>Einbürgerungstest</Text>
            </View>
            <View style={styleSheet.topBarSlotRight} />
          </View>
        </View>

        <View style={styleSheet.progressCard}>
          <HeroGradient colors={colors} />
          <View style={styleSheet.progressTopRow}>
            <ProgressRing
              colors={colors}
              correct={overview.correct}
              incorrect={overview.incorrect}
              totalQuestions={overview.totalQuestions}
              value={overview.progress}
            />
            <View style={styleSheet.progressStats}>
              <ProgressStat
                colors={colors}
                icon={<CheckCircleIcon color={colors.heroTextColor} />}
                label="Correct answers"
                value={overview.correct}
              />
              <View style={styleSheet.progressDivider} />
              <ProgressStat
                colors={colors}
                icon={<TargetIcon color={colors.heroTextColor} />}
                label="Accuracy"
                value={`${overview.accuracy}%`}
              />
              <View style={styleSheet.progressDivider} />
              <ProgressStat
                colors={colors}
                icon={<DocumentIcon color={colors.heroTextColor} />}
                label="Remaining questions"
                value={overview.remaining}
              />
            </View>
          </View>
          <TouchableOpacity
            accessibilityRole="button"
            activeOpacity={0.84}
            onPress={handlePrimaryAction}
            style={styleSheet.continueButton}
          >
            <PlayIcon color={colors.primaryColor} />
            <Text style={styleSheet.continueText}>
              {canResume ? "Continue Practice" : "Start Practice"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styleSheet.content}>
          <View style={styleSheet.sectionHeader}>
            <Text style={styleSheet.sectionTitle}>Practice Modes</Text>
          </View>

          <View style={styleSheet.actionGrid}>
            <ActionCard
              colors={colors}
              detail="33 questions"
              icon={<ExamIcon color={colors.primaryColor} />}
              onPress={() => openCategory("test")}
              title="Mock Exam"
              tone={{
                backgroundColor: colors.primaryPale,
                color: colors.primaryColor,
              }}
              width="48.2%"
            />
            <ActionCard
              colors={colors}
              detail={`${overview.totalQuestions} questions`}
              icon={<BookOpenIcon color={colors.blueColor} />}
              onPress={() => openCategory(null)}
              title="All Questions"
              tone={{
                backgroundColor: colors.blueLight,
                color: colors.blueColor,
              }}
              width="48.2%"
            />
            <ActionCard
              colors={colors}
              detail={`${favoriteCount} questions`}
              disabled={favoriteCount === 0}
              icon={<BookmarkIcon color={colors.yellowColor} />}
              onPress={() => openCategory("favorites")}
              title="Saved Questions"
              tone={{
                backgroundColor: colors.yellowLight,
                color: colors.yellowColor,
              }}
              width="48.2%"
            />
            <ActionCard
              colors={colors}
              detail={`${wrongCount} questions`}
              disabled={wrongCount === 0}
              icon={<ReviewIcon color={colors.errorColor} />}
              onPress={() => openCategory("wrong")}
              title="Incorrect Questions"
              tone={{
                backgroundColor: colors.redLight,
                color: colors.errorColor,
              }}
              width="48.2%"
            />
          </View>

          {coreTopics && (
            <View style={styleSheet.sectionBlock}>
              <View style={styleSheet.sectionHeader}>
                <Text style={styleSheet.sectionTitle}>Core Topics</Text>
                <TouchableOpacity
                  accessibilityRole="button"
                  onPress={() => setShowAllCoreTopics((visible) => !visible)}
                  style={styleSheet.seeAllButton}
                >
                  <Text style={styleSheet.seeAllText}>
                    {showAllCoreTopics ? "Show less" : "See all"}
                  </Text>
                  <ChevronRight color={colors.primaryColor} size={17} />
                </TouchableOpacity>
              </View>
              <View style={styleSheet.topicListCard}>
                {visibleCoreTopics.map(([category, count], index) => (
                  <TopicRow
                    category={category}
                    count={count}
                    divider={index > 0}
                    index={index}
                    key={category}
                    colors={colors}
                    onPress={() => openCategory(category)}
                  />
                ))}
              </View>
            </View>
          )}

          {federalStates && (
            <View style={styleSheet.sectionBlock}>
              <View style={styleSheet.sectionHeader}>
                <Text style={styleSheet.sectionTitle}>Federal States</Text>
                <TouchableOpacity
                  accessibilityRole="button"
                  onPress={() => setShowAllStates((visible) => !visible)}
                  style={styleSheet.seeAllButton}
                >
                  <Text style={styleSheet.seeAllText}>
                    {showAllStates ? "Show less" : "See all"}
                  </Text>
                  <ChevronRight color={colors.primaryColor} size={17} />
                </TouchableOpacity>
              </View>
              <ScrollView
                contentContainerStyle={styleSheet.statesRow}
                horizontal
                showsHorizontalScrollIndicator={false}
              >
                {visibleStates.map(([category, count]) => (
                  <StateCard
                    category={category}
                    count={count}
                    key={category}
                    colors={colors}
                    onPress={() => openCategory(category)}
                  />
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
});

const staticStyles = StyleSheet.create({
  progressRing: {
    width: 128,
    height: 128,
    alignItems: "center",
    justifyContent: "center",
  },
  progressValueWrap: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
  },
  progressValue: {
    color: "#FFFFFF",
    fontSize: 30,
    lineHeight: 35,
    fontWeight: "800",
  },
  progressLabel: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "600",
    textAlign: "center",
  },
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
      paddingBottom: 34,
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
      justifyContent: "center",
      alignItems: "flex-start",
    },
    topBarSlotRight: {
      width: 48,
      alignItems: "flex-end",
    },
    brand: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 10,
    },
    brandTitle: {
      color: colors.textColor,
      fontSize: isWide ? 23 : 19,
      lineHeight: isWide ? 28 : 24,
      fontWeight: "500",
      letterSpacing: 0.1,
    },
    progressCard: {
      position: "relative",
      overflow: "hidden",
      marginHorizontal: isWide ? 28 : 18,
      marginTop: -35,
      paddingHorizontal: isWide ? 28 : 16,
      paddingVertical: isWide ? 24 : 18,
      borderRadius: 22,
      backgroundColor: colors.primaryColor,
      shadowColor: colors.primaryDarkColor,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.24,
      shadowRadius: 18,
      elevation: 8,
    },
    progressTopRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: isWide ? 28 : 10,
    },
    progressStats: {
      flex: 1,
      flexDirection: "row",
      alignItems: "stretch",
      minWidth: 0,
    },
    progressStat: {
      flex: 1,
      alignItems: "center",
      justifyContent: "flex-start",
      minWidth: 0,
      paddingHorizontal: 3,
    },
    progressStatValue: {
      color: colors.heroTextColor,
      fontSize: isWide ? 27 : 23,
      lineHeight: isWide ? 33 : 29,
      fontWeight: "800",
      marginTop: 7,
    },
    progressStatLabel: {
      color: colors.heroTextColor,
      opacity: 0.92,
      fontSize: isWide ? 12 : 10,
      lineHeight: isWide ? 17 : 14,
      fontWeight: "600",
      textAlign: "center",
      marginTop: 1,
    },
    progressDivider: {
      width: 1,
      backgroundColor: "rgba(255,255,255,0.18)",
      marginVertical: 12,
    },
    continueButton: {
      minHeight: 52,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 7,
      marginTop: 18,
      borderRadius: 17,
      backgroundColor: colors.surfaceColor,
    },
    continueText: {
      color: colors.primaryColor,
      fontSize: 16,
      lineHeight: 21,
      fontWeight: "800",
    },
    content: {
      width: "100%",
      maxWidth: 900,
      alignSelf: "center",
      paddingHorizontal: isWide ? 28 : 18,
    },
    sectionBlock: {
      marginTop: 28,
    },
    sectionHeader: {
      minHeight: 31,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: 28,
      marginBottom: 12,
    },
    sectionTitle: {
      color: colors.textColor,
      fontSize: isWide ? 21 : 20,
      lineHeight: isWide ? 26 : 25,
      fontWeight: "800",
      letterSpacing: -0.35,
    },
    seeAllButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 1,
      paddingVertical: 5,
      paddingLeft: 8,
    },
    seeAllText: {
      color: colors.primaryColor,
      fontSize: 14,
      lineHeight: 18,
      fontWeight: "700",
    },
    actionGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
    },
    actionCard: {
      minHeight: isWide ? 80 : 76,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: isWide ? 14 : 10,
      paddingVertical: isWide ? 10 : 8,
      borderRadius: 15,
      backgroundColor: colors.surfaceColor,
      borderWidth: 1,
      borderColor: colors.borderColor,
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.12,
      shadowRadius: 12,
      elevation: 3,
    },
    disabledCard: {
      backgroundColor: colors.disabledBg,
      borderColor: colors.disabledBg,
      opacity: 0.78,
    },
    actionIconWrap: {
      marginRight: isWide ? 10 : 8,
    },
    actionIcon: {
      width: isWide ? 42 : 36,
      height: isWide ? 42 : 36,
      borderRadius: 11,
      alignItems: "center",
      justifyContent: "center",
    },
    actionCopy: {
      flex: 1,
      minWidth: 0,
    },
    actionTitle: {
      color: colors.textColor,
      fontSize: isWide ? 15 : 13,
      lineHeight: isWide ? 19 : 17,
      fontWeight: "700",
    },
    actionDetail: {
      color: colors.textMutedColor,
      fontSize: isWide ? 12 : 11,
      lineHeight: 15,
      marginTop: 2,
    },
    topicListCard: {
      overflow: "hidden",
      borderRadius: 18,
      backgroundColor: colors.surfaceColor,
      borderWidth: 1,
      borderColor: colors.borderColor,
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.09,
      shadowRadius: 12,
      elevation: 2,
    },
    topicRow: {
      minHeight: 76,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: isWide ? 17 : 13,
      paddingVertical: 11,
    },
    topicRowDivider: {
      borderTopWidth: 1,
      borderTopColor: colors.borderColor,
    },
    topicIcon: {
      width: isWide ? 45 : 40,
      height: isWide ? 45 : 40,
      borderRadius: 13,
      alignItems: "center",
      justifyContent: "center",
      marginRight: isWide ? 13 : 11,
    },
    topicCopy: {
      flex: 1,
      minWidth: 0,
    },
    topicTitle: {
      color: colors.textColor,
      fontSize: isWide ? 16 : 14,
      lineHeight: isWide ? 21 : 19,
      fontWeight: "700",
    },
    topicCount: {
      color: colors.textMutedColor,
      fontSize: isWide ? 13 : 12,
      lineHeight: 17,
      marginTop: 2,
    },
    statesRow: {
      gap: 12,
      paddingHorizontal: 3,
      paddingBottom: 3,
    },
    stateCard: {
      width: isWide ? 132 : 108,
      minHeight: 139,
      alignItems: "center",
      justifyContent: "flex-start",
      paddingHorizontal: 7,
      paddingTop: 5,
    },
    stateBadge: {
      width: isWide ? 78 : 70,
      height: isWide ? 78 : 70,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 39,
      backgroundColor: colors.surfaceColor,
      borderWidth: 1,
      borderColor: colors.borderColor,
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 9,
      elevation: 3,
    },
    stateBadgeText: {
      color: colors.primaryColor,
      fontSize: isWide ? 20 : 17,
      lineHeight: 24,
      fontWeight: "900",
      letterSpacing: 0.7,
    },
    stateTitle: {
      color: colors.primaryColor,
      fontSize: isWide ? 13 : 11,
      lineHeight: isWide ? 17 : 14,
      fontWeight: "700",
      textAlign: "center",
      marginTop: 8,
    },
    stateCount: {
      color: colors.primaryColor,
      fontSize: 12,
      lineHeight: 16,
      fontWeight: "700",
      marginTop: 2,
    },
  });
