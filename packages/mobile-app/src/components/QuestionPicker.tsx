import React, { memo, useCallback, useEffect, useMemo, useRef } from "react";
import {
  Animated,
  FlatList,
  Modal,
  PanResponder,
  type PanResponderGestureState,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  appIds,
  type QuestionPickerItem,
  useRuntime,
  useSubscription,
} from "@ebtest/shared/uklad";
import { useColors, type Colors } from "../theme";
import { useI18n } from "../i18n";

const MOBILE_COLUMNS = 4;
const WIDE_COLUMNS = 5;
const ITEM_HEIGHT = 78;
const ITEM_GAP = 10;

export const QuestionPicker = memo(() => {
  const runtime = useRuntime();
  const colors = useColors();
  const { t } = useI18n("QuestionPicker");
  const { width, height } = useWindowDimensions();
  const sheetTranslateY = useRef(new Animated.Value(0)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const dragStartY = useRef(0);
  const scrollOffsetY = useRef(0);
  const pickerItems = useSubscription(
    [appIds.subscriptions.navigationQuestionPickerItems],
    "QuestionPicker",
  );
  const showQuestionPicker = useSubscription(
    [appIds.subscriptions.navigationQuestionPickerVisible],
    "QuestionPicker",
  );

  const usesNativeIosSheet = Platform.OS === "ios";
  const numColumns = width >= 600 ? WIDE_COLUMNS : MOBILE_COLUMNS;
  const sheetHeight = usesNativeIosSheet
    ? height
    : Math.min(height * 0.88, 780);
  const styleSheet = useMemo(
    () => createStyles(colors, width, height, numColumns, usesNativeIosSheet),
    [colors, height, numColumns, usesNativeIosSheet, width],
  );
  const selectedIndex = useMemo(
    () => pickerItems.findIndex((item) => item.isSelected),
    [pickerItems],
  );
  const initialRowIndex = Math.max(0, Math.floor(selectedIndex / numColumns));
  const pickerRows = useMemo(() => {
    const rows: QuestionPickerItem[][] = [];
    for (let index = 0; index < pickerItems.length; index += numColumns) {
      rows.push(pickerItems.slice(index, index + numColumns));
    }
    return rows;
  }, [numColumns, pickerItems]);

  useEffect(() => {
    if (!showQuestionPicker) return;

    scrollOffsetY.current = initialRowIndex * (ITEM_HEIGHT + ITEM_GAP);
    if (usesNativeIosSheet) return;

    sheetTranslateY.setValue(sheetHeight);
    backdropOpacity.setValue(0);
    const frame = requestAnimationFrame(() => {
      Animated.parallel([
        Animated.spring(sheetTranslateY, {
          toValue: 0,
          speed: 24,
          bounciness: 0,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    });

    return () => cancelAnimationFrame(frame);
  }, [
    backdropOpacity,
    initialRowIndex,
    sheetHeight,
    sheetTranslateY,
    showQuestionPicker,
    usesNativeIosSheet,
  ]);

  const handleQuestionSelect = useCallback(
    (index: number) => {
      runtime.dispatch([appIds.events.navigationQuestionSelected, index]);
    },
    [runtime],
  );

  const hidePicker = useCallback(() => {
    runtime.dispatch([appIds.events.navigationQuestionPickerShown, false]);
  }, [runtime]);

  const springSheetBack = useCallback(() => {
    Animated.parallel([
      Animated.spring(sheetTranslateY, {
        toValue: 0,
        speed: 24,
        bounciness: 0,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 140,
        useNativeDriver: true,
      }),
    ]).start();
  }, [backdropOpacity, sheetTranslateY]);

  const handleClose = useCallback(() => {
    if (usesNativeIosSheet) {
      hidePicker();
      return;
    }

    Animated.parallel([
      Animated.timing(sheetTranslateY, {
        toValue: sheetHeight,
        duration: 210,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) hidePicker();
    });
  }, [
    backdropOpacity,
    hidePicker,
    sheetHeight,
    sheetTranslateY,
    usesNativeIosSheet,
  ]);

  const panResponders = useMemo(() => {
    const startDrag = () => {
      sheetTranslateY.stopAnimation((value) => {
        dragStartY.current = value;
      });
      backdropOpacity.stopAnimation();
    };
    const moveDrag = (gesture: PanResponderGestureState) => {
      const distance = Math.max(0, dragStartY.current + gesture.dy);
      sheetTranslateY.setValue(distance);
      backdropOpacity.setValue(Math.max(0, 1 - distance / sheetHeight));
    };
    const finishDrag = (gesture: PanResponderGestureState) => {
      const distance = Math.max(0, dragStartY.current + gesture.dy);
      if (distance > 96 || gesture.vy > 0.8) {
        handleClose();
      } else {
        springSheetBack();
      }
    };
    const responderHandlers = {
      onPanResponderGrant: startDrag,
      onPanResponderMove: (
        _event: unknown,
        gesture: PanResponderGestureState,
      ) => moveDrag(gesture),
      onPanResponderRelease: (
        _event: unknown,
        gesture: PanResponderGestureState,
      ) => finishDrag(gesture),
      onPanResponderTerminationRequest: () => false,
      onPanResponderTerminate: springSheetBack,
    };
    const shouldPullFromList = (gesture: PanResponderGestureState) =>
      !usesNativeIosSheet &&
      scrollOffsetY.current <= 0 &&
      gesture.dy > 5 &&
      Math.abs(gesture.dy) > Math.abs(gesture.dx);

    return {
      handle: PanResponder.create({
        onStartShouldSetPanResponder: () => !usesNativeIosSheet,
        onStartShouldSetPanResponderCapture: () => !usesNativeIosSheet,
        ...responderHandlers,
      }),
      list: PanResponder.create({
        onMoveShouldSetPanResponder: (_event, gesture) =>
          shouldPullFromList(gesture),
        onMoveShouldSetPanResponderCapture: (_event, gesture) =>
          shouldPullFromList(gesture),
        ...responderHandlers,
      }),
    };
  }, [
    backdropOpacity,
    handleClose,
    sheetHeight,
    sheetTranslateY,
    springSheetBack,
    usesNativeIosSheet,
  ]);

  const getItemLayout = useCallback(
    (
      _data: ArrayLike<QuestionPickerItem[]> | null | undefined,
      index: number,
    ) => {
      return {
        index,
        length: ITEM_HEIGHT + ITEM_GAP,
        offset: index * (ITEM_HEIGHT + ITEM_GAP),
      };
    },
    [],
  );

  const renderQuestionRow = useCallback(
    ({ item }: { item: QuestionPickerItem[] }) => {
      return (
        <QuestionPickerRow
          items={item}
          onSelect={handleQuestionSelect}
          rippleColor={colors.accentMedium}
          styleSheet={styleSheet}
        />
      );
    },
    [colors.accentMedium, handleQuestionSelect, styleSheet],
  );

  const keyExtractor = useCallback(
    (row: QuestionPickerItem[]) => row.map((item) => item.key).join(":"),
    [],
  );

  if (!pickerItems.length) return null;

  return (
    <Modal
      allowSwipeDismissal={usesNativeIosSheet}
      animationType={usesNativeIosSheet ? "slide" : "none"}
      onRequestClose={handleClose}
      presentationStyle={usesNativeIosSheet ? "pageSheet" : "overFullScreen"}
      statusBarTranslucent={!usesNativeIosSheet}
      transparent={!usesNativeIosSheet}
      visible={showQuestionPicker}
    >
      <View style={styleSheet.modalRoot}>
        {!usesNativeIosSheet && (
          <>
            <Animated.View
              pointerEvents="none"
              style={[
                StyleSheet.absoluteFill,
                styleSheet.backdrop,
                { opacity: backdropOpacity },
              ]}
            />
            <Pressable
              accessibilityLabel={t("closeQuestionPicker")}
              accessibilityRole="button"
              onPress={handleClose}
              style={StyleSheet.absoluteFill}
            />
          </>
        )}
        <Animated.View
          style={[
            styleSheet.sheet,
            !usesNativeIosSheet && {
              transform: [{ translateY: sheetTranslateY }],
            },
          ]}
        >
          <SafeAreaView
            accessibilityViewIsModal
            edges={["bottom"]}
            style={styleSheet.sheetContent}
          >
            <View style={styleSheet.dragRegion}>
              <View
                style={styleSheet.grabberTouchArea}
                {...(!usesNativeIosSheet
                  ? panResponders.handle.panHandlers
                  : {})}
              >
                <View style={styleSheet.grabber} />
              </View>
              <View style={styleSheet.header}>
                <View
                  style={styleSheet.headerCopy}
                  {...(!usesNativeIosSheet
                    ? panResponders.handle.panHandlers
                    : {})}
                >
                  <Text style={styleSheet.title}>{t("selectQuestion")}</Text>
                  <Text style={styleSheet.subtitle}>{t("jumpToQuestion")}</Text>
                </View>
                <TouchableOpacity
                  accessibilityLabel={t("closeQuestionPicker")}
                  accessibilityRole="button"
                  activeOpacity={0.7}
                  onPress={handleClose}
                  style={styleSheet.closeButton}
                >
                  <Text style={styleSheet.closeButtonText}>×</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styleSheet.legend}>
              <LegendItem
                colors={colors}
                label={t("correct")}
                symbol="✓"
                tone="correct"
              />
              <LegendItem
                colors={colors}
                label={t("incorrect")}
                symbol="×"
                tone="incorrect"
              />
              <LegendItem
                colors={colors}
                label={t("unanswered")}
                symbol=""
                tone="unanswered"
              />
              <LegendItem
                colors={colors}
                label={t("current")}
                symbol="•"
                tone="current"
              />
            </View>

            {showQuestionPicker && (
              <View
                style={styleSheet.listContainer}
                {...(!usesNativeIosSheet ? panResponders.list.panHandlers : {})}
              >
                <FlatList
                  contentContainerStyle={styleSheet.grid}
                  data={pickerRows}
                  getItemLayout={getItemLayout}
                  initialNumToRender={8}
                  initialScrollIndex={initialRowIndex}
                  key={numColumns}
                  keyExtractor={keyExtractor}
                  maxToRenderPerBatch={10}
                  onScroll={({ nativeEvent }) => {
                    scrollOffsetY.current = Math.max(
                      0,
                      nativeEvent.contentOffset.y,
                    );
                  }}
                  removeClippedSubviews={false}
                  renderItem={renderQuestionRow}
                  scrollEventThrottle={16}
                  showsVerticalScrollIndicator={false}
                  updateCellsBatchingPeriod={16}
                  windowSize={13}
                />
              </View>
            )}
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
});

type LegendTone = "correct" | "incorrect" | "unanswered" | "current";
type PickerStyles = ReturnType<typeof createStyles>;

const QuestionPickerRow = memo(
  ({
    items,
    onSelect,
    rippleColor,
    styleSheet,
  }: {
    items: QuestionPickerItem[];
    onSelect: (index: number) => void;
    rippleColor: string;
    styleSheet: PickerStyles;
  }) => (
    <View style={styleSheet.gridRow}>
      {items.map((item) => (
        <QuestionPickerTile
          item={item}
          key={item.key}
          onSelect={onSelect}
          rippleColor={rippleColor}
          styleSheet={styleSheet}
        />
      ))}
    </View>
  ),
);

const QuestionPickerTile = memo(
  ({
    item,
    onSelect,
    rippleColor,
    styleSheet,
  }: {
    item: QuestionPickerItem;
    onSelect: (index: number) => void;
    rippleColor: string;
    styleSheet: PickerStyles;
  }) => {
    const { t } = useI18n("QuestionPickerTile");
    const statusStyle = item.isAnswered
      ? item.isCorrect
        ? styleSheet.correctQuestionItem
        : styleSheet.incorrectQuestionItem
      : undefined;

    return (
      <Pressable
        accessibilityLabel={t("questionPickerItem", {
          index: item.filteredIndex + 1,
          number: item.number,
          status: item.isAnswered
            ? item.isCorrect
              ? t("answeredCorrectly")
              : t("answeredIncorrectly")
            : t("unansweredStatus"),
          current: item.isSelected ? t("currentQuestion") : "",
        })}
        accessibilityRole="button"
        accessibilityState={{ selected: item.isSelected }}
        android_ripple={{ color: rippleColor, borderless: false }}
        onPress={() => onSelect(item.filteredIndex)}
        style={({ pressed }) => [
          styleSheet.questionItem,
          statusStyle,
          item.isSelected && styleSheet.selectedQuestionItem,
          pressed && styleSheet.pressedQuestionItem,
        ]}
      >
        <Text style={styleSheet.listNumber}>{item.filteredIndex + 1}</Text>
        <Text style={styleSheet.globalNumber}>#{item.number}</Text>
        {item.isAnswered ? (
          <View
            style={[
              styleSheet.statusBadge,
              item.isCorrect
                ? styleSheet.correctStatusBadge
                : styleSheet.incorrectStatusBadge,
            ]}
          >
            <Text style={styleSheet.statusBadgeText}>
              {item.isCorrect ? "✓" : "×"}
            </Text>
          </View>
        ) : item.isSelected ? (
          <View style={styleSheet.currentStatusBadge}>
            <View style={styleSheet.currentStatusDot} />
          </View>
        ) : null}
      </Pressable>
    );
  },
);

const LegendItem = ({
  colors,
  label,
  symbol,
  tone,
}: {
  colors: Colors;
  label: string;
  symbol: string;
  tone: LegendTone;
}) => {
  const toneStyles: Record<LegendTone, { bg: string; border: string }> = {
    correct: { bg: colors.successLight, border: colors.successColor },
    incorrect: { bg: colors.errorLight, border: colors.errorColor },
    unanswered: { bg: colors.surfaceColor, border: colors.textMutedColor },
    current: { bg: colors.orangeLight, border: colors.orangeColor },
  };
  const toneStyle = toneStyles[tone];

  return (
    <View style={[styles.legendItem, { borderColor: toneStyle.border }]}>
      <View
        style={[
          styles.legendIcon,
          { backgroundColor: toneStyle.bg, borderColor: toneStyle.border },
        ]}
      >
        <Text style={[styles.legendSymbol, { color: toneStyle.border }]}>
          {symbol}
        </Text>
      </View>
      <Text style={[styles.legendText, { color: colors.textColor }]}>
        {label}
      </Text>
    </View>
  );
};

const createStyles = (
  colors: Colors,
  screenWidth: number,
  screenHeight: number,
  numColumns: number,
  usesNativeIosSheet: boolean,
) => {
  const contentWidth = Math.min(screenWidth, 660) - 32;
  const itemWidth = (contentWidth - ITEM_GAP * (numColumns - 1)) / numColumns;

  return StyleSheet.create({
    modalRoot: {
      flex: 1,
      justifyContent: "flex-end",
      backgroundColor: usesNativeIosSheet ? colors.surfaceColor : "transparent",
    },
    backdrop: {
      backgroundColor: "rgba(5, 18, 12, 0.48)",
    },
    sheet: {
      width: "100%",
      height: usesNativeIosSheet ? "100%" : Math.min(screenHeight * 0.88, 780),
      backgroundColor: colors.surfaceColor,
      borderTopLeftRadius: usesNativeIosSheet ? 0 : 28,
      borderTopRightRadius: usesNativeIosSheet ? 0 : 28,
      overflow: "hidden",
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: -8 },
      shadowOpacity: usesNativeIosSheet ? 0 : 0.18,
      shadowRadius: 24,
      elevation: 18,
    },
    sheetContent: {
      flex: 1,
    },
    dragRegion: {
      backgroundColor: colors.surfaceColor,
    },
    grabberTouchArea: {
      height: 28,
      alignItems: "center",
      justifyContent: "center",
    },
    grabber: {
      width: 42,
      height: 5,
      borderRadius: 3,
      backgroundColor: colors.borderColor,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingTop: 13,
      paddingBottom: 14,
    },
    headerCopy: {
      flex: 1,
      paddingRight: 12,
    },
    title: {
      color: colors.textColor,
      fontSize: 24,
      fontWeight: "800",
      letterSpacing: -0.4,
    },
    subtitle: {
      color: colors.textMutedColor,
      fontSize: 14,
      lineHeight: 20,
      marginTop: 3,
    },
    closeButton: {
      width: 44,
      height: 44,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.surfaceSoftColor,
      borderColor: colors.borderColor,
      borderWidth: 1,
    },
    closeButtonText: {
      color: colors.textColor,
      fontSize: 28,
      fontWeight: "300",
      lineHeight: 30,
      marginTop: -2,
    },
    legend: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      paddingHorizontal: 20,
      paddingBottom: 14,
    },
    listContainer: {
      flex: 1,
    },
    grid: {
      width: Math.min(screenWidth, 660),
      alignSelf: "center",
      paddingHorizontal: 16,
      paddingTop: 4,
      paddingBottom: 24,
    },
    gridRow: {
      flexDirection: "row",
      gap: ITEM_GAP,
      marginBottom: ITEM_GAP,
    },
    questionItem: {
      width: itemWidth,
      height: ITEM_HEIGHT,
      borderRadius: 14,
      backgroundColor: colors.surfaceColor,
      borderWidth: 1,
      borderColor: colors.borderColor,
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
    },
    pressedQuestionItem: {
      opacity: 0.72,
      transform: [{ scale: 0.97 }],
    },
    selectedQuestionItem: {
      borderColor: colors.orangeColor,
      borderWidth: 2,
      backgroundColor: colors.orangeLight,
    },
    correctQuestionItem: {
      borderColor: colors.successColor,
      backgroundColor: colors.successLight,
    },
    incorrectQuestionItem: {
      borderColor: colors.errorColor,
      backgroundColor: colors.errorLight,
    },
    listNumber: {
      color: colors.textColor,
      fontSize: 21,
      fontWeight: "800",
      fontVariant: ["tabular-nums"],
      lineHeight: 25,
    },
    globalNumber: {
      color: colors.textMutedColor,
      fontSize: 11,
      fontWeight: "600",
      fontVariant: ["tabular-nums"],
      lineHeight: 16,
    },
    statusBadge: {
      position: "absolute",
      top: 5,
      right: 5,
      width: 18,
      height: 18,
      borderRadius: 9,
      alignItems: "center",
      justifyContent: "center",
    },
    correctStatusBadge: {
      backgroundColor: colors.successColor,
    },
    incorrectStatusBadge: {
      backgroundColor: colors.errorColor,
    },
    statusBadgeText: {
      color: colors.primaryTextColor,
      fontSize: 13,
      fontWeight: "800",
      lineHeight: 15,
    },
    currentStatusBadge: {
      position: "absolute",
      top: 5,
      right: 5,
      width: 18,
      height: 18,
      borderRadius: 9,
      borderWidth: 2,
      borderColor: colors.orangeColor,
      alignItems: "center",
      justifyContent: "center",
    },
    currentStatusDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.orangeColor,
    },
  });
};

const styles = StyleSheet.create({
  legendItem: {
    minHeight: 34,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    borderWidth: 1,
    borderRadius: 17,
  },
  legendIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
  },
  legendSymbol: {
    fontSize: 12,
    fontWeight: "800",
    lineHeight: 14,
  },
  legendText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
