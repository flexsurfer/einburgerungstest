import { describe, it, expect } from 'vitest'
import { getHandler } from '@flexsurfer/reflex'
import { EVENT_IDS } from 'shared/event-ids.js'
import { EFFECT_IDS } from 'shared/effect-ids.js'

import 'shared/events.js'
import '../src/events.js'

describe('Initialize App Event', () => {
  it('should handle initializeApp event with existing data', () => {
    const handler = getHandler('event', EVENT_IDS.INITIALIZE_APP)

    const initialState = {
      userAnswers: {},
      favorites: [],
      showWelcome: true
    }

    const mockLocalStorage = {
      userAnswers: { 1: 0, 2: 1 },
      favorites: [1, 3],
      showWelcome: false,
      theme: 'dark'
    }

    const coeffects = {
      draftDb: initialState,
      localStorage: mockLocalStorage
    }

    const result = handler(coeffects, undefined)

    expect(initialState.userAnswers).toEqual({ 1: 0, 2: 1 })
    expect(initialState.favorites).toEqual([1, 3])
    expect(initialState.showWelcome).toBe(false)
    expect(initialState.theme).toBe('dark')
    expect(result).toEqual([
      [EFFECT_IDS.FETCH, {
        url: 'data.json',
        onSuccess: [EVENT_IDS.FETCH_QUESTIONS_SUCCESS],
        onFailure: [EVENT_IDS.FETCH_QUESTIONS_FAILURE]
      }],
      [EFFECT_IDS.SET_BODY_THEME, { theme: 'dark' }]
    ])
  })

  it('should handle initializeApp event with no existing data', () => {
    const handler = getHandler('event', EVENT_IDS.INITIALIZE_APP)

    const initialState = {
      userAnswers: {},
      favorites: [],
      showWelcome: true
    }

    const mockLocalStorage = {
      theme: 'light'
    }

    const coeffects = {
      draftDb: initialState,
      localStorage: mockLocalStorage
    }

    const result = handler(coeffects, undefined)

    expect(initialState.userAnswers).toEqual({})
    expect(initialState.favorites).toEqual([])
    expect(initialState.showWelcome).toBe(true)
    expect(initialState.theme).toBe('light')
    expect(result).toEqual([
      [EFFECT_IDS.FETCH, {
        url: 'data.json',
        onSuccess: [EVENT_IDS.FETCH_QUESTIONS_SUCCESS],
        onFailure: [EVENT_IDS.FETCH_QUESTIONS_FAILURE]
      }],
      [EFFECT_IDS.SET_BODY_THEME, { theme: 'light' }]
    ])
  })
})

describe('Data Events', () => {

  it('should handle fetchVocabulary event', () => {
    const handler = getHandler('event', EVENT_IDS.FETCH_VOCABULARY)

    const initialState = {
      vocabularyLoading: false,
      vocabularyError: 'previous error'
    }

    const coeffects = {
      draftDb: initialState
    }

    const result = handler(coeffects)

    expect(initialState.vocabularyLoading).toBe(true)
    expect(initialState.vocabularyError).toBe(null)
    expect(result).toEqual([
      [EFFECT_IDS.FETCH, {
        url: 'vocabulary_multilang.json',
        onSuccess: [EVENT_IDS.FETCH_VOCABULARY_SUCCESS],
        onFailure: [EVENT_IDS.FETCH_VOCABULARY_FAILURE]
      }]
    ])
  })
})
