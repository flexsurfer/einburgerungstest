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

})