import React, { useState, useCallback, useRef } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal, TouchableWithoutFeedback } from 'react-native'
import { useSubscription, dispatch } from '@flexsurfer/reflex'
import { EVENT_IDS } from 'shared/event-ids'
import { SUB_IDS } from 'shared/sub-ids'
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

  return (
    <View style={styles.categoriesContainer}>
      <TouchableOpacity 
        style={styles.categorySelectButton}
        onPress={openPopup}
        ref={buttonRef}
      >
        <Text style={styles.buttonText}>{displayText}</Text>
        <Text style={styles.filterIcon}>▼</Text>
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
                <View style={[styles.categoryPopup, {
                  position: 'absolute',
                  top: popupPosition.y + popupPosition.height,
                  left: popupPosition.x,
                  width: popupPosition.width,
                }]}>
                  <ScrollView>
                    <TouchableOpacity
                      onPress={() => handleCategoryClick(null)}
                      style={[styles.categoryButton, selectedCategory === null && styles.active]}
                    >
                      <Text style={[styles.buttonText, selectedCategory === null && styles.activeText]}>All ({questions?.length ?? 0})</Text>
                    </TouchableOpacity>
                    <FavoritesButton 
                      onPress={() => handleCategoryClick('favorites')}
                    />
                    {categories?.map(([category, count]) => (
                      <TouchableOpacity
                        key={category}
                        onPress={() => handleCategoryClick(category)}
                        style={[styles.categoryButton, selectedCategory === category && styles.active]}
                      >
                        <Text style={[styles.buttonText, selectedCategory === category && styles.activeText]}>{category} ({count})</Text>
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

const styles = StyleSheet.create({
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
    color: '#000',
    fontWeight: '500',
  },
  filterIcon: {
    marginLeft: 4,
    fontSize: 14,
    color: '#000',
  },
  categoryPopup: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    elevation: 5,
    shadowColor: '#000',
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
    backgroundColor: '#e6f3ff',
  },
  activeText: {
    color: '#007bff',
  },
}) 