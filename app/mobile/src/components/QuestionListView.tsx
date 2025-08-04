import React, { memo, useCallback, useMemo, useState, useEffect } from 'react'
import { View, Text, FlatList, StyleSheet, Dimensions } from 'react-native'
import { useSubscription } from '@flexsurfer/reflex'
import { SUB_IDS } from 'shared/sub-ids'
import { useColors, type Colors } from '../theme'
import { QuestionCard } from './QuestionCard'
import { Question } from '../types'
import { questionListRef } from '../refs'

// Calculate number of columns and gap based on screen width
const calculateLayout = (screenWidth: number, minCardWidth: number, padding: number, gap: number): number => {
  // Calculate how many columns can fit
  const maxColumns = Math.floor((screenWidth - padding) / (minCardWidth + gap))

  // Ensure at least 2 columns on tablets, at least 3 in landscape
  const minColumns = screenWidth > 900 ? 3 : 2
  const numColumns = Math.max(minColumns, Math.min(maxColumns, 6)) // Cap at 6 columns max

  return numColumns
}

export const QuestionListView = memo(() => {
  const colors = useColors()

  const filteredQuestions = useSubscription([SUB_IDS.FILTERED_QUESTIONS], "QuestionView") as Question[]

  const [dimensions, setDimensions] = useState(Dimensions.get('window'))
  const minCardWidth = 280 // Minimum card width in pixels
  const padding = 40 // Total horizontal padding
  const gap = 20 // Gap between columns

  const numColumns = useMemo(() => calculateLayout(dimensions.width, minCardWidth, padding, gap), [dimensions.width])
  
  // Listen for dimension changes (rotation)
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window)
    })

    return () => subscription?.remove()
  }, [])

  const renderQuestion = useCallback(({ item }: { item: Question }) => (
    <QuestionCard
      question={item}
      isTablet={true}
      numColumns={numColumns}
      screenWidth={dimensions.width}
      gap={gap}
    />
  ), [numColumns, dimensions.width, gap])

  const keyExtractor = useCallback((item: Question) => item.globalIndex.toString(), [])

  const ItemSeparatorComponent = useCallback(() => (
    <View style={styles(colors, gap).separator} />
  ), [colors, gap])

  if (!filteredQuestions || filteredQuestions.length === 0) {
    return (
      <View style={styles(colors, gap).emptyContainer}>
        <Text style={styles(colors, gap).emptyText}>No questions available</Text>
      </View>
    )
  }

  return (
    <FlatList
      ref={questionListRef}
      data={filteredQuestions}
      renderItem={renderQuestion}
      keyExtractor={keyExtractor}
      numColumns={numColumns}
      key={numColumns} // Force re-render when numColumns changes
      columnWrapperStyle={styles(colors, padding).row}
      contentContainerStyle={styles(colors, padding).listContainer}
      ItemSeparatorComponent={ItemSeparatorComponent}
      showsVerticalScrollIndicator={false}
      removeClippedSubviews={true}
      maxToRenderPerBatch={20}
      windowSize={10}
      initialNumToRender={20}
      updateCellsBatchingPeriod={50}
      maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
    />
  )
})

const styles = (colors: Colors, padding = 40) => StyleSheet.create({
  listContainer: {
    paddingHorizontal: 0,
    paddingVertical: 16,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: padding / 2,
    marginBottom: 20,
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