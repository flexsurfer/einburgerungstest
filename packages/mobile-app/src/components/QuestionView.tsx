import React, { memo } from 'react'
import { QuestionListView } from './QuestionListView'
import { QuestionCardView } from './QuestionCardView'
import { useIsTablet } from '../hooks/useIsTablet'

export const QuestionView = memo(() => {
  
  const isTabletDevice = useIsTablet()

  // Render appropriate view based on device type
  if (isTabletDevice) {
    return <QuestionListView  />
  } else {
    return <QuestionCardView />
  }
})