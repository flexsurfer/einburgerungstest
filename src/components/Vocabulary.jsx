import { useState, useMemo, useEffect } from 'react'
import '../styles/Vocabulary.css'

const AVAILABLE_LANGUAGES = [
  { id: 'en', label: 'English' },
  { id: 'ru', label: 'Русский' },
  { id: 'ar', label: 'العربية' },
  { id: 'tr', label: 'Türkçe' }
]

export function Vocabulary() {
  const [selectedLanguage, setSelectedLanguage] = useState('en')
  const [vocabularyData, setVocabularyData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchVocabulary = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch('/vocabulary_multilang.json')
        if (!response.ok) throw new Error('Failed to fetch vocabulary')
        const data = await response.json()
        setVocabularyData(data)
      } catch (err) {
        setError('Error loading vocabulary')
      } finally {
        setLoading(false)
      }
    }
    fetchVocabulary()
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

  if (loading) return <div className="vocabulary-container">Loading vocabulary...</div>
  if (error) return <div className="vocabulary-container">{error}</div>

  return (
    <div className="vocabulary-container">
      <div className="language-switcher">
        {AVAILABLE_LANGUAGES.map(lang => (
          <button
            key={lang.id}
            onClick={() => setSelectedLanguage(lang.id)}
            className={`lang-button ${selectedLanguage === lang.id ? 'active' : ''}`}
            lang={lang.id}
          >
            {lang.label}
          </button>
        ))}
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
} 