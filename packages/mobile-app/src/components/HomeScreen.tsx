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
  type CategoryProgress,
  type CategoryGroup,
  type CategorySelection,
  type FederalLand,
  type PracticeCategoryProgress,
  type PracticeOverview,
} from "@ebtest/shared/uklad";
import { useColors, type Colors } from "../theme";
import { categoryDisplayName, useI18n } from "../i18n";
import { HOME_IMAGE_ASPECT_RATIO } from "./AppBackground";
import {
  ArrowRight,
  BookmarkIcon,
  BookOpenIcon,
  BuildingIcon,
  ChevronRight,
  ClockIcon,
  DocumentIcon,
  ExamIcon,
  MenuIcon,
  PlayIcon,
  PeopleIcon,
  ScaleIcon,
  TargetIcon,
  XCircleIcon,
} from "./Icons";

type ActionCardWidth = "48.5%" | "100%";

type Tone = {
  accentColor: string;
  iconColor: string;
};

type ActionCardProps = {
  title: string;
  icon: ReactNode;
  tone: Tone;
  width: ActionCardWidth;
  colors: Colors;
  isWide: boolean;
  onPress: () => void;
  disabled?: boolean;
  count?: number;
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
  answered,
  correct,
  incorrect,
  totalQuestions,
  colors,
}: {
  answered: number;
  correct: number;
  incorrect: number;
  totalQuestions: number;
  colors: Colors;
}) {
  const { t } = useI18n("ProgressRing");
  const size = 128;
  const strokeWidth = 11;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const normalizedTotal = Math.max(0, totalQuestions);
  const normalizedAnswered = Math.max(0, Math.min(answered, normalizedTotal));
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
      accessibilityLabel={t("progressSummary", {
        answered: normalizedAnswered,
        total: normalizedTotal,
        correct: normalizedCorrect,
        incorrect: normalizedIncorrect,
      })}
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
        <Text style={staticStyles.progressValue}>
          {normalizedAnswered}/{normalizedTotal}
        </Text>
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
  icon,
  tone,
  width,
  colors,
  isWide,
  onPress,
  disabled = false,
  count,
}: ActionCardProps) {
  const { isRtl } = useI18n("ActionCard");
  const styleSheet = styles(colors, isWide);
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      activeOpacity={0.78}
      disabled={disabled}
      onPress={onPress}
      style={[
        styleSheet.actionCard,
        styleSheet.actionCardCentered,
        { width },
        disabled ? styleSheet.disabledCard : null,
      ]}
    >
      <View
        style={[styleSheet.actionIcon, { backgroundColor: tone.accentColor }]}
      >
        {icon}
      </View>
      <View style={styleSheet.actionCopyCentered}>
        <Text numberOfLines={2} style={styleSheet.actionTitleCentered}>
          {title}
        </Text>
      </View>
      {count !== undefined ? (
        <View
          style={[
            styleSheet.actionCount,
            {
              backgroundColor: disabled
                ? colors.disabledBg
                : colors.surfaceColor,
            },
          ]}
        >
          <Text style={[styleSheet.actionCountText, { color: tone.iconColor }]}>
            {count}
          </Text>
        </View>
      ) : null}
      <View style={styleSheet.actionArrow}>
        <ChevronRight
          color={disabled ? colors.disabledText : colors.textMutedColor}
          size={isWide ? 20 : 17}
          isRtl={isRtl}
        />
      </View>
    </TouchableOpacity>
  );
}

function MockExamCard({
  colors,
  isWide,
  onPress,
}: {
  colors: Colors;
  isWide: boolean;
  onPress: () => void;
}) {
  const { isRtl, t } = useI18n("MockExamCard");
  const styleSheet = styles(colors, isWide);
  return (
    <View style={styleSheet.mockExamCard}>
      <View style={styleSheet.mockExamLeading}>
        <View style={styleSheet.mockExamIcon}>
          <ExamIcon color={colors.primaryColor} size={32} />
          <View style={styleSheet.mockExamClock}>
            <ClockIcon color={colors.primaryColor} size={17} />
          </View>
        </View>
        <View style={styleSheet.mockExamCopy}>
          <Text style={styleSheet.mockExamTitle}>{t("mockExam")}</Text>
          <View style={styleSheet.mockExamMeta}>
            <Text style={styleSheet.mockExamDetail}>
              {t("questionsCount", { count: 33 })}
            </Text>
            <View style={styleSheet.mockExamDot} />
            <Text style={styleSheet.mockExamDetail}>
              {t("minutesCount", { count: 60 })}
            </Text>
          </View>
        </View>
      </View>
      <TouchableOpacity
        accessibilityLabel={t("startMockExam")}
        accessibilityRole="button"
        activeOpacity={0.84}
        onPress={onPress}
        style={styleSheet.mockExamButton}
      >
        <Text style={styleSheet.mockExamButtonText}>{t("startExam")}</Text>
        <ArrowRight color={colors.primaryTextColor} size={21} isRtl={isRtl} />
      </TouchableOpacity>
    </View>
  );
}

function TopicRow({
  category,
  progress,
  index,
  colors,
  isWide,
  divider,
  onPress,
}: {
  category: string;
  progress: CategoryProgress;
  index: number;
  colors: Colors;
  isWide: boolean;
  divider: boolean;
  onPress: () => void;
}) {
  const { isRtl, language, t } = useI18n("TopicRow");
  const styleSheet = styles(colors, isWide);
  const categoryLabel = categoryDisplayName(category, language);
  const tones: Tone[] = [
    {
      accentColor: colors.primaryPale,
      iconColor: colors.primaryColor,
    },
    {
      accentColor: colors.blueLight,
      iconColor: colors.blueColor,
    },
    {
      accentColor: colors.orangeLight,
      iconColor: colors.orangeColor,
    },
    {
      accentColor: colors.yellowLight,
      iconColor: colors.yellowColor,
    },
  ];
  const tone = tones[index % tones.length];
  const progressWidth = `${Math.max(
    0,
    Math.min(progress.progress, 100),
  )}%` as `${number}%`;
  const topicIcon =
    category === "Recht" ? (
      <ScaleIcon color={tone.iconColor} />
    ) : category === "Geschichte" ? (
      <BuildingIcon color={tone.iconColor} />
    ) : category === "Gesellschaft und Familie" ? (
      <PeopleIcon color={tone.iconColor} />
    ) : (
      <DocumentIcon color={tone.iconColor} />
    );

  return (
    <TouchableOpacity
      accessibilityLabel={t("categoryProgress", {
        category: categoryLabel,
        answered: progress.answered,
        total: progress.total,
      })}
      accessibilityRole="button"
      activeOpacity={0.78}
      onPress={onPress}
      style={[styleSheet.topicRow, divider ? styleSheet.topicRowDivider : null]}
    >
      <View
        style={[styleSheet.topicIcon, { backgroundColor: tone.accentColor }]}
      >
        {topicIcon}
      </View>
      <View style={styleSheet.topicCopy}>
        <Text numberOfLines={1} style={styleSheet.topicTitle}>
          {categoryLabel}
        </Text>
        <View style={styleSheet.topicProgressRow}>
          <View style={styleSheet.topicProgressTrack}>
            <View
              style={[styleSheet.topicProgressFill, { width: progressWidth }]}
            />
          </View>
          <Text style={styleSheet.topicCount}>
            {progress.answered} / {progress.total}
          </Text>
        </View>
      </View>
      <ChevronRight color={colors.textMutedColor} size={20} isRtl={isRtl} />
    </TouchableOpacity>
  );
}

function StateRow({
  category,
  progress,
  index,
  colors,
  isWide,
  divider,
  selected,
  onPress,
}: {
  category: string;
  progress: CategoryProgress;
  index: number;
  colors: Colors;
  isWide: boolean;
  divider: boolean;
  selected: boolean;
  onPress: () => void;
}) {
  const { isRtl, t } = useI18n("StateRow");
  const styleSheet = styles(colors, isWide);
  const stateLabel = category;
  const tones: Tone[] = [
    {
      accentColor: colors.primaryPale,
      iconColor: colors.primaryColor,
    },
    {
      accentColor: colors.blueLight,
      iconColor: colors.blueColor,
    },
    {
      accentColor: colors.orangeLight,
      iconColor: colors.orangeColor,
    },
    {
      accentColor: colors.yellowLight,
      iconColor: colors.yellowColor,
    },
  ];
  const tone = tones[index % tones.length];
  const progressWidth = `${Math.max(
    0,
    Math.min(progress.progress, 100),
  )}%` as `${number}%`;

  return (
    <TouchableOpacity
      accessibilityLabel={t("categoryProgress", {
        category: stateLabel,
        answered: progress.answered,
        total: progress.total,
      })}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      activeOpacity={0.78}
      onPress={onPress}
      style={[
        styleSheet.topicRow,
        divider ? styleSheet.topicRowDivider : null,
        selected ? styleSheet.stateSelectedRow : null,
      ]}
    >
      <View
        style={[
          styleSheet.topicIcon,
          {
            backgroundColor: selected ? colors.primaryColor : tone.accentColor,
          },
        ]}
      >
        <Text
          style={[
            styleSheet.stateIconText,
            {
              color: selected ? colors.primaryTextColor : tone.iconColor,
            },
          ]}
        >
          {stateAbbreviations[category] ?? category.slice(0, 2).toUpperCase()}
        </Text>
      </View>
      <View style={styleSheet.topicCopy}>
        <View style={styleSheet.stateTitleRow}>
          <Text
            numberOfLines={1}
            style={[
              styleSheet.topicTitle,
              styleSheet.stateTitleText,
              selected ? styleSheet.stateSelectedTitle : null,
            ]}
          >
            {stateLabel}
          </Text>
          {selected ? (
            <View style={styleSheet.stateSelectedBadge}>
              <Text style={styleSheet.stateSelectedBadgeText}>
                {t("yourState")}
              </Text>
            </View>
          ) : null}
        </View>
        <View style={styleSheet.topicProgressRow}>
          <View style={styleSheet.topicProgressTrack}>
            <View
              style={[styleSheet.topicProgressFill, { width: progressWidth }]}
            />
          </View>
          <Text style={styleSheet.topicCount}>
            {progress.answered} / {progress.total}
          </Text>
        </View>
      </View>
      <ChevronRight color={colors.textMutedColor} size={20} isRtl={isRtl} />
    </TouchableOpacity>
  );
}

export const HomeScreen = memo(() => {
  const runtime = useRuntime();
  const colors = useColors();
  const { t } = useI18n("HomeScreen");
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isWide = width >= 720;
  const contentWidth = Math.max(0, width - insets.left - insets.right);
  const coverImageHeight = contentWidth / HOME_IMAGE_ASPECT_RATIO;
  const styleSheet = styles(colors, isWide);
  const reviewCardWidth: ActionCardWidth = "100%";
  const [showAllCoreTopics, setShowAllCoreTopics] = useState(false);
  const [showAllStates, setShowAllStates] = useState(false);

  const overview = useSubscription(
    [appIds.subscriptions.practiceOverview],
    "HomeScreen",
  ) as PracticeOverview;
  const categoryProgress = useSubscription(
    [appIds.subscriptions.practiceCategoryProgress],
    "HomeScreen",
  ) as PracticeCategoryProgress;
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
  const selectedLand = useSubscription(
    [appIds.subscriptions.preferencesSelectedLand],
    "HomeScreen",
  ) as FederalLand | null;
  const openCategory = useCallback(
    (category: CategorySelection) => {
      runtime.dispatch(
        category === "test"
          ? [appIds.events.testSessionStarted]
          : [appIds.events.navigationCategorySelected, category],
      );
    },
    [runtime],
  );

  const openSettings = useCallback(() => {
    runtime.dispatch([appIds.events.navigationSettingsOpened]);
  }, [runtime]);

  const openLearnMode = useCallback(() => {
    runtime.dispatch([appIds.events.navigationLearnOpened]);
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
  const orderedStates = [...(federalStates?.items ?? [])].sort(
    ([left], [right]) => {
      if (left === selectedLand) return -1;
      if (right === selectedLand) return 1;
      return 0;
    },
  );
  const visibleStates = showAllStates
    ? orderedStates
    : orderedStates.slice(0, 3);

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
              accessibilityLabel={t("openSettings")}
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
              answered={overview.totalAnswered}
              colors={colors}
              correct={overview.correct}
              incorrect={overview.incorrect}
              totalQuestions={overview.totalQuestions}
            />
            <View style={styleSheet.progressStats}>
              <ProgressStat
                colors={colors}
                icon={<TargetIcon color={colors.heroTextColor} />}
                label={t("accuracy")}
                value={`${overview.accuracy}%`}
              />
              <View style={styleSheet.progressDivider} />
              <ProgressStat
                colors={colors}
                icon={<DocumentIcon color={colors.heroTextColor} />}
                label={t("remainingQuestions")}
                value={overview.remaining}
              />
            </View>
          </View>
          <View style={styleSheet.progressActions}>
            <TouchableOpacity
              accessibilityLabel={t("studyQuestions")}
              accessibilityRole="button"
              activeOpacity={0.84}
              onPress={openLearnMode}
              style={[styleSheet.continueButton, styleSheet.studyButton]}
            >
              <BookOpenIcon color={colors.heroTextColor} size={19} />
              <Text style={styleSheet.studyText}>{t("study")}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              accessibilityRole="button"
              activeOpacity={0.84}
              onPress={handlePrimaryAction}
              style={styleSheet.continueButton}
            >
              <PlayIcon color={colors.primaryColor} />
              <Text numberOfLines={2} style={styleSheet.continueText}>
                {canResume ? t("continuePractice") : t("startPractice")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styleSheet.content}>
          <View style={styleSheet.sectionHeader}>
            <Text style={styleSheet.sectionTitle}>{t("review")}</Text>
          </View>
          <View style={styleSheet.reviewGrid}>
            <ActionCard
              colors={colors}
              count={favoriteCount}
              disabled={favoriteCount === 0}
              icon={
                <BookmarkIcon
                  color={colors.primaryTextColor}
                  size={isWide ? 34 : 30}
                />
              }
              onPress={() => openCategory("favorites")}
              isWide={isWide}
              title={t("savedQuestions")}
              tone={{
                accentColor: colors.orangeColor,
                iconColor: colors.orangeColor,
              }}
              width={reviewCardWidth}
            />
            <ActionCard
              colors={colors}
              count={wrongCount}
              disabled={wrongCount === 0}
              icon={
                <XCircleIcon
                  color={colors.primaryTextColor}
                  size={isWide ? 35 : 31}
                />
              }
              onPress={() => openCategory("wrong")}
              isWide={isWide}
              title={t("mistakes")}
              tone={{
                accentColor: colors.errorColor,
                iconColor: colors.errorColor,
              }}
              width={reviewCardWidth}
            />
          </View>

          <View style={styleSheet.sectionBlock}>
            <View style={styleSheet.sectionHeader}>
              <Text style={styleSheet.sectionTitle}>{t("mockExam")}</Text>
            </View>
            <MockExamCard
              colors={colors}
              isWide={isWide}
              onPress={() => openCategory("test")}
            />
          </View>

          {coreTopics && (
            <View style={styleSheet.sectionBlock}>
              <View style={styleSheet.sectionHeader}>
                <Text style={styleSheet.sectionTitle}>{t("focusAreas")}</Text>
                <TouchableOpacity
                  accessibilityRole="button"
                  onPress={() => setShowAllCoreTopics((visible) => !visible)}
                  style={styleSheet.seeAllButton}
                >
                  <Text style={styleSheet.seeAllText}>
                    {showAllCoreTopics ? t("showLess") : t("viewAll")}
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styleSheet.topicListCard}>
                {visibleCoreTopics.map(([category, count], index) => (
                  <TopicRow
                    category={category}
                    divider={index > 0}
                    index={index}
                    key={category}
                    colors={colors}
                    isWide={isWide}
                    onPress={() => openCategory(category)}
                    progress={
                      categoryProgress[category] ?? {
                        answered: 0,
                        total: count,
                        progress: 0,
                      }
                    }
                  />
                ))}
              </View>
            </View>
          )}

          {federalStates && (
            <View style={styleSheet.sectionBlock}>
              <View style={styleSheet.sectionHeader}>
                <Text style={styleSheet.sectionTitle}>
                  {t("federalStates")}
                </Text>
                <TouchableOpacity
                  accessibilityRole="button"
                  onPress={() => setShowAllStates((visible) => !visible)}
                  style={styleSheet.seeAllButton}
                >
                  <Text style={styleSheet.seeAllText}>
                    {showAllStates ? t("showLess") : t("viewAll")}
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styleSheet.topicListCard}>
                {visibleStates.map(([category, count], index) => (
                  <StateRow
                    category={category}
                    divider={index > 0}
                    index={index}
                    key={category}
                    colors={colors}
                    isWide={isWide}
                    onPress={() => openCategory(category)}
                    selected={selectedLand === category}
                    progress={
                      categoryProgress[category] ?? {
                        answered: 0,
                        total: count,
                        progress: 0,
                      }
                    }
                  />
                ))}
              </View>
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
    fontSize: 24,
    lineHeight: 29,
    fontWeight: "800",
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
    progressActions: {
      flexDirection: "row",
      gap: isWide ? 12 : 8,
      marginTop: 18,
    },
    continueButton: {
      flex: 1,
      minHeight: 52,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: isWide ? 7 : 5,
      paddingHorizontal: isWide ? 16 : 12,
      paddingVertical: 8,
      borderRadius: 17,
      backgroundColor: colors.surfaceColor,
    },
    studyButton: {
      backgroundColor: "rgba(255,255,255,0.14)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.32)",
    },
    studyText: {
      color: colors.heroTextColor,
      fontSize: isWide ? 16 : 14,
      lineHeight: isWide ? 21 : 18,
      fontWeight: "800",
    },
    continueText: {
      flexShrink: 1,
      color: colors.primaryColor,
      fontSize: isWide ? 16 : 13.5,
      lineHeight: isWide ? 21 : 18,
      fontWeight: "800",
      textAlign: "center",
    },
    content: {
      width: "100%",
      maxWidth: 900,
      alignSelf: "center",
      paddingHorizontal: isWide ? 28 : 18,
      paddingTop: isWide ? 24 : 22,
    },
    sectionBlock: {
      marginTop: isWide ? 24 : 22,
    },
    sectionHeader: {
      minHeight: isWide ? 27 : 25,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: isWide ? 10 : 8,
    },
    sectionTitle: {
      color: colors.textColor,
      fontSize: isWide ? 19 : 18,
      lineHeight: isWide ? 24 : 23,
      fontWeight: "500",
      letterSpacing: -0.2,
    },
    seeAllButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 5,
      paddingLeft: 8,
    },
    seeAllText: {
      color: colors.primaryColor,
      fontSize: 14,
      lineHeight: 18,
      fontWeight: "700",
    },
    reviewGrid: {
      flexDirection: "column",
      gap: isWide ? 12 : 10,
    },
    actionCard: {
      minHeight: isWide ? 94 : 82,
      flexDirection: "row",
      alignItems: "flex-start",
      paddingHorizontal: isWide ? 18 : 8,
      paddingVertical: isWide ? 15 : 10,
      borderRadius: isWide ? 22 : 16,
      backgroundColor: colors.surfaceColor,
      borderWidth: 1,
      borderColor: colors.borderColor,
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 7 },
      shadowOpacity: 0.1,
      shadowRadius: 16,
      elevation: 3,
    },
    actionCardCentered: {
      alignItems: "center",
    },
    disabledCard: {
      backgroundColor: colors.disabledBg,
      borderColor: colors.disabledBg,
      opacity: 0.78,
    },
    actionIcon: {
      width: isWide ? 54 : 44,
      height: isWide ? 54 : 44,
      borderRadius: isWide ? 17 : 13,
      alignItems: "center",
      justifyContent: "center",
      alignSelf: "center",
      marginRight: isWide ? 12 : 10,
    },
    actionCopy: {
      flex: 1,
      minWidth: 0,
    },
    actionCopyCentered: {
      flex: 1,
      minWidth: 0,
      alignSelf: "stretch",
      alignItems: "flex-start",
      justifyContent: "center",
    },
    actionTitleCentered: {
      color: colors.textColor,
      fontSize: isWide ? 18 : 15.5,
      lineHeight: isWide ? 23 : 20,
      fontWeight: "800",
      textAlign: "left",
      letterSpacing: -0.2,
    },
    actionCount: {
      width: isWide ? 48 : 30,
      minWidth: isWide ? 48 : 30,
      height: isWide ? 48 : 30,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: isWide ? 15 : 8,
      marginLeft: isWide ? 14 : 0,
      paddingHorizontal: isWide ? 9 : 0,
      borderWidth: 1,
      borderColor: colors.borderColor,
      position: "relative",
      alignSelf: "center",
    },
    actionCountText: {
      fontSize: isWide ? 18 : 13,
      lineHeight: isWide ? 23 : 16,
      fontWeight: "800",
    },
    actionArrow: {
      width: isWide ? 22 : 18,
      alignItems: "center",
      justifyContent: "center",
      alignSelf: "center",
    },
    mockExamCard: {
      minHeight: isWide ? 112 : 166,
      flexDirection: isWide ? "row" : "column",
      alignItems: isWide ? "center" : "stretch",
      gap: isWide ? 22 : 16,
      paddingHorizontal: isWide ? 22 : 18,
      paddingVertical: isWide ? 17 : 18,
      borderRadius: isWide ? 22 : 19,
      backgroundColor: colors.surfaceColor,
      borderWidth: 1,
      borderColor: colors.borderColor,
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 7 },
      shadowOpacity: 0.1,
      shadowRadius: 16,
      elevation: 3,
    },
    mockExamLeading: {
      flex: 1,
      minWidth: 0,
      flexDirection: "row",
      alignItems: "center",
    },
    mockExamIcon: {
      width: isWide ? 64 : 58,
      height: isWide ? 64 : 58,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: isWide ? 32 : 29,
      backgroundColor: colors.primaryPale,
    },
    mockExamClock: {
      position: "absolute",
      right: -3,
      bottom: -3,
      width: 23,
      height: 23,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 12,
      backgroundColor: colors.surfaceColor,
    },
    mockExamCopy: {
      flex: 1,
      minWidth: 0,
      marginLeft: isWide ? 18 : 14,
    },
    mockExamTitle: {
      color: colors.textColor,
      fontSize: isWide ? 20 : 18,
      lineHeight: isWide ? 25 : 23,
      fontWeight: "800",
      letterSpacing: -0.25,
    },
    mockExamMeta: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 9,
      marginTop: 7,
    },
    mockExamDetail: {
      color: colors.textMutedColor,
      fontSize: isWide ? 14 : 13,
      lineHeight: isWide ? 19 : 18,
    },
    mockExamDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.accentColor,
    },
    mockExamButton: {
      minHeight: 50,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      alignSelf: isWide ? "auto" : "stretch",
      paddingHorizontal: isWide ? 28 : 20,
      borderRadius: 25,
      backgroundColor: colors.primaryColor,
    },
    mockExamButtonText: {
      color: colors.primaryTextColor,
      fontSize: isWide ? 17 : 16,
      lineHeight: isWide ? 22 : 21,
      fontWeight: "800",
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
      minHeight: isWide ? 86 : 80,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: isWide ? 19 : 14,
      paddingVertical: isWide ? 14 : 12,
    },
    topicRowDivider: {
      borderTopWidth: 1,
      borderTopColor: colors.borderColor,
    },
    stateSelectedRow: {
      backgroundColor: colors.primaryPale,
      borderLeftWidth: 3,
      borderLeftColor: colors.primaryColor,
    },
    topicIcon: {
      width: isWide ? 54 : 48,
      height: isWide ? 54 : 48,
      borderRadius: isWide ? 27 : 24,
      alignItems: "center",
      justifyContent: "center",
      marginRight: isWide ? 16 : 13,
    },
    topicCopy: {
      flex: 1,
      minWidth: 0,
      marginRight: isWide ? 16 : 12,
    },
    topicTitle: {
      color: colors.textColor,
      fontSize: isWide ? 16 : 15,
      lineHeight: isWide ? 21 : 20,
      fontWeight: "700",
    },
    stateTitleRow: {
      minWidth: 0,
      flexDirection: "row",
      alignItems: "center",
      gap: isWide ? 8 : 6,
    },
    stateTitleText: {
      flex: 1,
      minWidth: 0,
    },
    stateSelectedTitle: {
      color: colors.primaryColor,
    },
    stateSelectedBadge: {
      flexShrink: 0,
      paddingHorizontal: isWide ? 8 : 6,
      paddingVertical: 3,
      borderRadius: 9,
      backgroundColor: colors.primaryColor,
    },
    stateSelectedBadgeText: {
      color: colors.primaryTextColor,
      fontSize: isWide ? 10 : 9,
      lineHeight: isWide ? 13 : 12,
      fontWeight: "800",
      letterSpacing: 0.15,
    },
    topicProgressRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: isWide ? 7 : 5,
      marginTop: 8,
    },
    topicProgressTrack: {
      flex: 1,
      height: 8,
      overflow: "hidden",
      borderRadius: 4,
      backgroundColor: colors.surfaceSoftColor,
    },
    topicProgressFill: {
      height: "100%",
      borderRadius: 4,
      backgroundColor: colors.accentColor,
    },
    topicCount: {
      color: colors.textMutedColor,
      fontSize: isWide ? 13 : 12,
      lineHeight: 17,
      minWidth: isWide ? 48 : 42,
      textAlign: "right",
    },
    stateIconText: {
      fontSize: isWide ? 15 : 13,
      lineHeight: isWide ? 19 : 17,
      fontWeight: "800",
      letterSpacing: 0.4,
    },
  });
