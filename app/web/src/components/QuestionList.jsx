import { useSubscription } from '@flexsurfer/reflex'
import { QuestionCard } from './QuestionCard.jsx'
import { useState, useEffect, useRef, memo } from 'react'
import { SUB_IDS } from '/shared/sub-ids'

export const QuestionList = memo(() => {
    
    const filteredQuestions = useSubscription([SUB_IDS.FILTERED_QUESTIONS])
    
    const [visibleCount, setVisibleCount] = useState(20)
    const loadMoreRef = useRef(null)
    
    useEffect(() => {setVisibleCount(20)}, [filteredQuestions])
    
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
    
    const visibleQuestions = filteredQuestions.slice(0, visibleCount)
    
    return (
        <div className="questions-grid">
            {visibleQuestions.map((question) => (
                <QuestionCard key={question.globalIndex} question={question} />
            ))}
            {visibleCount < filteredQuestions.length && (
              <div ref={loadMoreRef} style={{ height: '20px' }} />
            )}
        </div>
    )
}) 