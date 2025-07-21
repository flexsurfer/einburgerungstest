import { memo } from 'react'
import { StarButton } from './StarButton'
import { AnswerList } from './AnswerList'

import '../styles/QuestionCard.css'

export const QuestionCard = memo(({ question }) => {
  
  return (
    <div className="question-card">
      <div className="question-badge">
        {question.globalIndex}
      </div>
      <div className="question-header">
        <h3 className="question-text">{question.question}</h3>
        <StarButton globalIndex={question.globalIndex} />
      </div>
      {question.img && (
        <div className="question-image-container">
          <img
            loading="lazy"
            src={"img/" + question.img.url + ".png"}
            alt={`Question ${question.globalIndex} illustration`}
            className="question-image"
          />
          {question.img.text && (
            <p className="question-image-text">{question.img.text}</p>
          )}
        </div>
      )}
      <AnswerList question={question} />
      <div className="question-category">
        {question.category}
      </div>
    </div>
  )
})