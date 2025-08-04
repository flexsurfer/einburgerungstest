import { memo } from 'react'
import { QuestionListView } from './QuestionListView.jsx'
import { QuestionCardView } from './QuestionCardView.jsx'
import { useIsMobile } from '../hooks/useIsMobile.js'

export const QuestionView = memo(() => {
  const isMobile = useIsMobile()
  // Render appropriate view based on device type
  if (isMobile) {
    return <QuestionCardView />
  } else {
    return <QuestionListView />
  }
})