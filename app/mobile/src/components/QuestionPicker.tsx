import React, { memo, useCallback } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
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

  const handleQuestionSelect = useCallback((index: number) => {
    dispatch([EVENT_IDS.NAVIGATE_TO_QUESTION, index])
  }, [])

  const handleClose = useCallback(() => {
    dispatch([EVENT_IDS.SHOW_QUESTION_PICKER, false])
  }, [])

  const renderQuestionItem = useCallback(({ item }) => {
    return (
      <TouchableOpacity
        style={[
          styles(colors).questionItem,
          item.isSelected && styles(colors).selectedQuestionItem,
          item.isAnswered && (item.isCorrect ? styles(colors).correctQuestionItem : styles(colors).incorrectQuestionItem)
        ]}
        onPress={() => handleQuestionSelect(item.filteredIndex)}
        accessibilityLabel={item.ariaLabel}
      >
        <Text style={[
          styles(colors).questionItemText,
          item.isSelected && styles(colors).selectedQuestionItemText,
          item.isAnswered && styles(colors).answeredQuestionItemText
        ]}>
          {item.number}
        </Text>
        {item.isAnswered && (
          <View style={[
            styles(colors).answerIndicator,
            item.isCorrect ? styles(colors).correctIndicator : styles(colors).incorrectIndicator
          ]} />
        )}
      </TouchableOpacity>
    )
  }, [colors, handleQuestionSelect])

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
      <View style={styles(colors).modalOverlay}>
        <View style={styles(colors).modalContent}>
          <View style={styles(colors).modalHeader}>
            <Text style={styles(colors).modalTitle}>Select Question</Text>
            <TouchableOpacity
              style={styles(colors).closeButton}
              onPress={handleClose}
              accessibilityLabel="Close question picker"
            >
              <Text style={styles(colors).closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles(colors).legendContainer}>
            <View style={styles(colors).legendItem}>
              <View style={[styles(colors).legendDot, styles(colors).correctIndicator]} />
              <Text style={styles(colors).legendText}>Correct</Text>
            </View>
            <View style={styles(colors).legendItem}>
              <View style={[styles(colors).legendDot, styles(colors).incorrectIndicator]} />
              <Text style={styles(colors).legendText}>Incorrect</Text>
            </View>
            <View style={styles(colors).legendItem}>
              <View style={[styles(colors).legendDot, styles(colors).unansweredIndicator]} />
              <Text style={styles(colors).legendText}>Unanswered</Text>
            </View>
          </View>

          <FlatList
            data={pickerItems}
            renderItem={renderQuestionItem}
            keyExtractor={keyExtractor}
            numColumns={5}
            contentContainerStyle={styles(colors).questionsGrid}
            showsVerticalScrollIndicator={false}
            getItemLayout={(_, index) => ({
              length: 60,
              offset: 60 * Math.floor(index / 5),
              index,
            })}
          />
        </View>
      </View>
    </Modal>
  )
})

const { width: screenWidth, height: screenHeight } = Dimensions.get('window')

const styles = (colors: Colors) => StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.bgColor,
    borderRadius: 16,
    width: Math.min(screenWidth - 40, 400),
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
    flex: 1,
    height: 50,
    maxWidth: 50,
    margin: 5,
    borderRadius: 8,
    backgroundColor: colors.bgColor,
    borderWidth: 1,
    borderColor: colors.borderColor,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
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