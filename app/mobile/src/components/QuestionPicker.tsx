import React, { memo, useCallback, useMemo } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  Modal,
  FlatList,
  StyleSheet,
  Dimensions
} from 'react-native'
import { useSubscription, dispatch } from '@flexsurfer/reflex'
import { SUB_IDS } from 'shared/sub-ids'
import { EVENT_IDS } from 'shared/event-ids'
import { useColors, type Colors } from '../theme'

export const QuestionPicker = memo(() => {
  const pickerItems = useSubscription([SUB_IDS.QUESTION_PICKER_ITEMS], "QuestionPicker") as Array<{ key: string, className: string, ariaLabel: string, number: number, isAnswered: boolean, indicatorClass: string, filteredIndex: number, isSelected: boolean, isCorrect: boolean }>
  const showQuestionPicker = useSubscription([SUB_IDS.SHOW_QUESTION_PICKER], "QuestionPicker") as boolean
  const colors = useColors()

  // Memoize styles to avoid recreation on every render
  const styleSheet = useMemo(() => createStyles(colors), [colors])

  const handleQuestionSelect = useCallback((index: number) => {
    dispatch([EVENT_IDS.NAVIGATE_TO_QUESTION, index])
  }, [])

  const handleClose = useCallback(() => {
    dispatch([EVENT_IDS.SHOW_QUESTION_PICKER, false])
  }, [])

  // Pre-calculate style combinations for better performance
  const questionItemStyles = useMemo(() => ({
    base: styleSheet.questionItem,
    selected: [styleSheet.questionItem, styleSheet.selectedQuestionItem],
    correct: [styleSheet.questionItem, styleSheet.correctQuestionItem],
    incorrect: [styleSheet.questionItem, styleSheet.incorrectQuestionItem],
    selectedCorrect: [styleSheet.questionItem, styleSheet.selectedQuestionItem, styleSheet.correctQuestionItem],
    selectedIncorrect: [styleSheet.questionItem, styleSheet.selectedQuestionItem, styleSheet.incorrectQuestionItem],
  }), [styleSheet])

  const textStyles = useMemo(() => ({
    base: styleSheet.questionItemText,
    selected: [styleSheet.questionItemText, styleSheet.selectedQuestionItemText],
    answered: [styleSheet.questionItemText, styleSheet.answeredQuestionItemText],
    selectedAnswered: [styleSheet.questionItemText, styleSheet.selectedQuestionItemText, styleSheet.answeredQuestionItemText],
  }), [styleSheet])

  const getQuestionItemStyle = useCallback((item) => {
    if (item.isSelected && item.isAnswered) {
      return item.isCorrect ? questionItemStyles.selectedCorrect : questionItemStyles.selectedIncorrect
    }
    if (item.isSelected) return questionItemStyles.selected
    if (item.isAnswered) {
      return item.isCorrect ? questionItemStyles.correct : questionItemStyles.incorrect
    }
    return questionItemStyles.base
  }, [questionItemStyles])

  const getTextStyle = useCallback((item) => {
    if (item.isSelected && item.isAnswered) return textStyles.selectedAnswered
    if (item.isSelected) return textStyles.selected
    if (item.isAnswered) return textStyles.answered
    return textStyles.base
  }, [textStyles])

  const renderQuestionItem = useCallback(({ item }) => {
    return (
      <Pressable
        style={({ pressed }) => [
          getQuestionItemStyle(item),
          pressed && !item.isSelected && styleSheet.pressedQuestionItem,
        ]}
        onPress={() => handleQuestionSelect(item.filteredIndex)}
        accessibilityLabel={item.ariaLabel}
        android_ripple={{ color: colors.accentMedium, borderless: false }}
        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        pressRetentionOffset={{ top: 12, bottom: 12, left: 12, right: 12 }}
        onStartShouldSetResponderCapture={() => true}
      >
        <Text style={getTextStyle(item)}>
          {item.number}
        </Text>
        {item.isAnswered && (
          <View style={[
            styleSheet.answerIndicator,
            item.isCorrect ? styleSheet.correctIndicator : styleSheet.incorrectIndicator
          ]} />
        )}
      </Pressable>
    )
  }, [getQuestionItemStyle, getTextStyle, handleQuestionSelect, styleSheet])

  const keyExtractor = useCallback((item, index: number) => item.key, [])

  if (!showQuestionPicker || !pickerItems || pickerItems.length === 0) {
    return null
  }

  return (
    <Modal
      visible={showQuestionPicker}
      transparent={true}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styleSheet.modalOverlay}>
        <View style={styleSheet.modalContent}>
          <View style={styleSheet.modalHeader}>
            <Text style={styleSheet.modalTitle}>Select Question</Text>
            <TouchableOpacity
              style={styleSheet.closeButton}
              onPress={handleClose}
              accessibilityLabel="Close question picker"
            >
              <Text style={styleSheet.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styleSheet.legendContainer}>
            <View style={styleSheet.legendItem}>
              <View style={[styleSheet.legendDot, styleSheet.correctIndicator]} />
              <Text style={styleSheet.legendText}>Correct</Text>
            </View>
            <View style={styleSheet.legendItem}>
              <View style={[styleSheet.legendDot, styleSheet.incorrectIndicator]} />
              <Text style={styleSheet.legendText}>Incorrect</Text>
            </View>
            <View style={styleSheet.legendItem}>
              <View style={[styleSheet.legendDot, styleSheet.unansweredIndicator]} />
              <Text style={styleSheet.legendText}>Unanswered</Text>
            </View>
          </View>

          <FlatList
            data={pickerItems}
            renderItem={renderQuestionItem}
            keyExtractor={keyExtractor}
            numColumns={5}
            contentContainerStyle={styleSheet.questionsGrid}
            keyboardShouldPersistTaps="always"
            showsVerticalScrollIndicator={false}
            // Performance optimizations for Android - tuned for fast scrolling without gaps
            removeClippedSubviews={false} // Disabled to prevent gaps during fast scroll
            initialNumToRender={30} // Render more items initially to cover viewport + buffer
            maxToRenderPerBatch={40} // Larger batches to keep up with fast scrolling
            windowSize={20} // Larger window to keep more items rendered around viewport
            updateCellsBatchingPeriod={100} // Slower updates to prevent rendering conflicts
            disableVirtualization={false}
            scrollEventThrottle={16}
            legacyImplementation={false} // Use newer FlatList implementation
          />
        </View>
      </View>
    </Modal>
  )
})

const { width: screenWidth, height: screenHeight } = Dimensions.get('window')

const createStyles = (colors: Colors) => {
  const modalWidth = Math.min(screenWidth - 40, 400)
  const numColumns = 5
  const gridPadding = 40 // 20px padding on each side
  const itemMargin = 5
  const availableWidth = modalWidth - gridPadding
  const itemSize = (availableWidth - (itemMargin * 2 * numColumns)) / numColumns

  return StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: colors.bgColor,
      borderRadius: 16,
      width: modalWidth,
      maxHeight: screenHeight * 0.8,
      paddingBottom: 20,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderColor,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.textColor,
    },
    closeButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.borderColor,
      justifyContent: 'center',
      alignItems: 'center',
    },
    closeButtonText: {
      fontSize: 16,
      color: colors.textColor,
      fontWeight: 'bold',
    },
    legendContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderColor,
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    legendDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      marginRight: 6,
    },
    legendText: {
      fontSize: 12,
      color: colors.textColor,
      opacity: 0.7,
    },
    questionsGrid: {
      padding: 20,
      paddingBottom: 0,
    },
    questionItem: {
      width: itemSize,
      height: itemSize,
      margin: itemMargin,
      borderRadius: 8,
      backgroundColor: colors.bgColor,
      borderWidth: 1,
      borderColor: colors.borderColor,
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
    },
    pressedQuestionItem: {
      backgroundColor: colors.accentLight,
    },
    selectedQuestionItem: {
      backgroundColor: colors.accentColor,
      borderColor: colors.accentColor,
    },
    correctQuestionItem: {
      borderColor: '#4CAF50',
      borderWidth: 2,
    },
    incorrectQuestionItem: {
      borderColor: '#F44336',
      borderWidth: 2,
    },
    questionItemText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.textColor,
    },
    selectedQuestionItemText: {
      color: colors.bgColor,
    },
    answeredQuestionItemText: {
      fontWeight: 'bold',
    },
    answerIndicator: {
      position: 'absolute',
      top: 2,
      right: 2,
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    correctIndicator: {
      backgroundColor: '#4CAF50',
    },
    incorrectIndicator: {
      backgroundColor: '#F44336',
    },
    unansweredIndicator: {
      backgroundColor: colors.borderColor,
    },
  })
}