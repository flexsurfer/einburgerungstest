import React, { memo, useEffect } from 'react'
import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native'
import { useSubscription } from '@flexsurfer/reflex'
import { SUB_IDS } from 'shared/sub-ids'
import { useColors, type Colors } from '../theme'
import { QuestionCard } from './QuestionCard'
import { NavigationControls } from './NavigationControls'
import { QuestionPicker } from './QuestionPicker'
import { Question } from '../types'

export const QuestionCardView = memo(() => {
  const currentQuestion = useSubscription([SUB_IDS.CURRENT_QUESTION], "QuestionCardView") as Question | null
  const colors = useColors()
  const dimensions = Dimensions.get('window')

  const filteredQuestions = useSubscription([SUB_IDS.FILTERED_QUESTIONS], "QuestionView") as Question[]

  if (!filteredQuestions || filteredQuestions.length === 0) {
    return (
      <View style={styles(colors).emptyContainer}>
        <Text style={styles(colors).emptyText}>No questions available</Text>
      </View>
    )
  }

  if (!currentQuestion) {
    return (
      <View style={styles(colors).emptyContainer}>
        <Text style={styles(colors).emptyText}>Loading question...</Text>
      </View>
    )
  }
  
  return (
    <View style={styles(colors).phoneContainer}>
      <ScrollView style={styles(colors).singleCardContainer}>
        <QuestionCard
          key={currentQuestion.globalIndex}
          question={currentQuestion}
          isTablet={false}
          numColumns={1}
          screenWidth={dimensions.width}
          gap={0}
        />
      </ScrollView>
      <NavigationControls isVisible={true} />
      <QuestionPicker />
    </View>
  )
})

const styles = (colors: Colors) => StyleSheet.create({
  phoneContainer: {
    flex: 1,
    backgroundColor: colors.bgColor,
  },
  singleCardContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textColor,
    opacity: 0.6,
    textAlign: 'center',
  },
})