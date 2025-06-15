import { useState, useEffect, useCallback, useMemo } from 'react'
import { Header } from './components/Header'
import { QuestionCard } from './components/QuestionCard'
import './App.css'

function App() {
  // Core application state
  const [questions, setQuestions] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [mode, setMode] = useState('testing')
  const [userAnswers, setUserAnswers] = useState({})
  
  // Initialize favorites from localStorage or empty array if not found
  const [favorites, setFavorites] = useState(() => {
    const savedFavorites = localStorage.getItem('favorites')
    return savedFavorites ? JSON.parse(savedFavorites) : []
  })

  // Effect: Fetch questions data and initialize categories
  // Runs once on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('data.json')
        const data = await response.json()
        
        // Add index to each question
        const questionsWithIndex = data.map((question, index) => ({
          ...question,
          globalIndex: index + 1
        }))
        setQuestions(questionsWithIndex)
        
        // Extract unique categories and count questions
        const categoryCount = questionsWithIndex.reduce((acc, question) => {
          acc[question.category] = (acc[question.category] || 0) + 1
          return acc
        }, {})
        
        // Convert to array and sort by count in descending order
        const sortedCategories = Object.entries(categoryCount)
          .sort((a, b) => b[1] - a[1])
        
        setCategories(sortedCategories)
      } catch (error) {
        console.error('Error loading questions:', error)
      }
    }
    
    fetchData()
  }, [])

  // Effect: Handle scroll position tracking
  // Updates lastScrollY when user scrolls
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [lastScrollY])

  // Effect: Persist favorites to localStorage
  // Runs whenever favorites state changes
  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites))
  }, [favorites])

  // Callback: Handle answer selection in testing mode
  // Updates userAnswers state when an answer is selected
  const handleAnswerSelect = useCallback((questionIndex, selectedAnswerIndex) => {
    if (mode === 'testing') {
      setUserAnswers(prev => ({
        ...prev,
        [questionIndex]: selectedAnswerIndex
      }))
    }
  }, [mode])

  // Callback: Handle mode changes (testing/review)
  // Resets user answers when mode changes
  const handleModeChange = useCallback((newMode) => {
    setMode(newMode)
    setUserAnswers({})
  }, [])

  // Callback: Toggle favorite state for a question
  // Adds or removes question from favorites array
  const handleToggleFavorite = useCallback((questionIndex) => {
    setFavorites(prev =>
      prev.includes(questionIndex)
        ? prev.filter(i => i !== questionIndex)
        : [...prev, questionIndex]
    )
  }, [])

  // Memo: Filter questions based on selected category
  // Returns filtered array of questions for current category or favorites
  const filteredQuestions = useMemo(() => {
    if (selectedCategory === 'favorites') {
      return questions.filter(q => favorites.includes(q.globalIndex))
    }
    return selectedCategory
      ? questions.filter(q => q.category === selectedCategory)
      : questions
  }, [questions, selectedCategory, favorites])

  // Memo: Generate question cards components
  // Updates when filtered questions, mode, answers, or favorites change
  const questionCards = useMemo(() => (
    filteredQuestions.map((question) => (
      <QuestionCard
        key={question.globalIndex}
        question={question}
        isReviewMode={mode === 'review'}
        userAnswer={userAnswers[question.globalIndex]}
        onAnswerSelect={(answerIndex) => handleAnswerSelect(question.globalIndex, answerIndex)}
        isFavorite={favorites.includes(question.globalIndex)}
        onToggleFavorite={handleToggleFavorite}
      />
    ))
  ), [filteredQuestions, mode, userAnswers, handleAnswerSelect, favorites, handleToggleFavorite])

  // Memo: Generate header component
  // Updates when questions, categories, selected category, mode, or favorites change
  const headerMemo = useMemo(() => (
    <Header 
      questions={questions}
      categories={categories}
      selectedCategory={selectedCategory}
      setSelectedCategory={setSelectedCategory}
      currentMode={mode}
      onModeChange={handleModeChange}
      favoriteCount={favorites.length}
    />
  ), [questions, categories, selectedCategory, mode, handleModeChange, favorites.length])

  return (
    <div className="app-container">
      {headerMemo}
      <div className="questions-grid">
        {questionCards}
      </div>
    </div>
  )
}

export default App
