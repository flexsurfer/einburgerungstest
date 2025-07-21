import React, { memo } from 'react'
import { View, StyleSheet, ViewStyle } from 'react-native'
import { Categories } from './Categories'

export const Header = memo(({ style }: { style?: ViewStyle }) => {
  return (
    <View style={[styles.header, style]}>
      <Categories />
    </View>
  )
})

const styles = StyleSheet.create({
  header: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingHorizontal: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
}) 