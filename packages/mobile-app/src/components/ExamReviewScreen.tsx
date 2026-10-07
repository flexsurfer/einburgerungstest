import { useEffect, useRef, useState, type ComponentRef } from "react";
import {
  AccessibilityInfo,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import {
  appIds,
  useRuntime,
  useSubscription,
  type TestSessionAnswerStatus,
  type TestSessionReviewFilter,
} from "@ebtest/shared/uklad";
import { useColors, type Colors } from "../theme";
import { categoryDisplayName, useI18n, type TranslationKey } from "../i18n";
import images from "../assets/images";
import { BookmarkButton } from "./BookmarkButton";
import { DownArrow, LeftArrow, RightArrow } from "./Icons";

const filters: TestSessionReviewFilter[] = [
  "all",
  "incorrect",
  "unanswered",
  "correct",
];
const statusSymbols: Record<TestSessionAnswerStatus, string> = {
  correct: "✓",
  incorrect: "×",
  unanswered: "–",
};
const emptyTitles: Record<TestSessionReviewFilter, TranslationKey> = {
  all: "noQuestions",
  incorrect: "noIncorrectAnswers",
  unanswered: "noUnansweredAnswers",
  correct: "noCorrectAnswers",
};

export function ExamReviewScreen() {
  const runtime = useRuntime();
  const colors = useColors();
  const { t, language, isRtl } = useI18n("ExamReviewScreen");
  const review = useSubscription(
    [appIds.subscriptions.testSessionReview],
    "ExamReviewScreen",
  );
  const filter = useSubscription(
    [appIds.subscriptions.testSessionReviewFilter],
    "ExamReviewScreen",
  );
  const result = useSubscription(
    [appIds.subscriptions.testSessionResult],
    "ExamReviewScreen",
  );
  const { width } = useWindowDimensions();
  const wide = width >= 900;
  const [overviewOpen, setOverviewOpen] = useState(false);
  const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);
  const pendingNavigation = useRef(false);
  const { current, items, position } = review;
  const question = current?.question;
  const translation = language !== "de" ? question?.[language] : undefined;
  const explanation = translation?.explanation || question?.explanation;
  const imageSource = question?.img ? images[question.img.url] : undefined;
  const imageSize = imageSource
    ? Image.resolveAssetSource(imageSource)
    : undefined;
  const s = styles(colors);

  useEffect(() => {
    if (pendingNavigation.current && current) {
      scrollRef.current?.scrollTo({ y: 0, animated: false });
      AccessibilityInfo.announceForAccessibility(
        `${t("questionOfTotal", { current: current.questionIndex + 1, total: result.total })}. ${t(current.status)}`,
      );
      pendingNavigation.current = false;
    }
  }, [current, result.total, t]);

  const close = () => runtime.dispatch([appIds.events.testSessionReviewClosed]);
  const step = (direction: -1 | 1) => {
    pendingNavigation.current = true;
    runtime.dispatch([appIds.events.testSessionReviewStepped, direction]);
  };
  const selectQuestion = (index: number) => {
    pendingNavigation.current = true;
    setOverviewOpen(false);
    runtime.dispatch([appIds.events.testSessionReviewQuestionSelected, index]);
  };
  const statusStyle = (status: TestSessionAnswerStatus) =>
    status === "correct"
      ? s.correct
      : status === "incorrect"
        ? s.incorrect
        : s.unanswered;

  return (
    <View style={s.screen}>
      <View style={s.topBar}>
        <TouchableOpacity
          accessibilityRole="button"
          onPress={close}
          style={s.backButton}
        >
          <LeftArrow color={colors.textMutedColor} isRtl={isRtl} />
          <Text style={s.backText}>{t("backToResult")}</Text>
        </TouchableOpacity>
        <Text style={s.score}>
          {result.correct} / {result.total} · {t("correct")}
        </Text>
      </View>
      <ScrollView ref={scrollRef} contentContainerStyle={s.scrollContent}>
        <View style={s.content}>
          <Text accessibilityRole="header" style={s.title}>
            {t("answerReview")}
          </Text>
          <Text style={s.subtitle}>{t("reviewDescription")}</Text>
          <View accessibilityLabel={t("reviewFilterLabel")} style={s.filters}>
            {filters.map((value) => (
              <TouchableOpacity
                key={value}
                accessibilityRole="button"
                accessibilityState={{ selected: filter === value }}
                activeOpacity={0.75}
                onPress={() =>
                  runtime.dispatch([
                    appIds.events.testSessionReviewFilterSelected,
                    value,
                  ])
                }
                style={[
                  s.filter,
                  filter === value && s.filterSelected,
                  wide && s.wideFilter,
                ]}
              >
                <Text
                  style={[
                    s.filterText,
                    filter === value && s.filterTextSelected,
                  ]}
                >
                  {t(value === "all" ? "allQuestions" : value)}
                </Text>
                <Text style={s.filterCount}>
                  {value === "all" ? result.total : result[value]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={[s.layout, wide && s.wideLayout]}>
            <View style={[s.overview, wide && s.wideOverview]}>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityState={{ expanded: wide || overviewOpen }}
                onPress={() => setOverviewOpen(!overviewOpen)}
                disabled={wide}
                style={s.overviewHeading}
              >
                <Text style={s.overviewTitle}>{t("questionOverview")}</Text>
                <Text style={s.overviewCount}>{items.length}</Text>
                {!wide && (
                  <View style={overviewOpen && s.rotated}>
                    <DownArrow color={colors.textMutedColor} />
                  </View>
                )}
              </TouchableOpacity>
              {(wide || overviewOpen) && (
                <>
                  <View style={s.grid}>
                    {items.map((item) => (
                      <TouchableOpacity
                        key={item.questionIndex}
                        accessibilityRole="button"
                        accessibilityState={{
                          selected:
                            current?.questionIndex === item.questionIndex,
                        }}
                        accessibilityLabel={t("reviewQuestionLabel", {
                          number: item.questionIndex + 1,
                          status: t(item.status),
                        })}
                        onPress={() => selectQuestion(item.questionIndex)}
                        style={[
                          s.number,
                          statusStyle(item.status),
                          current?.questionIndex === item.questionIndex &&
                            s.selectedNumber,
                        ]}
                      >
                        <Text style={s.numberText}>
                          {item.questionIndex + 1}
                        </Text>
                        <Text style={s.numberSymbol}>
                          {statusSymbols[item.status]}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <View style={s.legend}>
                    {(["correct", "incorrect", "unanswered"] as const).map(
                      (status) => (
                        <Text key={status} style={s.legendText}>
                          {statusSymbols[status]} {t(status)}
                        </Text>
                      ),
                    )}
                  </View>
                </>
              )}
            </View>

            <View style={[s.detail, wide && s.wideDetail]}>
              {current && question ? (
                <View style={s.card}>
                  <View style={s.questionMeta}>
                    <Text style={s.questionNumber}>
                      {t("questionOfTotal", {
                        current: current.questionIndex + 1,
                        total: result.total,
                      })}
                    </Text>
                    <BookmarkButton globalIndex={question.globalIndex} />
                  </View>
                  <View style={s.statusRow}>
                    <View style={[s.status, statusStyle(current.status)]}>
                      <Text style={s.statusText}>
                        {statusSymbols[current.status]} {t(current.status)}
                      </Text>
                    </View>
                    <Text style={s.category}>
                      #{String(question.globalIndex).padStart(3, "0")} ·{" "}
                      {categoryDisplayName(question.category, language)}
                    </Text>
                  </View>
                  <Text
                    accessibilityRole="header"
                    accessibilityLanguage="de"
                    style={s.question}
                  >
                    {question.question}
                  </Text>
                  {translation?.question && (
                    <Text style={s.translation}>{translation.question}</Text>
                  )}
                  {question.img && imageSize && (
                    <View style={s.imageContainer}>
                      <Image
                        source={imageSource}
                        accessible
                        accessibilityLabel={
                          question.img.text ||
                          t("questionImage", {
                            number: current.questionIndex + 1,
                          })
                        }
                        style={[
                          s.image,
                          { aspectRatio: imageSize.width / imageSize.height },
                        ]}
                        resizeMode="contain"
                      />
                      {question.img.text && (
                        <Text style={s.caption}>{question.img.text}</Text>
                      )}
                    </View>
                  )}
                  {current.status === "unanswered" && (
                    <Text style={s.noAnswer}>{t("noAnswerSelected")}</Text>
                  )}
                  <View style={s.answers}>
                    {question.answers.map((answer, index) => {
                      const correct = index === question.correct;
                      const selected = index === current.answerIndex;
                      return (
                        <View
                          key={index}
                          accessible
                          style={[
                            s.answer,
                            correct
                              ? s.correctAnswer
                              : selected
                                ? s.incorrectAnswer
                                : undefined,
                          ]}
                        >
                          <Text accessible={false} style={s.letter}>
                            {String.fromCharCode(65 + index)}
                          </Text>
                          <View style={s.answerCopy}>
                            {(correct || selected) && (
                              <Text style={s.answerLabel}>
                                {correct
                                  ? t(
                                      selected
                                        ? "yourCorrectAnswer"
                                        : "correctAnswer",
                                    )
                                  : t("yourAnswer")}
                              </Text>
                            )}
                            <Text
                              accessibilityLanguage="de"
                              style={s.answerText}
                            >
                              {answer}
                            </Text>
                            {translation?.answers?.[index] && (
                              <Text style={s.translation}>
                                {translation.answers[index]}
                              </Text>
                            )}
                          </View>
                          {(correct || selected) && (
                            <Text accessible={false} style={s.answerSymbol}>
                              {correct ? "✓" : "×"}
                            </Text>
                          )}
                        </View>
                      );
                    })}
                  </View>
                  {explanation && (
                    <View style={s.explanation}>
                      <Text
                        accessibilityRole="header"
                        style={s.explanationTitle}
                      >
                        {t("explanation")}
                      </Text>
                      <Text
                        style={[
                          s.explanationText,
                          !translation?.explanation && s.germanText,
                        ]}
                      >
                        {explanation}
                      </Text>
                    </View>
                  )}
                </View>
              ) : (
                <View style={s.empty}>
                  <Text accessibilityRole="header" style={s.emptyTitle}>
                    {t(emptyTitles[filter])}
                  </Text>
                  <Text style={s.emptyText}>{t("noReviewQuestions")}</Text>
                  <TouchableOpacity
                    accessibilityRole="button"
                    onPress={() =>
                      runtime.dispatch([
                        appIds.events.testSessionReviewFilterSelected,
                        "all",
                      ])
                    }
                    style={[s.navButton, s.nextButton]}
                  >
                    <Text style={s.nextText}>{t("allQuestions")}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      {current && (
        <View style={s.navigation}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={t("previousQuestion")}
            accessibilityState={{ disabled: position <= 0 }}
            disabled={position <= 0}
            onPress={() => step(-1)}
            style={[s.navButton, position <= 0 && s.disabled]}
          >
            <LeftArrow color={colors.textColor} isRtl={isRtl} />
            <Text style={s.navText}>{t("previous")}</Text>
          </TouchableOpacity>
          <Text style={s.position}>
            {t("reviewPosition", {
              current: position + 1,
              total: items.length,
            })}
          </Text>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={t(
              position < items.length - 1 ? "nextQuestion" : "backToResult",
            )}
            onPress={position < items.length - 1 ? () => step(1) : close}
            style={[s.navButton, s.nextButton]}
          >
            <Text style={s.nextText}>
              {t(position < items.length - 1 ? "next" : "done")}
            </Text>
            {position < items.length - 1 && (
              <RightArrow color={colors.primaryTextColor} isRtl={isRtl} />
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = (colors: Colors) =>
  StyleSheet.create({
    screen: { flex: 1 },
    topBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      paddingHorizontal: 16,
    },
    backButton: {
      minHeight: 44,
      flexDirection: "row",
      alignItems: "center",
      flexShrink: 1,
    },
    backText: { color: colors.textMutedColor, fontSize: 13, flexShrink: 1 },
    score: {
      color: colors.primaryColor,
      fontSize: 12,
      fontWeight: "700",
      flexShrink: 1,
      textAlign: "right",
    },
    scrollContent: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 24 },
    content: { width: "100%", maxWidth: 1100, alignSelf: "center" },
    title: {
      color: colors.textColor,
      fontSize: 27,
      lineHeight: 34,
      fontWeight: "800",
    },
    subtitle: {
      color: colors.textMutedColor,
      fontSize: 13,
      lineHeight: 20,
      marginTop: 6,
      marginBottom: 20,
    },
    filters: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginBottom: 16,
    },
    filter: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8,
      minHeight: 46,
      flexBasis: "47%",
      flexGrow: 1,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderWidth: 1,
      borderColor: colors.borderColor,
      borderRadius: 12,
      backgroundColor: colors.surfaceColor,
    },
    wideFilter: { flexBasis: "auto", flexGrow: 0, minWidth: 130 },
    filterSelected: {
      borderColor: colors.primaryColor,
      backgroundColor: colors.primaryPale,
    },
    filterText: {
      flexShrink: 1,
      fontSize: 12,
      color: colors.textMutedColor,
      fontWeight: "600",
    },
    filterTextSelected: { color: colors.textColor, fontWeight: "800" },
    filterCount: {
      fontSize: 11,
      fontWeight: "700",
      color: colors.textMutedColor,
    },
    layout: { gap: 16 },
    wideLayout: { flexDirection: "row", alignItems: "flex-start", gap: 24 },
    overview: {
      paddingHorizontal: 16,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.borderColor,
      backgroundColor: colors.surfaceColor,
    },
    wideOverview: { width: 292 },
    overviewHeading: {
      minHeight: 52,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    overviewTitle: {
      flex: 1,
      fontSize: 13,
      fontWeight: "700",
      color: colors.textColor,
    },
    overviewCount: { fontSize: 12, color: colors.textMutedColor },
    rotated: { transform: [{ rotate: "180deg" }] },
    grid: { flexDirection: "row", flexWrap: "wrap", gap: 8, paddingTop: 4 },
    number: {
      width: 44,
      minHeight: 44,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 3,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: "transparent",
    },
    selectedNumber: { borderColor: colors.textColor },
    numberText: { color: colors.textColor, fontSize: 13, fontWeight: "700" },
    numberSymbol: { color: colors.textColor, fontSize: 10 },
    correct: { backgroundColor: colors.successLight },
    incorrect: { backgroundColor: colors.errorLight },
    unanswered: { backgroundColor: colors.surfaceSoftColor },
    legend: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
      marginTop: 16,
      paddingVertical: 14,
      borderTopWidth: 1,
      borderTopColor: colors.borderColor,
    },
    legendText: { color: colors.textMutedColor, fontSize: 11 },
    detail: { minWidth: 0 },
    wideDetail: { flex: 1 },
    card: {
      padding: 18,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.borderColor,
      backgroundColor: colors.surfaceColor,
    },
    questionMeta: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
    },
    questionNumber: {
      flex: 1,
      color: colors.textColor,
      fontSize: 13,
      fontWeight: "700",
    },
    statusRow: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 8,
      marginTop: 10,
      marginBottom: 18,
    },
    status: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 5 },
    statusText: { color: colors.textColor, fontSize: 11, fontWeight: "700" },
    category: { color: colors.textMutedColor, fontSize: 11, flexShrink: 1 },
    question: {
      color: colors.textColor,
      fontSize: 18,
      lineHeight: 27,
      fontWeight: "600",
      writingDirection: "ltr",
      textAlign: "left",
    },
    translation: {
      color: colors.textMutedColor,
      fontSize: 13,
      lineHeight: 20,
      marginTop: 6,
    },
    imageContainer: { marginTop: 18, alignItems: "center" },
    image: { width: "100%", maxHeight: 300, borderRadius: 8 },
    caption: {
      color: colors.textMutedColor,
      fontSize: 12,
      lineHeight: 18,
      textAlign: "center",
      marginTop: 8,
      writingDirection: "ltr",
    },
    noAnswer: {
      marginTop: 18,
      padding: 12,
      borderRadius: 10,
      backgroundColor: colors.surfaceSoftColor,
      color: colors.textMutedColor,
      fontSize: 13,
      lineHeight: 20,
    },
    answers: { gap: 10, marginTop: 20 },
    answer: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 10,
      paddingHorizontal: 12,
      paddingVertical: 14,
      borderWidth: 1,
      borderColor: colors.borderColor,
      borderRadius: 12,
    },
    correctAnswer: {
      backgroundColor: colors.successLight,
      borderColor: colors.successColor,
    },
    incorrectAnswer: {
      backgroundColor: colors.errorLight,
      borderColor: colors.errorColor,
    },
    letter: {
      minWidth: 24,
      paddingVertical: 4,
      textAlign: "center",
      backgroundColor: colors.surfaceColor,
      borderRadius: 6,
      color: colors.textMutedColor,
      fontSize: 11,
    },
    answerCopy: { flex: 1 },
    answerLabel: {
      color: colors.textColor,
      fontSize: 11,
      lineHeight: 17,
      fontWeight: "700",
      marginBottom: 4,
    },
    answerText: {
      color: colors.textColor,
      fontSize: 14,
      lineHeight: 22,
      writingDirection: "ltr",
      textAlign: "left",
    },
    answerSymbol: { color: colors.textColor, fontSize: 16, fontWeight: "700" },
    explanation: {
      marginTop: 24,
      paddingTop: 20,
      borderTopWidth: 1,
      borderTopColor: colors.borderColor,
    },
    explanationTitle: {
      color: colors.primaryColor,
      fontSize: 12,
      lineHeight: 18,
      fontWeight: "700",
      marginBottom: 8,
    },
    explanationText: { color: colors.textColor, fontSize: 14, lineHeight: 24 },
    germanText: { writingDirection: "ltr", textAlign: "left" },
    empty: {
      padding: 28,
      gap: 16,
      alignItems: "center",
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.borderColor,
      backgroundColor: colors.surfaceColor,
    },
    emptyTitle: {
      color: colors.textColor,
      fontSize: 21,
      lineHeight: 28,
      fontWeight: "700",
      textAlign: "center",
    },
    emptyText: {
      color: colors.textMutedColor,
      fontSize: 14,
      lineHeight: 22,
      textAlign: "center",
    },
    navigation: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
      padding: 14,
      borderTopWidth: 1,
      borderTopColor: colors.borderColor,
      backgroundColor: colors.surfaceColor,
    },
    navButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      minHeight: 46,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.borderColor,
    },
    navText: { color: colors.textColor, fontSize: 13, fontWeight: "600" },
    position: {
      flex: 1,
      maxWidth: 280,
      textAlign: "center",
      color: colors.textMutedColor,
      fontSize: 11,
      lineHeight: 16,
    },
    nextButton: {
      backgroundColor: colors.primaryColor,
      borderColor: colors.primaryColor,
    },
    nextText: {
      color: colors.primaryTextColor,
      fontSize: 13,
      fontWeight: "700",
    },
    disabled: { opacity: 0.35 },
  });
