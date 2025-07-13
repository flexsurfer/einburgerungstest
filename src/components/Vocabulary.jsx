import { useMemo, useEffect, memo } from 'react'
import { useSubscription, dispatch } from '@flexsurfer/reflex'  
import '../styles/Vocabulary.css'

const AVAILABLE_LANGUAGES = [
  { id: 'en', label: 'English' },
  { id: 'ru', label: 'Русский' },
  { id: 'ar', label: 'العربية' },
  { id: 'tr', label: 'Türkçe' }
]

export const Vocabulary = memo(function Vocabulary() {

  const selectedLanguage = useSubscription(['selectedLanguage'])
  const vocabularyData = useSubscription(['vocabularyData'])

  // Fetch vocabulary data on component mount
  useEffect(() => {
    if (!vocabularyData) {
      dispatch(['fetchVocabulary'])
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
        onClick={() => dispatch(['setSelectedLanguage', lang.id])}
        className={`lang-button ${selectedLanguage === lang.id ? 'active' : ''}`}
        lang={lang.id}
      >
        {lang.label}
      </button>
    ))
  ), [selectedLanguage])

  return (
    <div className="vocabulary-container">
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
  )
}) 