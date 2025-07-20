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
      
      handler(coeffects)
      
      expect(initialState.showVocabulary).toBe(true)
      expect(initialState.vocabularyRender).toBe(true)
      expect(document.body.style.overflow).toBe('hidden')
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
      expect(result).toEqual([[EFFECT_IDS.SCROLL_TO_TOP, null]])
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
}) 