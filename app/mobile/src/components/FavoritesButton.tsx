import { TouchableOpacity, Text, StyleSheet } from 'react-native'
import { useSubscription } from '@flexsurfer/reflex'
import { SUB_IDS } from 'shared/sub-ids'
import { useColors, type Colors } from '../theme'
import { Star } from './Star'

export const FavoritesButton = ({ onPress }) => {
  const selectedCategory = useSubscription([SUB_IDS.SELECTED_CATEGORY]) as string | null
  const favoriteCount = useSubscription([SUB_IDS.FAVORITE_COUNT]) as number

  const isActive = selectedCategory === 'favorites'

  const colors = useColors()

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles(colors).categoryButton, isActive && styles(colors).active]}
    >
      <Star />
      <Text style={[styles(colors).text, isActive && styles(colors).activeText]}>Favorites ({favoriteCount})</Text>
    </TouchableOpacity>
  )
}

const styles = (colors: Colors) => StyleSheet.create({
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  active: {
    backgroundColor: colors.accentMedium,
  },
  text: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.textColor,
    fontWeight: '500',
  },
  activeText: {
    color: colors.accentColor,
  },
}) 