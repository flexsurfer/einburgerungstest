import { useCallback, memo, useState, useEffect } from 'react'
import { useSubscription, dispatch } from '@flexsurfer/reflex'
import { FavoritesButton } from './FavoritesButton.jsx'
import { EVENT_IDS } from 'shared/event-ids'
import { EFFECT_IDS } from 'shared/effect-ids'
import { SUB_IDS } from 'shared/sub-ids'
import '../styles/Header.css'

export const Categories = memo(() => {
  const questions = useSubscription([SUB_IDS.QUESTIONS], "Categories")
  const categories = useSubscription([SUB_IDS.CATEGORIES], "Categories")
  const selectedCategory = useSubscription([SUB_IDS.SELECTED_CATEGORY], "Categories")
  const favoriteCount = useSubscription([SUB_IDS.FAVORITE_COUNT], "Categories")
  const wrongCount = useSubscription([SUB_IDS.WRONG_COUNT], "Categories")
  const selectedCount = useSubscription([SUB_IDS.SELECTED_CATEGORY_COUNT], "Categories")

  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const handleCategoryClick = useCallback((category) => { dispatch([EVENT_IDS.SET_SELECTED_CATEGORY, category]) }, [])
  const setOverFlow = useCallback((value) => { dispatch([EFFECT_IDS.SET_BODY_OVERFLOW, value]) }, [])

  useEffect(() => { if (isPopupOpen) { setOverFlow('hidden') } else { setOverFlow('auto') } }, [isPopupOpen])

  return (
    <div className="categories-container">
      <div className="category-select-wrapper">

        <button className="category-select-button" onClick={() => setIsPopupOpen(!isPopupOpen)}>
          {selectedCategory === null ? `All Questions (${questions.length})` :
           selectedCategory === 'favorites' ? `Favorites (${favoriteCount})` :
           selectedCategory === 'wrong' ? `Wrong answers (${wrongCount})` :
           selectedCategory === 'test' ? `Test (30)` :
           `${selectedCategory} (${selectedCount})`}
          <span className="filter-icon">▼</span>
        </button>

        {isPopupOpen && (
          <div className="category-popup">
            <button
              onClick={() => { handleCategoryClick(null); setIsPopupOpen(false); }}
              className={`category-button ${selectedCategory === null ? 'active' : ''}`}
            >
              All Questions ({questions.length})
            </button>
            <button
              key="test"
              onClick={() => { handleCategoryClick('test'); setIsPopupOpen(false); }}
              className={`category-button ${selectedCategory === 'test' ? 'active' : ''}`}
            >
              Test (30)
            </button>
            <FavoritesButton
              key="favorites"
              onCategoryClick={(cat) => { handleCategoryClick(cat); setIsPopupOpen(false); }}
            />
            <button
              key="wrong"
              onClick={() => { handleCategoryClick('wrong'); setIsPopupOpen(false); }}
              className={`category-button ${selectedCategory === 'wrong' ? 'active' : ''}`}
            >
              Wrong answers ({wrongCount})
            </button>

            {categories.map((group, groupIndex) => (
              <div key={groupIndex}>
                <h3>{group.title}</h3>
                {group.items.map(([category, count]) => (
                  <button
                    key={category}
                    onClick={() => { handleCategoryClick(category); setIsPopupOpen(false); }}
                    className={`category-button ${selectedCategory === category ? 'active' : ''}`}
                  >
                    {category} ({count})
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}) 