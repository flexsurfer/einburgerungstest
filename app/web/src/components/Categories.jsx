import { useCallback, memo, useState } from 'react'
import { useSubscription, dispatch } from '@flexsurfer/reflex'
import { FavoritesButton } from './FavoritesButton.jsx'
import { EVENT_IDS } from '/shared/event-ids'
import { SUB_IDS } from '/shared/sub-ids'
import '../styles/Header.css'

export const Categories = memo(() => {
  const questions = useSubscription([SUB_IDS.QUESTIONS])
  const categories = useSubscription([SUB_IDS.CATEGORIES])
  const selectedCategory = useSubscription([SUB_IDS.SELECTED_CATEGORY])
  const favoriteCount = useSubscription([SUB_IDS.FAVORITE_COUNT])

  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const handleCategoryClick = useCallback((category) => { dispatch([EVENT_IDS.SET_SELECTED_CATEGORY, category]) }, [])

  return (
    <div className="categories-container">
      <div className="category-select-wrapper">
        
        <button className="category-select-button" onClick={() => setIsPopupOpen(!isPopupOpen)}>
          {selectedCategory === null ? `All (${questions.length})` : selectedCategory === 'favorites' ? `Favorites (${favoriteCount})` : `${selectedCategory} (${categories.find(([cat]) => cat === selectedCategory)?.[1] || 0})`}
          <span className="filter-icon">▼</span>
        </button>

        {isPopupOpen && (
          <div className="category-popup">
            <button
              onClick={() => { handleCategoryClick(null); setIsPopupOpen(false); }}
              className={`category-button ${selectedCategory === null ? 'active' : ''}`}
            >
              All ({questions.length})
            </button>
            <FavoritesButton
              key="favorites"
              onCategoryClick={(cat) => { handleCategoryClick(cat); setIsPopupOpen(false); }}
            />
            {categories.map(([category, count]) => (
              <button
                key={category}
                onClick={() => { handleCategoryClick(category); setIsPopupOpen(false); }}
                className={`category-button ${selectedCategory === category ? 'active' : ''}`}
              >
                {category} ({count})
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}) 