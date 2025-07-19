import { describe, it, expect } from 'vitest'
import { getHandler } from '@flexsurfer/reflex'
import { createDraft } from 'immer'
import { EVENT_IDS } from 'shared/event-ids.js'
import { EFFECT_IDS } from 'shared/effect-ids.js'

import '../src/events.ts'
import 'shared/events.ts'

describe('Initialize App Event', () => {
    it('should handle initializeApp event', () => {
        const handler = getHandler('event', EVENT_IDS.INITIALIZE_APP)

        const initialState: any = {}
        const draftDb = createDraft(initialState)

        const coeffects = {
            draftDb
        }

        const result = handler(coeffects, undefined)

        expect(draftDb.storageLoading).toEqual({
            userAnswers: null,
            favorites: null,
            showWelcome: null,
            loadedCount: 0
        })
        expect(result).toEqual([
            [EFFECT_IDS.LOCAL_STORAGE_GET, {
                key: 'userAnswers',
                onSuccess: [EVENT_IDS.STORAGE_LOADED],
                onFailure: [EVENT_IDS.STORAGE_LOAD_FAILED]
            }],
            [EFFECT_IDS.LOCAL_STORAGE_GET, {
                key: 'favorites',
                onSuccess: [EVENT_IDS.STORAGE_LOADED],
                onFailure: [EVENT_IDS.STORAGE_LOAD_FAILED]
            }],
            [EFFECT_IDS.LOCAL_STORAGE_GET, {
                key: 'showWelcome',
                onSuccess: [EVENT_IDS.STORAGE_LOADED],
                onFailure: [EVENT_IDS.STORAGE_LOAD_FAILED]
            }]
        ])
    })
})

describe('Data Events', () => {
    it('should handle fetchQuestions event', () => {
        const handler = getHandler('event', EVENT_IDS.FETCH_QUESTIONS)

        const initialState = {
            questionsLoading: false,
            questionsError: 'previous error'
        }

        const coeffects = {
            draftDb: initialState
        }

        const result = handler(coeffects, undefined)

        expect(initialState.questionsLoading).toBe(true)
        expect(initialState.questionsError).toBe(null)
        expect(result).toEqual([
            [EFFECT_IDS.LOAD_LOCAL_DATA, {
                dataType: 'questions',
                onSuccess: [EVENT_IDS.FETCH_QUESTIONS_SUCCESS],
                onFailure: [EVENT_IDS.FETCH_QUESTIONS_FAILURE]
            }]
        ])
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

    it('should handle fetchVocabulary event', () => {
        const handler = getHandler('event', EVENT_IDS.FETCH_VOCABULARY)

        const initialState = {
            vocabularyLoading: false,
            vocabularyError: 'previous error'
        }

        const coeffects = {
            draftDb: initialState
        }

        const result = handler(coeffects, undefined)

        expect(initialState.vocabularyLoading).toBe(true)
        expect(initialState.vocabularyError).toBe(null)
        expect(result).toEqual([
            [EFFECT_IDS.LOAD_LOCAL_DATA, {
                dataType: 'vocabulary',
                onSuccess: [EVENT_IDS.FETCH_VOCABULARY_SUCCESS],
                onFailure: [EVENT_IDS.FETCH_VOCABULARY_FAILURE]
            }]
        ])
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