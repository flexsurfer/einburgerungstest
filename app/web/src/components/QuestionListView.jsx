import { useState, useEffect, useRef, memo, useCallback } from 'react'
import { useSubscription, dispatch } from '@flexsurfer/reflex'
import { SUB_IDS } from 'shared/sub-ids'
import { EVENT_IDS } from 'shared/event-ids'
import { QuestionCard } from './QuestionCard.jsx'
import '../styles/QuestionList.css'

export const QuestionListView = memo(() => {
  const filteredQuestions = useSubscription([SUB_IDS.FILTERED_QUESTIONS], "QuestionList")

  const [visibleCount, setVisibleCount] = useState(20)
  const loadMoreRef = useRef(null)
  const [showScrollTop, setShowScrollTop] = useState(false)

  useEffect(() => { setVisibleCount(20) }, [filteredQuestions])

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && visibleCount < filteredQuestions.length) {
        setVisibleCount((prev) => Math.min(prev + 20, filteredQuestions.length))
      }
    }, { threshold: 0.1 })

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current)
    }

    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current)
      }
    }
  }, [visibleCount, filteredQuestions.length])

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = useCallback(() => { dispatch([EVENT_IDS.SCROLL_TO_TOP, 'smooth']) }, [])

  if (!filteredQuestions || filteredQuestions.length === 0) {
    return (
      <div className="empty-questions">
        <p>No questions available</p>
      </div>
    )
  }

  const visibleQuestions = filteredQuestions.slice(0, visibleCount)

  return (
    <div>
      <div style={{ height: '60px' }} />
      <div className="questions-grid">
        {visibleQuestions.map((question) => (
          <QuestionCard key={question.globalIndex} question={question} />
        ))}
        {visibleCount < filteredQuestions.length &&
          <div ref={loadMoreRef} style={{ height: '60px' }} />
        }
      </div>
      {visibleCount >= filteredQuestions.length && <div style={{ height: '60px' }} />}
      {showScrollTop && (
        <button
          className="scroll-top-button"
          onClick={scrollToTop}
        >
          ↑
        </button>
      )}
    </div>
  )
})