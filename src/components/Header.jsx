import { memo, useCallback, useMemo } from 'react'
import { StarButton } from './StarButton'
import '../styles/Header.css'

const MODES = [
  { id: 'testing', label: 'Questions' },
  { id: 'review', label: 'Answers' },
  { id: 'vocabulary', label: 'Vocabulary' },
  // Add more modes here in the future
]

export const Header = memo(function Header({ 
  questions, 
  categories, 
  selectedCategory, 
  setSelectedCategory, 
  currentMode,
  onModeChange,
  favoriteCount
}) {
  const handleCategoryClick = useCallback((category) => {
    setSelectedCategory(category)
    // Smooth scroll to top
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }, [setSelectedCategory])

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
        <StarButton
          isFavorite={true}
          className="category-star"
          asSpan={true}
        />
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
      <div className="categories-container">
        <div className="categories-row">
          {categoryButtons}
        </div>
      </div>
    </div>
  )
}) 