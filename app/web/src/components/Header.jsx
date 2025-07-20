import { useCallback, useMemo, memo } from 'react'
import { useSubscription, dispatch } from '@flexsurfer/reflex'
import { FavoritesButton } from './FavoritesButton.jsx'
import { EVENT_IDS } from '/shared/event-ids'
import { SUB_IDS } from '/shared/sub-ids'
import '../styles/Header.css'

export const Header = memo(() => {

  const questions = useSubscription([SUB_IDS.QUESTIONS])
  const categories = useSubscription([SUB_IDS.CATEGORIES])
  const selectedCategory = useSubscription([SUB_IDS.SELECTED_CATEGORY])
  const showVocabulary = useSubscription([SUB_IDS.SHOW_VOCABULARY])

  const toggleVocabulary = useCallback(() => { dispatch([EVENT_IDS.TOGGLE_VOCABULARY]) }, [])
  const handleCategoryClick = useCallback((category) => { dispatch([EVENT_IDS.SET_SELECTED_CATEGORY, category]) }, [])

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
      <FavoritesButton
        key="favorites"
        onCategoryClick={handleCategoryClick}
      />
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
  }, [selectedCategory])

  return (
    <div className="header">

      {/* Categories */}
      <div className="categories-container">
        <div className="categories-row">
          {categoryButtons}
        </div>
      </div>

      <button
        onClick={toggleVocabulary}
        className={`tab vocabulary-tab ${showVocabulary ? 'active' : ''}`}
      >
        📖
      </button>
    </div>
  )
})