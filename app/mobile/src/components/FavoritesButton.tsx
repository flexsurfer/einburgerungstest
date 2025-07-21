import { TouchableOpacity, Text, View, StyleSheet } from 'react-native'
import { useSubscription } from '@flexsurfer/reflex'
import { SUB_IDS } from 'shared/sub-ids'
import { Star } from './Star'

export const FavoritesButton = ({ onPress }) => {
  const selectedCategory = useSubscription([SUB_IDS.SELECTED_CATEGORY]) as string | null
  const favoriteCount = useSubscription([SUB_IDS.FAVORITE_COUNT]) as number

  const isActive = selectedCategory === 'favorites'

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.categoryButton, isActive && styles.active]}
    >
      <Star />
      <Text style={[styles.text, isActive && styles.activeText]}>Favorites ({favoriteCount})</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  active: {
    backgroundColor: '#e6f3ff',
  },
  text: {
    marginLeft: 8,
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
  },
  activeText: {
    color: '#007bff',
  },
}) 