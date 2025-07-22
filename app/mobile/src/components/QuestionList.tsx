import React, { memo, useCallback } from 'react'
import { View, Text, FlatList, StyleSheet } from 'react-native'
import { useSubscription } from '@flexsurfer/reflex'
import { SUB_IDS } from 'shared/sub-ids'
import { useColors, type Colors } from '../theme'
import { QuestionCard } from './QuestionCard'
import { Question } from '../types'
import { questionListRef } from '../refs';

export const QuestionList = memo(() => {
  const filteredQuestions = useSubscription([SUB_IDS.FILTERED_QUESTIONS]) as Question[]
  const colors = useColors()

  const renderQuestion = useCallback(({ item }: { item: Question }) => (
    <QuestionCard question={item} />
  ), [])

  const keyExtractor = useCallback((item: Question) => item.globalIndex.toString(), [])
  
  const ItemSeparatorComponent = useCallback(() => (
    <View style={styles(colors).separator} />
  ), [])

  if (!filteredQuestions || filteredQuestions.length === 0) {
    return (
      <View style={styles(colors).emptyContainer}>
        <Text style={styles(colors).emptyText}>No questions available</Text>
      </View>
    )
  }

  return (
    <FlatList
      ref={questionListRef}
      data={filteredQuestions}
      renderItem={renderQuestion}
      keyExtractor={keyExtractor}
      ItemSeparatorComponent={ItemSeparatorComponent}
      contentContainerStyle={styles(colors).listContainer}
      showsVerticalScrollIndicator={false}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={10}
      initialNumToRender={10}
      updateCellsBatchingPeriod={50}
      maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
    />
  )
})

const styles = (colors: Colors) => StyleSheet.create({
  listContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  separator: {
    height: 12,
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