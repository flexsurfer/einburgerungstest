import { regEvent } from '@flexsurfer/reflex'
import { EVENT_IDS } from 'shared/event-ids'
import { EFFECT_IDS } from 'shared/effect-ids'

// Initialize application, load data from localStorage, fetch questions from data.json
regEvent(EVENT_IDS.INITIALIZE_APP,
    ({ draftDb, localStorage }) => {
        draftDb.userAnswers = localStorage?.userAnswers || {}
        draftDb.favorites = localStorage?.favorites || []
        draftDb.showWelcome = localStorage?.showWelcome ?? true
        draftDb.theme = localStorage?.theme || 'light'

        draftDb.questionsLoading = true
        draftDb.questionsError = null

        return [
            [EFFECT_IDS.FETCH, {
                url: 'data.json',
                onSuccess: [EVENT_IDS.FETCH_QUESTIONS_SUCCESS],
                onFailure: [EVENT_IDS.FETCH_QUESTIONS_FAILURE]
            }],
            [EFFECT_IDS.SET_BODY_THEME, { theme: draftDb.theme }]
        ]
    },
    [[EFFECT_IDS.LOCAL_STORAGE_GET, 'userAnswers'], [EFFECT_IDS.LOCAL_STORAGE_GET, 'favorites'], [EFFECT_IDS.LOCAL_STORAGE_GET, 'showWelcome'], [EFFECT_IDS.LOCAL_STORAGE_GET, 'theme']]
)

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
