import { memo } from 'react'
import { useSubscription } from '@flexsurfer/reflex'
import { SUB_IDS } from 'shared/sub-ids'
import { QuestionCard } from './QuestionCard.jsx'
import { NavigationControls } from './NavigationControls.jsx'
import { QuestionPicker } from './QuestionPicker.jsx'
import '../styles/QuestionList.css'

export const QuestionCardView = memo(() => {
  const currentQuestion = useSubscription([SUB_IDS.CURRENT_QUESTION], "QuestionCardView")

  if (!currentQuestion) {
    return (
      <div className="loading-question">
        <p>Loading question...</p>
      </div>
    )
  }

  return (
    <div className="mobile-question-container">
      <div style={{ height: '40px' }} />
      <div className="single-question-wrapper">
        <QuestionCard key={currentQuestion.globalIndex} question={currentQuestion}   />
      </div>
      <NavigationControls isVisible={true} />
      <QuestionPicker />
    </div>
  )
})