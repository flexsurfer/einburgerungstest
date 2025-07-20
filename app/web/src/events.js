import { regEvent } from '@flexsurfer/reflex'
import { EVENT_IDS } from 'shared/event-ids'
import { EFFECT_IDS } from 'shared/effect-ids'

// Initialize application, load data from localStorage, fetch questions from data.json
regEvent(EVENT_IDS.INITIALIZE_APP,
    ({ draftDb, localStorage }) => {
        draftDb.userAnswers = localStorage?.userAnswers || {}
        draftDb.favorites = localStorage?.favorites || []
        draftDb.showWelcome = localStorage?.showWelcome ?? true

        return [
            ['dispatch', [EVENT_IDS.FETCH_QUESTIONS]]
        ]
    },
    [[EFFECT_IDS.LOCAL_STORAGE_GET, 'userAnswers'], [EFFECT_IDS.LOCAL_STORAGE_GET, 'favorites'], [EFFECT_IDS.LOCAL_STORAGE_GET, 'showWelcome']]
)

regEvent(EVENT_IDS.FETCH_QUESTIONS, ({ draftDb }) => {
    draftDb.questionsLoading = true
    draftDb.questionsError = null
    return [
        [EFFECT_IDS.FETCH, {
            url: 'data.json',
            onSuccess: [EVENT_IDS.FETCH_QUESTIONS_SUCCESS],
            onFailure: [EVENT_IDS.FETCH_QUESTIONS_FAILURE]
        }]
    ]
})

regEvent(EVENT_IDS.FETCH_VOCABULARY, ({ draftDb }) => {
    draftDb.vocabularyLoading = true
    draftDb.vocabularyError = null
    return [
        [EFFECT_IDS.FETCH, {
            url: 'vocabulary_multilang.json',
            onSuccess: [EVENT_IDS.FETCH_VOCABULARY_SUCCESS],
            onFailure: [EVENT_IDS.FETCH_VOCABULARY_FAILURE]
        }]
    ]
})

regEvent(EVENT_IDS.REQUEST_CLEAR_ANSWERS, () => {
    return [[EFFECT_IDS.CONFIRM_CLEAR, null]]
})