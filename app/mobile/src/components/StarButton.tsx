import React, { memo } from 'react'
import { TouchableOpacity, Text, StyleSheet } from 'react-native'
import { useSubscription, dispatch } from '@flexsurfer/reflex'
import { SUB_IDS } from 'shared/sub-ids'
import { EVENT_IDS } from 'shared/event-ids'

interface StarButtonProps {
  globalIndex: number
}

export const StarButton = memo<StarButtonProps>(({ globalIndex }) => {
  const favorites = useSubscription([SUB_IDS.FAVORITES]) as number[]
  const isFavorite = favorites.includes(globalIndex)

  const handlePress = () => {
    dispatch([EVENT_IDS.TOGGLE_FAVORITE, globalIndex])
  }

  return (
    <TouchableOpacity
      style={styles.starButton}
      onPress={handlePress}
      activeOpacity={0.7}
      hitSlop={{ top: 10, bottom: 10, left: 20, right: 20 }}
    >
      <Text style={[styles.starIcon, isFavorite ? styles.starIconActive : styles.starIconInactive]}>
        {isFavorite ? '★' : '☆'}
      </Text>
    </TouchableOpacity>
  )
})

const styles = StyleSheet.create({
  starButton: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  starIcon: {
    fontSize: 24,
  },
  starIconInactive: {
    color: '#F1C40F',
  },
  starIconActive: {
    color: '#F1C40F',
  },
}) 