import React, { memo, useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  Dimensions,
  ScrollView,
  StyleSheet,
} from "react-native";
import { appIds, useSubscription } from "@ebtest/shared/uklad";
import { useColors, type Colors } from "../theme";
import { BookmarkButton } from "./BookmarkButton";
import { AnswerList } from "./AnswerList";
import { Question } from "../types";
import images from "../assets/images";
import { categoryDisplayName, useI18n } from "../i18n";

interface QuestionCardProps {
  question: Question;
  isTablet?: boolean;
  numColumns?: number;
  screenWidth?: number;
  gap?: number;
  scrollable?: boolean;
}

export const QuestionCard = memo<QuestionCardProps>(
  ({
    question,
    isTablet = false,
    numColumns = 1,
    screenWidth: propScreenWidth,
    gap = 0,
    scrollable = false,
  }) => {
    const [height, setHeight] = useState<number | null>(null);
    const uri = question.img?.url ?? undefined;

    // Calculate card width based on screen size and number of columns
    const screenWidth = propScreenWidth || Dimensions.get("window").width;
    const horizontalPadding = isTablet ? 40 : 32;

    const cardWidth = isTablet
      ? (screenWidth - horizontalPadding - gap * (numColumns - 1)) / numColumns
      : screenWidth - horizontalPadding;

    const imageWidth = cardWidth - (isTablet ? 32 : 40); // Account for card padding

    useEffect(() => {
      if (!uri) {
        return;
      }
      const { width, height } = Image.resolveAssetSource(images[uri]);
      setHeight(imageWidth / (width / height));
    }, [uri, imageWidth, numColumns, screenWidth, gap]);

    const colors = useColors();
    const { language, t } = useI18n("QuestionCard");
    const isLearnMode = useSubscription(
      [appIds.subscriptions.navigationIsLearnMode],
      "QuestionCard",
    );
    const translation =
      isLearnMode && language !== "de" ? question[language] : undefined;
    const explanation = translation?.explanation || question.explanation;
    const styleSheet = styles(colors, isTablet);

    const metadata = (
      <View
        style={[styleSheet.questionMetaRow, scrollable && styleSheet.cardTop]}
      >
        <Text style={styleSheet.questionMetaText}>
          <Text style={styleSheet.globalNumberValue}>
            #{String(question.globalIndex).padStart(3, "0")}
          </Text>
          <Text style={styleSheet.questionCategory}>
            {" / "}
            {categoryDisplayName(question.category, language)}
          </Text>
        </Text>
        <BookmarkButton globalIndex={question.globalIndex} />
      </View>
    );
    const header = (
      <View
        style={[
          styleSheet.questionHeader,
          scrollable && styleSheet.stickyHeader,
        ]}
      >
        <Text style={styleSheet.questionText}>{question.question}</Text>
        {translation?.question ? (
          <Text style={styleSheet.translationText}>{translation.question}</Text>
        ) : null}
      </View>
    );
    const body = (
      <View style={scrollable && styleSheet.cardBottom}>
        {height && (
          <View style={styleSheet.questionImageContainer}>
            <Image
              source={images[uri]}
              style={{ width: imageWidth, height, borderRadius: 8 }}
              resizeMode="contain"
            />
            {question.img.text && (
              <Text style={styleSheet.questionImageText}>
                {question.img.text}
              </Text>
            )}
          </View>
        )}
        <AnswerList
          question={question}
          translatedAnswers={translation?.answers}
        />
      </View>
    );
    const explanationContent =
      isLearnMode && explanation ? (
        <View style={styleSheet.explanation}>
          <Text style={styleSheet.explanationTitle}>{t("explanation")}</Text>
          <Text style={styleSheet.explanationText}>{explanation}</Text>
        </View>
      ) : null;

    if (scrollable) {
      return (
        <ScrollView
          style={styleSheet.scrollContainer}
          contentContainerStyle={styleSheet.scrollContent}
          stickyHeaderIndices={[1]}
        >
          {metadata}
          {header}
          {body}
          {explanationContent}
        </ScrollView>
      );
    }

    return (
      <View style={[styleSheet.container, isTablet && { width: cardWidth }]}>
        <View style={styleSheet.questionCard}>
          {metadata}
          {header}
          {body}
        </View>
        {explanationContent}
      </View>
    );
  },
);

const styles = (colors: Colors, isTablet = false) =>
  StyleSheet.create({
    container: {
      marginVertical: isTablet ? 0 : 14,
    },
    questionCard: {
      backgroundColor: colors.bgColor,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.borderColor,
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 5,
      padding: isTablet ? 16 : 20,
      paddingTop: 8,
      position: "relative",
      flexDirection: "column",
      minHeight: isTablet ? 240 : 200,
    },
    questionMetaRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 4,
    },
    questionMetaText: {
      flex: 1,
      minWidth: 0,
      marginEnd: 12,
      color: colors.textMutedColor,
      fontSize: 12,
      lineHeight: 16,
    },
    globalNumberValue: {
      color: colors.textMutedColor,
      fontSize: 12,
      lineHeight: 16,
      fontWeight: "500",
      fontVariant: ["tabular-nums"],
    },
    questionHeader: {
      flexDirection: "column",
      marginBottom: isTablet ? 16 : 20,
    },
    scrollContainer: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    cardTop: {
      backgroundColor: colors.bgColor,
      borderTopLeftRadius: 12,
      borderTopRightRadius: 12,
      paddingHorizontal: 20,
      paddingTop: 8,
      marginBottom: 0,
    },
    stickyHeader: {
      backgroundColor: colors.bgColor,
      paddingHorizontal: 20,
      paddingTop: 4,
      paddingBottom: 16,
      marginBottom: 0,
    },
    cardBottom: {
      backgroundColor: colors.bgColor,
      borderBottomLeftRadius: 12,
      borderBottomRightRadius: 12,
      paddingHorizontal: 20,
      paddingBottom: 20,
    },
    questionText: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.textColor,
      lineHeight: 26,
    },
    translationText: {
      fontSize: isTablet ? 15 : 13,
      lineHeight: isTablet ? 23 : 19,
      color: colors.textMutedColor,
      marginTop: 6,
    },
    explanation: {
      paddingHorizontal: isTablet ? 16 : 20,
      paddingTop: 16,
      paddingBottom: 8,
    },
    explanationTitle: {
      fontSize: 13,
      fontWeight: "700",
      color: colors.textMutedColor,
      marginBottom: 6,
    },
    explanationText: {
      fontSize: 15,
      lineHeight: 22,
      color: colors.textColor,
    },
    questionImageContainer: {
      alignItems: "center",
      marginBottom: isTablet ? 16 : 20,
    },
    questionImageText: {
      fontSize: isTablet ? 13 : 14,
      color: colors.textColor,
      marginTop: 8,
      textAlign: "center",
      fontStyle: "italic",
      lineHeight: isTablet ? 18 : 20,
    },
    questionCategory: {
      fontWeight: "400",
    },
  });
