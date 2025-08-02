import React, { memo } from 'react'
import { useCallback } from 'react'
import { View, TouchableOpacity, Text, ViewStyle, StyleSheet } from 'react-native'
import { useSubscription, dispatch } from '@flexsurfer/reflex'
import { EVENT_IDS } from 'shared/event-ids'
import { SUB_IDS } from 'shared/sub-ids'
import { useColors, type Colors } from '../theme'
import { Categories } from './Categories'

export const Header = memo(({ style }: { style?: ViewStyle }) => {
  const themeColors = useColors() as Colors
  const theme = useSubscription([SUB_IDS.THEME], "Header")

  const toggleTheme = useCallback(() => {
    dispatch([EVENT_IDS.TOGGLE_THEME])
  }, [])

  return (
    <View style={[styles(themeColors).header, style]}>
      <Categories />
      <TouchableOpacity onPress={toggleTheme} style={styles(themeColors).themeButton}>
        <Text style={styles(themeColors).themeIcon}>{theme === 'dark' ? '🌙' : '🌞'}</Text>
      </TouchableOpacity>
    </View>
  )
})

const styles = (colors: Colors) => StyleSheet.create({
  header: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgColor,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderColor,
    paddingHorizontal: 10,
    elevation: 4,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  themeButton: {
    padding: 10,
  },
  themeIcon: {
    fontSize: 20,
    color: colors.textColor,
  },
}) 