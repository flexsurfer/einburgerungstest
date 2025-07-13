import { memo, useCallback, useMemo } from 'react'
import { useSubscription, dispatch } from '@flexsurfer/reflex'
import { Star } from './Star'
import '../styles/Header.css'

const MODES = [
  { id: 'testing', label: 'Questions' },
  { id: 'review', label: 'Answers' },
  { id: 'vocabulary', label: 'Vocabulary' },
  // Add more modes here in the future
]

export const Header = () => {
  // Subscribe to store state instead of using props
  const questions = useSubscription(['questions'])
  const categories = useSubscription(['categories'])
  const selectedCategory = useSubscription(['selectedCategory'])
  const currentMode = useSubscription(['mode'])
  const favoriteCount = useSubscription(['favoriteCount'])

  const onModeChange = (newMode) => {
    dispatch(['setMode', newMode])
  }
  const handleCategoryClick = useCallback((category) => {
    dispatch(['setSelectedCategory', category])
  }, [])

  const categoryButtons = useMemo(() => {
    const allButton = (
      <button
        key="all"
        onClick={() => handleCategoryClick(null)}
        className={`category-button ${selectedCategory === null ? 'active' : ''}`}
      >
        All ({questions.length})
      </button>
    )

    const favoritesButton = (
      <button
        key="favorites"
        onClick={() => handleCategoryClick('favorites')}
        className={`category-button ${selectedCategory === 'favorites' ? 'active' : ''}`}
      >
        <Star/>
        Favorites ({favoriteCount})
      </button>
    )

    const categoryButtonsList = categories.map(([category, count]) => (
      <button
        key={category}
        onClick={() => handleCategoryClick(category)}
        className={`category-button ${selectedCategory === category ? 'active' : ''}`}
      >
        {category} ({count})
      </button>
    ))

    return [allButton, favoritesButton, ...categoryButtonsList]
  }, [categories, questions.length, selectedCategory, handleCategoryClick, favoriteCount])

  return (
    <div className="header">
      {/* Mode Tabs */}
      <div className="tabs-container">
        {MODES.map(mode => (
          <button
            key={mode.id}
            onClick={() => onModeChange(mode.id)}
            className={`tab ${currentMode === mode.id ? 'active' : ''}`}
          >
            {mode.label}
          </button>
        ))}
      </div>

      {/* Categories */}
      {currentMode !== 'vocabulary' && (
        <div className="categories-container">
          <div className="categories-row">
            {categoryButtons}
          </div>
        </div>
      )}
    </div>
  )
}