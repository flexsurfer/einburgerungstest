import { Star } from './Star'
import { useSubscription } from '@flexsurfer/reflex'
import { SUB_IDS } from '../sub-ids.js'

export const FavoritesButton = ({ onCategoryClick }) => {

    const selectedCategory = useSubscription([SUB_IDS.SELECTED_CATEGORY])
    const favoriteCount = useSubscription([SUB_IDS.FAVORITE_COUNT])
    
    return (
        <button
            onClick={() => onCategoryClick('favorites')}
            className={`category-button ${selectedCategory === 'favorites' ? 'active' : ''}`}
        >
            <Star />
            Favorites ({favoriteCount})
        </button>
    )
} 