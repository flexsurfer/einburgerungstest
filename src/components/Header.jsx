import { useCallback, useMemo, memo } from 'react'
import { useSubscription, dispatch } from '@flexsurfer/reflex'
import { FavoritesButton } from './FavoritesButton'
import { EVENT_IDS } from '../event-ids.js'
import { SUB_IDS } from '../sub-ids.js'
import '../styles/Header.css'

const MODES = [
  { id: 'testing', label: 'Questions' },
  { id: 'review', label: 'Answers' },
  // Add more modes here in the future
]

export const Header = memo(() => {

  const questions = useSubscription([SUB_IDS.QUESTIONS])
  const categories = useSubscription([SUB_IDS.CATEGORIES])
  const selectedCategory = useSubscription([SUB_IDS.SELECTED_CATEGORY])
  const currentMode = useSubscription([SUB_IDS.MODE])
  const showVocabulary = useSubscription([SUB_IDS.SHOW_VOCABULARY])

  const onModeChange = useCallback((newMode) => {dispatch([EVENT_IDS.SET_MODE, newMode])}, [])
  const toggleVocabulary = useCallback(() => {dispatch([EVENT_IDS.TOGGLE_VOCABULARY])}, [])
  const handleCategoryClick = useCallback((category) => {dispatch([EVENT_IDS.SET_SELECTED_CATEGORY, category])}, [])

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
      {/* Mode Tabs */}
      <div className="tabs-container">
        <div className="mode-tabs">
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
        <button
          onClick={toggleVocabulary}
          className={`tab vocabulary-tab ${showVocabulary ? 'active' : ''}`}
        >
          Vocabulary
        </button>
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