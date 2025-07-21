import React, { memo, useCallback } from 'react'
import { View, Text, StyleSheet, FlatList } from 'react-native'
import { useSubscription } from '@flexsurfer/reflex'
import { SUB_IDS } from 'shared/sub-ids'
import { QuestionCard } from './QuestionCard'
import { Question } from '../types'
import { questionListRef } from '../refs';

export const QuestionList = memo(() => {
  const filteredQuestions = useSubscription([SUB_IDS.FILTERED_QUESTIONS]) as Question[]

  const renderQuestion = useCallback(({ item }: { item: Question }) => (
    <QuestionCard question={item} />
  ), [])

  const keyExtractor = useCallback((item: Question) => item.globalIndex.toString(), [])
  
  const ItemSeparatorComponent = useCallback(() => (
    <View style={styles.separator} />
  ), [])

  if (!filteredQuestions || filteredQuestions.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No questions available</Text>
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
      contentContainerStyle={styles.listContainer}
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

const styles = StyleSheet.create({
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
    color: '#666',
    textAlign: 'center',
  },
})