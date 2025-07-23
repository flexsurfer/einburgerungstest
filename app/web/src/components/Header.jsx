import { useCallback, memo } from 'react'
import { useSubscription, dispatch } from '@flexsurfer/reflex'
import { EVENT_IDS } from 'shared/event-ids'
import { SUB_IDS } from 'shared/sub-ids'
import { Categories } from './Categories.jsx'

import '../styles/Header.css'

export const Header = memo(() => {

  const showVocabulary = useSubscription([SUB_IDS.SHOW_VOCABULARY])
  const theme = useSubscription([SUB_IDS.THEME])

  const toggleVocabulary = useCallback(() => { dispatch([EVENT_IDS.TOGGLE_VOCABULARY]) }, [])
  const toggleTheme = useCallback(() => { dispatch([EVENT_IDS.TOGGLE_THEME]) }, [])

  return (
    <div className="header">

      <Categories />

      <button
        onClick={toggleTheme}
        className={`tab theme-tab ${theme === 'dark' ? 'active' : ''}`}
      >
        {theme === 'dark' ? '🌙' : '🌞'}
      </button>
      
      <button
        onClick={toggleVocabulary}
        className={`tab vocabulary-tab ${showVocabulary ? 'active' : ''}`}
      >
        📖
      </button>
      
    </div>
  )
})