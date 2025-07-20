import { describe, it, expect } from 'vitest'
import { getHandler } from '@flexsurfer/reflex'
import { SUB_IDS } from '../src/sub-ids.js'

// Import subs to register them
import '../src/subs.js'

describe('Subscription Handlers', () => {

  describe('Computed Subscriptions', () => {
    it('should handle favoriteCount subscription', () => {
      const handler = getHandler('sub', SUB_IDS.FAVORITE_COUNT)
      
      const favorites = [1, 3, 5, 7]
      const result = handler(favorites)
      
      expect(result).toBe(4)
    })

    it('should handle favoriteCount subscription with empty array', () => {
      const handler = getHandler('sub', SUB_IDS.FAVORITE_COUNT)
      
      const favorites = []
      const result = handler(favorites)
      
      expect(result).toBe(0)
    })

    it('should handle filteredQuestions subscription - no filter', () => {
      const handler = getHandler('sub', SUB_IDS.FILTERED_QUESTIONS)
      
      const questions = [
        { globalIndex: 1, category: 'Politik', question: 'Q1?' },
        { globalIndex: 2, category: 'Geschichte', question: 'Q2?' },
        { globalIndex: 3, category: 'Politik', question: 'Q3?' }
      ]
      const selectedCategory = null
      const favorites = [1]
      
      const result = handler(questions, selectedCategory, favorites)
      
      expect(result).toEqual(questions)
    })

    it('should handle filteredQuestions subscription - filter by category', () => {
      const handler = getHandler('sub', SUB_IDS.FILTERED_QUESTIONS)
      
      const questions = [
        { globalIndex: 1, category: 'Politik', question: 'Q1?' },
        { globalIndex: 2, category: 'Geschichte', question: 'Q2?' },
        { globalIndex: 3, category: 'Politik', question: 'Q3?' }
      ]
      const selectedCategory = 'Politik'
      const favorites = [1]
      
      const result = handler(questions, selectedCategory, favorites)
      
      expect(result).toEqual([
        { globalIndex: 1, category: 'Politik', question: 'Q1?' },
        { globalIndex: 3, category: 'Politik', question: 'Q3?' }
      ])
    })

    it('should handle filteredQuestions subscription - filter by favorites', () => {
      const handler = getHandler('sub', SUB_IDS.FILTERED_QUESTIONS)
      
      const questions = [
        { globalIndex: 1, category: 'Politik', question: 'Q1?' },
        { globalIndex: 2, category: 'Geschichte', question: 'Q2?' },
        { globalIndex: 3, category: 'Politik', question: 'Q3?' }
      ]
      const selectedCategory = 'favorites'
      const favorites = [1, 3]
      
      const result = handler(questions, selectedCategory, favorites)
      
      expect(result).toEqual([
        { globalIndex: 1, category: 'Politik', question: 'Q1?' },
        { globalIndex: 3, category: 'Politik', question: 'Q3?' }
      ])
    })

    it('should handle userAnswerByQuestionIndex subscription - existing answer', () => {
      const handler = getHandler('sub', SUB_IDS.USER_ANSWER_BY_QUESTION_INDEX)
      
      const userAnswers = { 1: 0, 2: 1, 3: 2 }
      const questionIndex = 2
      
      const result = handler(userAnswers, questionIndex)
      
      expect(result).toBe(1)
    })

    it('should handle userAnswerByQuestionIndex subscription - non-existing answer', () => {
      const handler = getHandler('sub', SUB_IDS.USER_ANSWER_BY_QUESTION_INDEX)
      
      const userAnswers = { 1: 0, 2: 1 }
      const questionIndex = 5
      
      const result = handler(userAnswers, questionIndex)
      
      expect(result).toBeUndefined()
    })

    it('should handle isFavoriteByGlobalIndex subscription - is favorite', () => {
      const handler = getHandler('sub', SUB_IDS.IS_FAVORITE_BY_GLOBAL_INDEX)
      
      const favorites = [1, 3, 5]
      const globalIndex = 3
      
      const result = handler(favorites, globalIndex)
      
      expect(result).toBe(true)
    })

    it('should handle isFavoriteByGlobalIndex subscription - not favorite', () => {
      const handler = getHandler('sub', SUB_IDS.IS_FAVORITE_BY_GLOBAL_INDEX)
      
      const favorites = [1, 3, 5]
      const globalIndex = 4
      
      const result = handler(favorites, globalIndex)
      
      expect(result).toBe(false)
    })

    it('should handle statistics subscription - with answers', () => {
      const handler = getHandler('sub', SUB_IDS.STATISTICS)
      
      const userAnswers = { 1: 0, 2: 1, 3: 2 } // 1 correct, 2 incorrect
      const filteredQuestions = [
        { globalIndex: 1, correct: 0 }, // correct
        { globalIndex: 2, correct: 0 }, // incorrect
        { globalIndex: 3, correct: 1 }, // incorrect
        { globalIndex: 4, correct: 0 }  // not answered
      ]
      
      const result = handler(userAnswers, filteredQuestions)
      
      expect(result).toEqual({
        correct: 1,
        incorrect: 2,
        totalAnswered: 3,
        totalVisible: 4,  
        accuracy: '33.3',
        passed: false
      })
    })

    it('should handle statistics subscription - no answers', () => {
      const handler = getHandler('sub', SUB_IDS.STATISTICS)
      
      const userAnswers = {}
      const filteredQuestions = [
        { globalIndex: 1, correct: 0 },
        { globalIndex: 2, correct: 1 }
      ]
      
      const result = handler(userAnswers, filteredQuestions)
      
      expect(result).toEqual({
        correct: 0,
        incorrect: 0,
        totalAnswered: 0,
        totalVisible: 2,
        accuracy: 0,
        passed: false
      })
    })

    it('should handle statistics subscription - all correct', () => {
      const handler = getHandler('sub', SUB_IDS.STATISTICS)
      
      const userAnswers = { 1: 0, 2: 1 }
      const filteredQuestions = [
        { globalIndex: 1, correct: 0 }, // correct
        { globalIndex: 2, correct: 1 }  // correct
      ]
      
      const result = handler(userAnswers, filteredQuestions)
      
      expect(result).toEqual({
        correct: 2,
        incorrect: 0,
        totalAnswered: 2,
        totalVisible: 2,
        accuracy: '100.0',
        passed: true
      })
    })

    it('should handle statistics subscription - empty questions', () => {
      const handler = getHandler('sub', SUB_IDS.STATISTICS)
      
      const userAnswers = { 1: 0 }
      const filteredQuestions = []
      
      const result = handler(userAnswers, filteredQuestions)
      
      expect(result).toEqual({
        correct: 0,
        incorrect: 0,
        totalAnswered: 0,
        totalVisible: 0,
        accuracy: 0,
        passed: false
      })
    })
  })
}) 