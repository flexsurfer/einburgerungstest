import React, { useState, useCallback, useRef } from 'react'
import { View, Text, TouchableOpacity, ScrollView, Modal, TouchableWithoutFeedback, StyleSheet } from 'react-native'
import { useSubscription, dispatch } from '@flexsurfer/reflex'
import { EVENT_IDS } from 'shared/event-ids'
import { SUB_IDS } from 'shared/sub-ids'
import { useColors, type Colors } from '../theme'
import { FavoritesButton } from './FavoritesButton'
import { Question } from '../types'

export const Categories = () => {
  const questions = useSubscription([SUB_IDS.QUESTIONS]) as Question[]
  const categories = useSubscription([SUB_IDS.CATEGORIES]) as [string, number][]
  const selectedCategory = useSubscription([SUB_IDS.SELECTED_CATEGORY]) as string | null
  const favoriteCount = useSubscription([SUB_IDS.FAVORITE_COUNT]) as number

  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0, width: 0, height: 0 })
  const buttonRef = useRef(null)

  const handleCategoryClick = useCallback((category) => {
    dispatch([EVENT_IDS.SET_SELECTED_CATEGORY, category])
    setIsPopupOpen(false)
  }, [])

  const openPopup = () => {
    if (buttonRef.current) {
      buttonRef.current.measureInWindow((x, y, width, height) => {
        setPopupPosition({ x, y, width, height })
        setIsPopupOpen(!isPopupOpen)
      })
    } else {
      setIsPopupOpen(!isPopupOpen)
    }
  }

  const displayText = selectedCategory === null 
    ? `All (${questions?.length ?? 0})` 
    : selectedCategory === 'favorites' 
      ? `Favorites (${favoriteCount})` 
      : `${selectedCategory} (${categories?.find(([cat]) => cat === selectedCategory)?.[1] ?? 0})`

  const colors = useColors()

  return (
    <View style={styles(colors).categoriesContainer}>
      <TouchableOpacity 
        style={styles(colors).categorySelectButton}
        onPress={openPopup}
        ref={buttonRef}
      >
        <Text style={styles(colors).buttonText}>{displayText}</Text>
        <Text style={styles(colors).filterIcon}>▼</Text>
      </TouchableOpacity>
      {isPopupOpen && (
        <Modal
          visible={isPopupOpen}
          transparent={true}
          animationType="none"
          onRequestClose={() => setIsPopupOpen(false)}
        >
          <TouchableWithoutFeedback onPress={() => setIsPopupOpen(false)}>
            <View style={{ flex: 1 }}>
              <TouchableWithoutFeedback>
                <View style={[styles(colors).categoryPopup, {
                  position: 'absolute',
                  top: popupPosition.y + popupPosition.height,
                  left: popupPosition.x,
                  width: popupPosition.width,
                }]}>
                  <ScrollView>
                    <TouchableOpacity
                      onPress={() => handleCategoryClick(null)}
                      style={[styles(colors).categoryButton, selectedCategory === null && styles(colors).active]}
                    >
                      <Text style={[styles(colors).buttonText, selectedCategory === null && styles(colors).activeText]}>All ({questions?.length ?? 0})</Text>
                    </TouchableOpacity>
                    <FavoritesButton 
                      onPress={() => handleCategoryClick('favorites')}
                    />
                    {categories?.map(([category, count]) => (
                      <TouchableOpacity
                        key={category}
                        onPress={() => handleCategoryClick(category)}
                        style={[styles(colors).categoryButton, selectedCategory === category && styles(colors).active]}
                      >
                        <Text style={[styles(colors).buttonText, selectedCategory === category && styles(colors).activeText]}>{category} ({count})</Text>
                      </TouchableOpacity>
                    )) ?? null}
                  </ScrollView>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      )}
    </View>
  )
}

const styles = (colors: Colors) => StyleSheet.create({
  categoriesContainer: {
    flex: 1,
  },
  categorySelectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  buttonText: {
    fontSize: 14,
    color: colors.textColor,
    fontWeight: '500',
  },
  filterIcon: {
    marginLeft: 4,
    fontSize: 14,
    color: colors.textColor,
  },
  categoryPopup: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    backgroundColor: colors.bgColor,
    borderWidth: 1,
    borderColor: colors.borderColor,
    borderRadius: 6,
    elevation: 5,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    maxHeight: 400,
    zIndex: 100,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  active: {
    backgroundColor: colors.accentMedium,
  },
  activeText: {
    color: colors.accentColor,
  },
}) 