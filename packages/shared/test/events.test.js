import { describe, it, expect } from 'vitest'
import { getHandler } from '@flexsurfer/reflex'
import { createDraft } from 'immer'
import { EVENT_IDS } from '../src/event-ids.js'
import { EFFECT_IDS } from '../src/effect-ids.js'

// Import events to register them
import '../src/events.js'

describe('Event Handlers', () => {

  describe('UI Events', () => {
    it('should handle setShowWelcome event', () => {
      const handler = getHandler('event', EVENT_IDS.SET_SHOW_WELCOME)

      const initialState = {
        showWelcome: true
      }

      const coeffects = {
        draftDb: initialState,
        localStorage: {}
      }

      const result = handler(coeffects, false)

      expect(initialState.showWelcome).toBe(false)
      expect(result).toEqual([[EFFECT_IDS.LOCAL_STORAGE_SET, { key: 'showWelcome', value: false }]])
    })

    it('should handle toggleShowAnswers event', () => {
      const handler = getHandler('event', EVENT_IDS.TOGGLE_SHOW_ANSWERS)

      const initialState = {
        showAnswers: false
      }

      const coeffects = {
        draftDb: initialState
      }

      const result = handler(coeffects)

      expect(initialState.showAnswers).toBe(true)
      expect(result).toBeUndefined()
    })

    it('should handle toggleVocabulary event - opening vocabulary', () => {
      const handler = getHandler('event', EVENT_IDS.TOGGLE_VOCABULARY)

      const initialState = {
        showVocabulary: false,
        vocabularyRender: false
      }

      const coeffects = {
        draftDb: initialState
      }

      const result = handler(coeffects)

      expect(initialState.showVocabulary).toBe(true)
      expect(initialState.vocabularyRender).toBe(true)
      expect(result).toEqual([[EFFECT_IDS.SET_BODY_OVERFLOW, { value: "hidden" }]])
    })

    it('should handle toggleVocabulary event - closing vocabulary', () => {
      const handler = getHandler('event', EVENT_IDS.TOGGLE_VOCABULARY)

      const initialState = {
        showVocabulary: true,
        vocabularyRender: true
      }

      const coeffects = {
        draftDb: initialState
      }

      handler(coeffects)

      expect(initialState.showVocabulary).toBe(false)
    })

    it('should handle vocabularyUnmount event', () => {
      const handler = getHandler('event', EVENT_IDS.VOCABULARY_UNMOUNT)

      const initialState = {
        vocabularyRender: true
      }

      const coeffects = {
        draftDb: initialState
      }

      handler(coeffects)

      expect(initialState.vocabularyRender).toBe(false)
      expect(document.body.style.overflow).toBe('auto')
    })

    it('should handle setSelectedCategory event', () => {
      const handler = getHandler('event', EVENT_IDS.SET_SELECTED_CATEGORY)

      const initialState = {
        selectedCategory: null
      }

      const coeffects = {
        draftDb: initialState
      }

      const result = handler(coeffects, 'Politik')

      expect(initialState.selectedCategory).toBe('Politik')
      expect(result).toEqual([[EFFECT_IDS.SCROLL_TO_TOP]])
    })

    it('should handle setSelectedLanguage event', () => {
      const handler = getHandler('event', EVENT_IDS.SET_SELECTED_LANGUAGE)

      const initialState = {
        selectedLanguage: 'en'
      }

      const coeffects = {
        draftDb: initialState
      }

      handler(coeffects, 'de')

      expect(initialState.selectedLanguage).toBe('de')
    })
  })

  describe('User Actions Events', () => {
    it('should handle answerQuestion event', () => {
      const handler = getHandler('event', EVENT_IDS.ANSWER_QUESTION)

      const initialState = {
        userAnswers: { 1: 0 }
      }

      const draftDb = createDraft(initialState)

      const coeffects = {
        draftDb: draftDb
      }

      const result = handler(coeffects, 2, 1)

      expect(draftDb.userAnswers[2]).toBe(1)
      expect(result).toEqual([[EFFECT_IDS.LOCAL_STORAGE_SET, { key: 'userAnswers', value: { 1: 0, 2: 1 } }]])
    })

    it('should handle toggleFavorite event - add to favorites', () => {
      const handler = getHandler('event', EVENT_IDS.TOGGLE_FAVORITE)

      const initialState = {
        favorites: [1, 3]
      }

      const draftDb = createDraft(initialState)

      const coeffects = {
        draftDb: draftDb
      }

      const result = handler(coeffects, 2)

      expect(draftDb.favorites).toEqual([1, 3, 2])
      expect(result).toEqual([[EFFECT_IDS.LOCAL_STORAGE_SET, { key: 'favorites', value: [1, 3, 2] }]])
    })

    it('should handle toggleFavorite event - remove from favorites', () => {
      const handler = getHandler('event', EVENT_IDS.TOGGLE_FAVORITE)

      const initialState = {
        favorites: [1, 2, 3]
      }

      const draftDb = createDraft(initialState)

      const coeffects = {
        draftDb: draftDb
      }

      const result = handler(coeffects, 2)

      expect(draftDb.favorites).toEqual([1, 3])
      expect(result).toEqual([[EFFECT_IDS.LOCAL_STORAGE_SET, { key: 'favorites', value: [1, 3] }]])
    })

    it('should handle clearAnswers event', () => {
      const handler = getHandler('event', EVENT_IDS.CLEAR_ANSWERS)

      const initialState = {
        userAnswers: { 1: 0, 2: 1, 3: 2 }
      }

      const coeffects = {
        draftDb: initialState
      }

      const result = handler(coeffects)

      expect(initialState.userAnswers).toEqual({})
      expect(result).toEqual([[EFFECT_IDS.LOCAL_STORAGE_REMOVE, { key: 'userAnswers' }]])
    })
  })

  it('should handle fetchQuestionsSuccess event', () => {
    const handler = getHandler('event', EVENT_IDS.FETCH_QUESTIONS_SUCCESS)

    const initialState = {
        questionsLoading: true,
        questionsLoaded: false,
        questionsError: 'error',
        questions: [],
        categories: []
    }

    const coeffects = {
        draftDb: initialState
    }

    const mockData = [
        { id: 1, question: 'Question 1', category: 'Politik', answers: ['A', 'B', 'C'], correct: 0 },
        { id: 2, question: 'Question 2', category: 'Geschichte', answers: ['A', 'B', 'C'], correct: 1 },
        { id: 3, question: 'Question 3', category: 'Politik', answers: ['A', 'B', 'C'], correct: 2 }
    ]

    handler(coeffects, mockData)

    expect(initialState.questionsLoading).toBe(false)
    expect(initialState.questionsLoaded).toBe(true)
    expect(initialState.questionsError).toBe(null)
    expect(initialState.questions).toHaveLength(3)
    expect(initialState.questions[0].globalIndex).toBe(1)
    expect(initialState.questions[1].globalIndex).toBe(2)
    expect(initialState.questions[2].globalIndex).toBe(3)

    // Check categories are sorted by count
    expect(initialState.categories).toEqual([
        ['Politik', 2],
        ['Geschichte', 1]
    ])
})

it('should handle fetchQuestionsFailure event', () => {
    const handler = getHandler('event', EVENT_IDS.FETCH_QUESTIONS_FAILURE)

    const initialState = {
        questionsLoading: true,
        questionsError: null
    }

    const coeffects = {
        draftDb: initialState
    }

    const error = new Error('Network error')

    handler(coeffects, error)

    expect(initialState.questionsLoading).toBe(false)
    expect(initialState.questionsError).toBe(error)
})

  it('should handle fetchVocabularySuccess event', () => {
    const handler = getHandler('event', EVENT_IDS.FETCH_VOCABULARY_SUCCESS)

    const initialState = {
        vocabularyLoading: true,
        vocabularyError: 'error',
        vocabularyData: null
    }

    const coeffects = {
        draftDb: initialState
    }

    const mockData = { terms: ['term1', 'term2'] }

    handler(coeffects, mockData)

    expect(initialState.vocabularyLoading).toBe(false)
    expect(initialState.vocabularyError).toBe(null)
    expect(initialState.vocabularyData).toBe(mockData)
})

it('should handle fetchVocabularyFailure event', () => {
    const handler = getHandler('event', EVENT_IDS.FETCH_VOCABULARY_FAILURE)

    const initialState = {
        vocabularyLoading: true,
        vocabularyError: null
    }

    const coeffects = {
        draftDb: initialState
    }

    const error = new Error('Network error')

    handler(coeffects, error)

    expect(initialState.vocabularyLoading).toBe(false)
    expect(initialState.vocabularyError).toBe(error)
})
}) 