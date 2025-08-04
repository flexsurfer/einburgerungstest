import { memo, useCallback } from 'react'
import { dispatch, useSubscription } from '@flexsurfer/reflex'
import { EVENT_IDS } from 'shared/event-ids'
import { SUB_IDS } from 'shared/sub-ids'
import '../styles/StarButton.css'

export const StarButton = memo(function StarButton({ globalIndex }) {

  const isFavorite = useSubscription([SUB_IDS.IS_FAVORITE_BY_GLOBAL_INDEX, globalIndex], 'StarButton')

  const onClick = useCallback(() => { 
    dispatch([EVENT_IDS.TOGGLE_FAVORITE, globalIndex]) 
  }, [isFavorite, globalIndex])

  return (
    <button
      className={`star-button ${isFavorite ? 'favorite' : ''}`}
      onClick={onClick}
      aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill={isFavorite ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    </button>
  )
}) 