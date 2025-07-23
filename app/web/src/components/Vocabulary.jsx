import { useMemo, useEffect, memo } from 'react'
import { useSubscription, dispatch } from '@flexsurfer/reflex'  
import { EVENT_IDS } from 'shared/event-ids'
import { SUB_IDS } from 'shared/sub-ids'
import '../styles/Vocabulary.css'

const AVAILABLE_LANGUAGES = [
  { id: 'en', label: 'English' },
  { id: 'ru', label: 'Русский' },
  { id: 'ar', label: 'العربية' },
  { id: 'tr', label: 'Türkçe' }
]

export const Vocabulary = memo(function Vocabulary() {

  const selectedLanguage = useSubscription([SUB_IDS.SELECTED_LANGUAGE])
  const vocabularyData = useSubscription([SUB_IDS.VOCABULARY_DATA])
  const showVocabulary = useSubscription([SUB_IDS.SHOW_VOCABULARY])
  
  // Handle unmounting after closing animation
  useEffect(() => {
    if (!showVocabulary) {
      const timer = setTimeout(() => {
        dispatch([EVENT_IDS.VOCABULARY_UNMOUNT])
      }, 300) // Match animation duration
      
      return () => clearTimeout(timer)
    }
  }, [showVocabulary])

  // Fetch vocabulary data on component mount
  useEffect(() => {
    if (!vocabularyData) {
      dispatch([EVENT_IDS.FETCH_VOCABULARY])
    }
  }, [])

  const vocabularyItems = useMemo(() => {
    if (!vocabularyData) return []
    const items = []
    Object.entries(vocabularyData).forEach(([category, words]) => {
      items.push({ type: 'category', text: category })
      words.forEach(word => {
        items.push({
          type: 'word',
          de: word.de,
          translation: word[selectedLanguage]
        })
      })
    })
    return items
  }, [vocabularyData, selectedLanguage])

  const languageButtons = useMemo(() => (
    AVAILABLE_LANGUAGES.map(lang => (
      <button
        key={lang.id}
        onClick={() => dispatch([EVENT_IDS.SET_SELECTED_LANGUAGE, lang.id])}
        className={`lang-button ${selectedLanguage === lang.id ? 'active' : ''}`}
        lang={lang.id}
      >
        {lang.label}
      </button>
    ))
  ), [selectedLanguage])

  const closeVocabulary = () => {
    dispatch([EVENT_IDS.TOGGLE_VOCABULARY])
  }

  return (
    <div className={`vocabulary-overlay ${!showVocabulary ? 'closing' : ''}`}>
      <div className="vocabulary-backdrop" onClick={closeVocabulary}></div>
      <div className={`vocabulary-container ${!showVocabulary ? 'closing' : ''}`}>
        <div className="vocabulary-header">
          <h2>Vocabulary</h2>
          <button className="close-button" onClick={closeVocabulary}>×</button>
        </div>
        <div className="language-switcher">
          {languageButtons}
        </div>
        <div className="vocabulary-list">
          {vocabularyItems.map((item, index) => (
            item.type === 'category' ? (
              <div key={index} className="vocabulary-item category">{item.text}</div>
            ) : (
              <div key={index} className="vocabulary-item word">
                {item.de} <span className="separator"> – </span> <span lang={selectedLanguage}>{item.translation}</span>
              </div>
            )
          ))}
        </div>
      </div>
    </div>
  )
}) 