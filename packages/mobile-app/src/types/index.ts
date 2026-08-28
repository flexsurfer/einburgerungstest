export type Answer = string

export interface Question {
  globalIndex: number
  question: string
  category: string
  correct: number
  img?: {
    url: string
    text?: string
  }
  answers: Answer[]
}

export interface UserAnswers {
  [questionIndex: number]: number
}

export interface Favorites {
  [questionIndex: number]: boolean
} 